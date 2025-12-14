import { createClient } from "@/lib/supabase/client";

export interface ChatMessage {
  id: string;
  trip_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

/**
 * Get chat messages for a trip
 */
export async function getChatMessages(
  tripId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ data: ChatMessage[] | null; error: Error | null; hasMore: boolean }> {
  const supabase = createClient();

  // Get total count to determine if there are more messages
  const { count } = await supabase
    .from("trip_chat_messages")
    .select("*", { count: "exact", head: true })
    .eq("trip_id", tripId);

  const { data, error } = await supabase
    .from("trip_chat_messages")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return { data: null, error: new Error(error.message), hasMore: false };
  }

  // Reverse to get chronological order (oldest first)
  const messages = (data || []).reverse();

  const hasMore = count ? count > offset + limit : false;

  return { data: messages, error: null, hasMore };
}

/**
 * Save a chat message
 */
export async function saveChatMessage({
  tripId,
  role,
  content,
}: {
  tripId: string;
  role: "user" | "assistant";
  content: string;
}): Promise<{ error: Error | null }> {
  const supabase = createClient();

  const { error } = await (supabase.from("trip_chat_messages") as any).insert({
    trip_id: tripId,
    role,
    content,
  });

  if (error) {
    return { error: new Error(error.message) };
  }

  return { error: null };
}

