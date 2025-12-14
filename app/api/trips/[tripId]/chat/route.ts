import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAIClient } from "@/lib/openai";
import { moderateMessage, getRedirectMessage } from "@/lib/chat-moderation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Load trip data
    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .select("title, start_date, end_date, destination_name")
      .eq("id", tripId)
      .single();

    if (tripError || !tripData) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 }
      );
    }

    type TripQueryResult = {
      title: string
      start_date: string
      end_date: string
      destination_name: string | null
    }

    const trip = tripData as TripQueryResult;

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

