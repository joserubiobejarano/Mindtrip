import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAIClient } from "@/lib/openai";
import { moderateMessage, getRedirectMessage } from "@/lib/chat-moderation";
import { getSmartItinerary } from "@/lib/supabase/smart-itineraries-server";
import { getTripSegments } from "@/lib/supabase/trip-segments";

interface AssistantRequest {
  message: string;
  activeSegmentId?: string;
  activeDayId?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tripId } = await params;
    const body: AssistantRequest = await request.json();
    const { message, activeSegmentId, activeDayId } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Auth & trip access check
    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .select("id, title, start_date, end_date, destination_name, owner_id")
      .eq("id", tripId)
      .single();

    if (tripError || !tripData) {
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

    // Check if user has access to trip
    const { data: member } = await supabase
      .from("trip_members")
      .select("id")
      .eq("trip_id", tripId)
      .eq("user_id", userId)
      .single();

    if (trip.owner_id !== userId && !member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Moderation & topic relevance
    const moderationResult = await moderateMessage(message);

    if (moderationResult.shouldBlock) {
      const redirectMessage = getRedirectMessage();

      // Save redirect response
      await (supabase.from("trip_chat_messages") as any).insert({
        trip_id: tripId,
        user_id: userId,
        role: "assistant",
        content: redirectMessage,
      });

      if (moderationResult.reason) {
        console.log(`Message blocked: ${moderationResult.reason}`);
      }

      return NextResponse.json({
        reply: redirectMessage,
        meta: { usedSegments: [], suggestions: [] },
      });
    }

    // 3. Load trip context
    const destination = trip.destination_name || trip.title;
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);

    // Load segments
    const { data: segments } = await getTripSegments(tripId);
    const isMultiCity = segments && segments.length > 1;

    // Load smart itinerary
    let itineraryContext = "";
    if (activeSegmentId) {
      // Load itinerary for specific segment
      const { data: segmentItineraryRaw } = await supabase
        .from("smart_itineraries")
        .select("content")
        .eq("trip_id", tripId)
        .eq("trip_segment_id", activeSegmentId)
        .maybeSingle();

      type SegmentItineraryQueryResult = {
        content: any
      }

      const segmentItinerary = segmentItineraryRaw as SegmentItineraryQueryResult | null;

      if (segmentItinerary?.content) {
        itineraryContext = JSON.stringify(segmentItinerary.content, null, 2);
      }
    } else {
      // Load trip-level itinerary (for single-city or overview)
      const { data: tripItinerary } = await getSmartItinerary(tripId);
      if (tripItinerary) {
        itineraryContext = JSON.stringify(tripItinerary, null, 2);
      }
    }

    // Load days and activities for context
    let daysContext = "";
    if (activeDayId) {
      const { data: dayData, error: dayError } = await supabase
        .from("days")
        .select("id, date, day_number, trip_segment_id")
        .eq("id", activeDayId)
        .single();

      type DayQueryResult = {
        id: string
        date: string
        day_number: number
        trip_segment_id: string | null
      }

      const day = dayData as DayQueryResult | null;

      if (!dayError && day) {
        const { data: activitiesData } = await supabase
          .from("activities")
          .select("title, start_time, end_time, notes")
          .eq("day_id", activeDayId)
          .order("start_time", { ascending: true });

        type ActivityQueryResult = {
          title: string
          start_time: string | null
          end_time: string | null
          notes: string | null
        }

        const activities = (activitiesData || []) as ActivityQueryResult[];

        daysContext = `Current day: ${day.date} (Day ${day.day_number})\n`;
        if (activities && activities.length > 0) {
          daysContext += `Activities:\n${activities
            .map(
              (a) =>
                `- ${a.title}${a.start_time ? ` (${a.start_time}${a.end_time ? ` - ${a.end_time}` : ""})` : ""}`
            )
            .join("\n")}`;
        }
      }
    } else {
      // Load recent days for context
      const { data: recentDaysData } = await supabase
        .from("days")
        .select("id, date, day_number")
        .eq("trip_id", tripId)
        .order("date", { ascending: true })
        .limit(5);

      type RecentDayQueryResult = {
        id: string
        date: string
        day_number: number
      }

      const recentDays = (recentDaysData || []) as RecentDayQueryResult[];

      if (recentDays && recentDays.length > 0) {
        daysContext = `Upcoming days:\n${recentDays
          .map((d) => `- ${d.date} (Day ${d.day_number})`)
          .join("\n")}`;
      }
    }

    // Load recent chat messages (3-5 most recent pairs)
    const { data: recentMessagesData } = await supabase
      .from("trip_chat_messages")
      .select("role, content")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false })
      .limit(10);

    type MessageQueryResult = {
      role: string
      content: string
    }

    const recentMessages = (recentMessagesData || []) as MessageQueryResult[];

    // 4. Build OpenAI request
    const systemPrompt = `You are the Kruno Travel Assistant for a single trip.

You can ONLY talk about travel, this specific trip, its cities, activities, food, logistics, and budgeting.

If the user asks about anything else, politely refuse and redirect to helping with the trip.

You have JSON context of the current itinerary. Reference specific days and places when answering.

Prefer small, concrete adjustments (move / swap / add a place) instead of fully regenerating the trip, unless the user explicitly asks.

Be concise, helpful, and practical.`;

    const contextParts = [];
    if (isMultiCity && segments) {
      contextParts.push(
        `Trip segments:\n${segments
          .map(
            (s) =>
              `- ${s.city_name} (${s.start_date} to ${s.end_date}, ${s.order_index + 1}/${segments.length})`
          )
          .join("\n")}`
      );
    }
    if (itineraryContext) {
      contextParts.push(`Current itinerary:\n${itineraryContext}`);
    }
    if (daysContext) {
      contextParts.push(daysContext);
    }

    const contextText = contextParts.length > 0 ? contextParts.join("\n\n") : "";

    const conversationHistory = recentMessages
      ? recentMessages
          .reverse()
          .slice(-6) // Last 3 pairs (6 messages)
          .map((m) => `${m.role}: ${m.content}`)
          .join("\n")
      : "";

    const userPrompt = `You are helping plan a trip to ${destination} from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}.

${contextText ? `${contextText}\n\n` : ""}${conversationHistory ? `Recent conversation:\n${conversationHistory}\n\n` : ""}User's question: ${message}

Provide a helpful, concise response. Reference specific days and places from the itinerary when relevant.`;

    // 5. Call OpenAI
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
    });

    const assistantReply =
      completion.choices[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response. Please try again.";

    // 6. Store chat history
    // Save user message
    await (supabase.from("trip_chat_messages") as any).insert({
      trip_id: tripId,
      user_id: userId,
      role: "user",
      content: message,
    });

    // Save assistant reply
    await (supabase.from("trip_chat_messages") as any).insert({
      trip_id: tripId,
      user_id: "assistant",
      role: "assistant",
      content: assistantReply,
    });

    // 7. Return response
    const usedSegments = activeSegmentId
      ? [segments?.find((s) => s.id === activeSegmentId)?.city_name || ""]
      : segments?.map((s) => s.city_name) || [];

    return NextResponse.json({
      reply: assistantReply,
      meta: {
        usedSegments: usedSegments.filter(Boolean),
        suggestions: [], // For future tool actions
      },
    });
  } catch (error) {
    console.error("Error in /api/trips/[tripId]/assistant:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

