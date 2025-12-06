import { getOpenAIClient } from "@/lib/openai";

export interface ModerationResult {
  isSafe: boolean;
  isTravelRelated: boolean;
  shouldBlock: boolean;
  reason?: string;
}

const REDIRECT_MESSAGE =
  "I can't help you with that, but I can help with planning your trip activities, suggesting places to visit, or adjusting your itinerary.";

/**
 * Check if a message is safe using OpenAI's moderation API
 */
export async function checkMessageSafety(
  message: string
): Promise<{ isSafe: boolean; reason?: string }> {
  try {
    const openai = getOpenAIClient();
    const moderation = await openai.moderations.create({
      input: message,
    });

    const result = moderation.results[0];
    const isSafe = !result.flagged;

    if (!isSafe) {
      // Identify which categories were flagged
      const flaggedCategories = Object.entries(result.categories)
        .filter(([_, flagged]) => flagged)
        .map(([category]) => category);

      return {
        isSafe: false,
        reason: `Message flagged for: ${flaggedCategories.join(", ")}`,
      };
    }

    return { isSafe: true };
  } catch (error) {
    console.error("Error checking message safety:", error);
    // On error, allow the message through (fail open) but log it
    return { isSafe: true };
  }
}

/**
 * Check if a message is travel-related using OpenAI classification
 */
export async function isTravelRelated(
  message: string
): Promise<{ isTravelRelated: boolean; reason?: string }> {
  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a classifier that determines if a user message is related to travel, trip planning, or itinerary management. Respond with ONLY 'yes' or 'no'.",
        },
        {
          role: "user",
          content: `Is this message related to travel, trip planning, destinations, activities, itinerary, accommodations, or anything about planning or managing a trip?\n\nMessage: "${message}"\n\nRespond with only 'yes' or 'no'.`,
        },
      ],
      temperature: 0,
      max_tokens: 10,
    });

    const response =
      completion.choices[0]?.message?.content?.toLowerCase().trim() || "no";
    const isTravelRelated = response.startsWith("yes");

    return {
      isTravelRelated,
      reason: isTravelRelated
        ? undefined
        : "Message is not related to travel or trip planning",
    };
  } catch (error) {
    console.error("Error checking if message is travel-related:", error);
    // On error, assume it's travel-related (fail open) but log it
    return { isTravelRelated: true };
  }
}

/**
 * Comprehensive moderation check combining safety and topic relevance
 */
export async function moderateMessage(
  message: string
): Promise<ModerationResult> {
  // Run both checks in parallel for efficiency
  const [safetyCheck, travelCheck] = await Promise.all([
    checkMessageSafety(message),
    isTravelRelated(message),
  ]);

  const shouldBlock = !safetyCheck.isSafe || !travelCheck.isTravelRelated;
  const reason = !safetyCheck.isSafe
    ? safetyCheck.reason
    : !travelCheck.isTravelRelated
    ? travelCheck.reason
    : undefined;

  return {
    isSafe: safetyCheck.isSafe,
    isTravelRelated: travelCheck.isTravelRelated,
    shouldBlock,
    reason,
  };
}

/**
 * Get the standard redirect message for off-topic queries
 */
export function getRedirectMessage(): string {
  return REDIRECT_MESSAGE;
}

