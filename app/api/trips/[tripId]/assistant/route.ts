/**
 * Trip Assistant API Route
 * 
 * Language Support Audit Summary:
 * - Trip Assistant client: ✅ (use-trip-assistant.ts, trip-assistant-panel.tsx, trip-assistant-widget.tsx)
 * - Trip Assistant API: ✅ (this file and /api/trips/[tripId]/chat/route.ts)
 * - Advisor client: ❌ (Advisor feature not implemented)
 * - Advisor API: ❌ (Advisor feature not implemented)
 * 
 * Language is parsed from request body, normalized to 'en' | 'es', and injected into system prompt.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireTripAccess, tripAccessErrorResponse } from "@/lib/auth/require-trip-access";
import { getOpenAIClient } from "@/lib/openai";
import { moderateMessage, getRedirectMessage } from "@/lib/chat-moderation";
import { getSmartItinerary } from "@/lib/supabase/smart-itineraries-server";
import { getTripSegments } from "@/lib/supabase/trip-segments";
import { validateParams, validateBody } from "@/lib/validation/validate-request";
import { TripIdParamsSchema, AssistantMessageSchema } from "@/lib/validation/api-schemas";
import { checkRateLimit } from "@/lib/rate-limit/rate-limit-middleware";
import type { Language } from "@/lib/i18n";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    // Validate params and body
    const { tripId } = await validateParams(params, TripIdParamsSchema);
    const body = await validateBody(request, AssistantMessageSchema);
    const { message, activeSegmentId, activeDayId, language: rawLanguage } = body;
    
    // Parse and normalize language from request body (default to 'en')
    const language: Language = rawLanguage === 'es' ? 'es' : 'en';

    const supabase = await createClient();

    // Verify user has access to trip
    const accessResult = await requireTripAccess(tripId, supabase);
    const trip = accessResult.trip;
    const profileId = accessResult.profileId;

    // Rate limiting (after auth check)
    const rateLimitCheck = await checkRateLimit(request, 'ASSISTANT', accessResult.clerkUserId);
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response;
    }

    // 2. Moderation & topic relevance
    const moderationResult = await moderateMessage(message);

    if (moderationResult.shouldBlock) {
      const redirectMessage = getRedirectMessage();

      // Save redirect response
      await (supabase.from("trip_chat_messages") as any).insert({
        trip_id: tripId,
        user_id: profileId,
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
    const languageInstruction = language === 'es'
      ? 'Responde siempre en español claro y natural. Todas tus respuestas deben estar en español.'
      : 'Always respond in natural English. All your responses should be in English.';
    
    const systemPrompt = `You are the Kruno Travel Assistant for a single trip.

${languageInstruction}

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
      user_id: profileId,
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
  } catch (error: unknown) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error('[Assistant API]', {
      path: '/api/trips/[tripId]/assistant',
      method: 'POST',
      error: error instanceof Error ? error.message : 'Internal server error',
    });
    return tripAccessErrorResponse(error);
  }
}

