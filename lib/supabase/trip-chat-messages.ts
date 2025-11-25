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
  limit: number = 50
): Promise<{ data: ChatMessage[] | null; error: Error | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("trip_chat_messages")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: data || [], error: null };
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

  const { error } = await supabase.from("trip_chat_messages").insert({
    trip_id: tripId,
    role,
    content,
  });

  if (error) {
    return { error: new Error(error.message) };
  }

  return { error: null };
}

