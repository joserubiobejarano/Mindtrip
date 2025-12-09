import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAIClient } from "@/lib/openai";
import { moderateMessage, getRedirectMessage } from "@/lib/chat-moderation";
import { getUserSubscriptionStatus } from "@/lib/supabase/user-subscription";
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

interface AdvisorRequest {
  message: string;
}

const ADVISOR_SYSTEM_PROMPT = `You are the Kruno Advisor, a high-level travel advisor for pre-itinerary questions.

Your role:
- Suggest destinations, regions, and cities
- Propose realistic trip structures (e.g., 7 days → 2 cities)
- Give approximate high-level suggestions: what to see, what areas to base in, what vibes
- Ask clarifying questions when needed (budget, vibe, time of year, length of stay)

CRITICAL - Transport guidance:
Whenever the user mentions:
- Multiple cities
- A region (e.g., Tuscany, Andalusia, "around Spain")
- Or asks about "moving around" / "how to get there"

You MUST explicitly mention how to move between places, with realistic options and a short comment on pros/cons:
- High-speed trains (e.g., AVE in Spain) are usually the most convenient between major cities
- For smaller towns in regions like Tuscany, renting a car gives you the most flexibility
- Buses can be cheaper between some cities, but slower
- For longer distances you can also consider low-cost flights

Keep transport suggestions practical and concise.

Conversational behavior:
- After 2-3 helpful messages, normally propose creating a MindTrip itinerary:
  "If you'd like, I can help you set up a full itinerary for this idea."
- At the end of each answer, when the user seems close to a concrete plan (dates known, region decided, or clearly leaning to one idea), add:
  "When you're ready, say something like 'Let's create this trip' and I'll start setting it up."

You do NOT:
- Edit existing itineraries (you're for pre-trip planning only)
- Talk about non-travel topics
- Give ultra-precise timetable/price information (keep it approximate)

Be helpful, concise, and guide users toward creating a trip with MindTrip.`;

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Get query params for pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Fetch messages
    const { data: messages, error } = await supabase
      .from("advisor_messages")
      .select("id, role, content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching advisor messages:", error);
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      messages: messages || [],
    });
  } catch (error) {
    console.error("Error in GET /api/advisor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: AdvisorRequest = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: "Message is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Get user's Pro status
    const { isPro } = await getUserSubscriptionStatus(userId);

    // 2. Check daily cap (count assistant messages for today)
    // Use PostgreSQL date truncation to get today's date in UTC
    const { count: assistantMessagesToday, error: countError } = await supabase
      .from("advisor_messages")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("role", "assistant")
      .gte("created_at", new Date().toISOString().split("T")[0] + "T00:00:00.000Z")
      .lt("created_at", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0] + "T00:00:00.000Z");

    if (countError) {
      console.error("Error counting messages:", countError);
      // Continue anyway, but log the error
    }

    const maxMessagesPerDay = isPro ? 15 : 3;
    const currentCount = assistantMessagesToday || 0;

    if (currentCount >= maxMessagesPerDay) {
      return NextResponse.json({
        ok: false,
        error: "limit_reached",
        maxMessagesPerDay,
        isPro,
        message: isPro
          ? "You have reached your daily limit of Advisor messages. Try again tomorrow or focus on your existing trips."
          : "You have reached your daily limit of Advisor messages. Create a trip or upgrade to Pro for more chat-based planning.",
      });
    }

    // 3. Moderation & topic relevance
    const moderationResult = await moderateMessage(message);

    if (moderationResult.shouldBlock) {
      const redirectMessage = getRedirectMessage();

      // Save redirect response
      await supabase.from("advisor_messages").insert({
        user_id: userId,
        role: "assistant",
        content: redirectMessage,
      });

      if (moderationResult.reason) {
        console.log(`Message blocked: ${moderationResult.reason}`);
      }

      return NextResponse.json({
        ok: false,
        error: "off_topic",
        message: "I can only help with travel planning — destinations, ideas, and building itineraries. Try asking me about where to go, when to visit, or how to plan a trip.",
      });
    }

    // 4. Load conversation history (last 15-20 messages)
    const { data: recentMessages } = await supabase
      .from("advisor_messages")
      .select("role, content")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(20);

    // 5. Build conversation context
    const conversationHistory = recentMessages
      ? recentMessages
          .slice(-15) // Last 15 messages (roughly 7-8 pairs)
          .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
          .join("\n")
      : "";

    const userPrompt = conversationHistory
      ? `${conversationHistory}\n\nUser: ${message}`
      : `User: ${message}`;

    // 6. Save user message first
    await supabase.from("advisor_messages").insert({
      user_id: userId,
      role: "user",
      content: message,
    });

    // 7. Create streaming response using Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let accumulatedText = '';
          let assistantReply = '';

          // Stream the text from OpenAI
          const result = await streamText({
            model: openai('gpt-4o-mini'),
            system: ADVISOR_SYSTEM_PROMPT,
            prompt: userPrompt,
            temperature: 0.7,
          });

          // Process the stream
          for await (const chunk of result.textStream) {
            accumulatedText += chunk;
            assistantReply = accumulatedText;
            
            // Send chunk as SSE
            const encoder = new TextEncoder();
            const message = JSON.stringify({ type: 'chunk', data: chunk });
            controller.enqueue(encoder.encode(`data: ${message}\n\n`));
          }

          // Save complete assistant reply
          await supabase.from("advisor_messages").insert({
            user_id: userId,
            role: "assistant",
            content: assistantReply,
          });

          // Check if we should suggest creating a trip
          const shouldSuggestTrip =
            assistantReply.toLowerCase().includes("let's create") ||
            assistantReply.toLowerCase().includes("set up") ||
            assistantReply.toLowerCase().includes("create this trip") ||
            (recentMessages && recentMessages.length >= 4);

          // Send complete message
          const encoder = new TextEncoder();
          const completeMessage = JSON.stringify({
            type: 'complete',
            data: {
              reply: assistantReply,
              ...(shouldSuggestTrip && {
                suggestedAction: {
                  type: "offer_create_trip",
                  summary: "Ready to create your trip? I can help you set it up.",
                },
              }),
            },
          });
          controller.enqueue(encoder.encode(`data: ${completeMessage}\n\n`));
          
          controller.close();
        } catch (err: any) {
          console.error('[advisor] Stream error:', err);
          const encoder = new TextEncoder();
          const errorMessage = JSON.stringify({
            type: 'error',
            data: { message: err.message || 'An error occurred' },
          });
          controller.enqueue(encoder.encode(`data: ${errorMessage}\n\n`));
          controller.close();
        }
      },
    });

    // Return streaming response with SSE headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("Error in /api/advisor:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500 }
    );
  }
}

