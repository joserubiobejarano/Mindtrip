import { createClient } from "@/lib/supabase/client";

export interface AdvisorMessage {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

/**
 * Get advisor messages for a user
 */
export async function getAdvisorMessages(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ data: AdvisorMessage[] | null; error: Error | null; hasMore: boolean }> {
  const supabase = createClient();

  // Get total count to determine if there are more messages
  const { count } = await supabase
    .from("advisor_messages")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const { data, error } = await supabase
    .from("advisor_messages")
    .select("*")
    .eq("user_id", userId)
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
 * Save an advisor message
 */
export async function saveAdvisorMessage({
  userId,
  role,
  content,
}: {
  userId: string;
  role: "user" | "assistant";
  content: string;
}): Promise<{ error: Error | null }> {
  const supabase = createClient();

  const { error } = await supabase.from("advisor_messages").insert({
    user_id: userId,
    role,
    content,
  });

  if (error) {
    return { error: new Error(error.message) };
  }

  return { error: null };
}

