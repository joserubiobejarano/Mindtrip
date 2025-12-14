import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfileId } from "@/lib/auth/getProfileId";
import { getOpenAIClient } from "@/lib/openai";
import { moderateMessage, getRedirectMessage } from "@/lib/chat-moderation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  let profileId: string | undefined;
  let tripId: string | undefined;

  try {
    tripId = (await params).tripId;
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get profile ID for authorization
    try {
      const authResult = await getProfileId(supabase);
      profileId = authResult.profileId;
    } catch (authError: any) {
      console.error('[Chat API]', {
        path: '/api/trips/[tripId]/chat',
        method: 'POST',
        error: authError?.message || 'Failed to get profile',
        tripId,
      });
      return NextResponse.json(
        { error: authError?.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user has access to trip
    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .select("id, title, start_date, end_date, destination_name, owner_id")
      .eq("id", tripId)
      .single();

    if (tripError || !tripData) {
      console.error('[Chat API]', {
        path: '/api/trips/[tripId]/chat',
        method: 'POST',
        tripId,
        profileId,
        error: tripError?.message || 'Trip not found',
        errorCode: tripError?.code,
        context: 'trip_lookup',
      });
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 }
      );
    }

    type TripQueryResult = {
      id: string
      title: string
      start_date: string
      end_date: string
      destination_name: string | null
      owner_id: string
    }

    const trip = tripData as TripQueryResult;

    // Check if user is owner or member
    const { data: member } = await supabase
      .from("trip_members")
      .select("id")
      .eq("trip_id", tripId)
      .eq("user_id", profileId)
      .single();

    if (trip.owner_id !== profileId && !member) {
      console.error('[Chat API]', {
        path: '/api/trips/[tripId]/chat',
        method: 'POST',
        tripId,
        profileId,
        error: 'Forbidden: User does not have access to this trip',
        check_failed: trip.owner_id !== profileId ? 'not_owner' : 'not_member',
        trip_owner_id: trip.owner_id,
        is_member: !!member,
        context: 'authorization_check',
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }


    // Load recent chat messages (last 10)
    const { data: recentMessagesData, error: messagesError } = await supabase
      .from("trip_chat_messages")
      .select("role, content")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (messagesError) {
      console.error("Error loading chat messages:", messagesError);
      // Continue without previous messages
    }

    type MessageQueryResult = {
      role: string
      content: string
    }

    const recentMessages = (recentMessagesData || []) as MessageQueryResult[];

    // Save user message
    const { error: saveUserError } = await (supabase
      .from("trip_chat_messages") as any)
      .insert({
        trip_id: tripId,
        user_id: profileId,
        role: "user",
        content: message,
      });

    if (saveUserError) {
      console.error("Error saving user message:", saveUserError);
      // Continue anyway
    }

    // Pre-process: Check message safety and topic relevance
    const moderationResult = await moderateMessage(message);
    
    if (moderationResult.shouldBlock) {
      // Return redirect message without calling main AI
      const redirectMessage = getRedirectMessage();
      
      // Save redirect response to chat history
      const { error: saveRedirectError } = await (supabase
        .from("trip_chat_messages") as any)
        .insert({
          trip_id: tripId,
          user_id: profileId,
          role: "assistant",
          content: redirectMessage,
        });

      if (saveRedirectError) {
        console.error("Error saving redirect message:", saveRedirectError);
      }

      // Log the moderation reason for monitoring
      if (moderationResult.reason) {
        console.log(`Message blocked: ${moderationResult.reason}`);
      }

      return NextResponse.json({ message: redirectMessage });
    }

    // Build context for GPT
    const destination = trip.destination_name || trip.title;
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);
    
    // Format recent messages for context
    const conversationHistory = recentMessages
      ? recentMessages.reverse().map((m) => `${m.role}: ${m.content}`).join("\n")
      : "";

    const prompt = `You are a helpful travel planning assistant for Kruno. The user is planning a trip to ${destination} from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}.

${conversationHistory ? `Recent conversation:\n${conversationHistory}\n` : ""}

User's current question: ${message}

Please provide a helpful response. Be concise and practical. If the user asks about modifying the itinerary, you can suggest changes but note that full itinerary updates will be handled separately.

Respond in a friendly, conversational tone.`;

    // Call OpenAI
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a travel planning assistant for Kruno. You ONLY help with trip planning, itinerary adjustments, destination information, activity suggestions, and travel-related questions.

If asked about anything unrelated to travel or trip planning, politely redirect: "I can't help you with that, but I can help with planning your trip activities, suggesting places to visit, or adjusting your itinerary."

Do not engage in personal conversations, flirting, or discussions unrelated to travel. Maintain a professional, helpful tone focused on travel planning.

Be concise and practical in your responses.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const assistantMessage = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

    // Save assistant message
    const { error: saveAssistantError } = await (supabase
      .from("trip_chat_messages") as any)
      .insert({
        trip_id: tripId,
        user_id: profileId,
        role: "assistant",
        content: assistantMessage,
      });

    if (saveAssistantError) {
      console.error("Error saving assistant message:", saveAssistantError);
    }

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error("Error in /api/trips/[tripId]/chat:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

