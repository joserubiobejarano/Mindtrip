import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";

export interface AdvisorMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface AdvisorResponse {
  ok: boolean;
  reply?: string;
  suggestedAction?: {
    type: "offer_create_trip";
    summary?: string;
  };
  error?: string;
  maxMessagesPerDay?: number;
  isPro?: boolean;
  message?: string;
}

export function useAdvisorChat() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  // Fetch message history
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ["advisor-messages", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const response = await fetch("/api/advisor?limit=50");
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      return (data.messages || []).map((msg: any) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        created_at: msg.created_at,
      })) as AdvisorMessage[];
    },
    enabled: !!user?.id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Send message mutation with streaming support
  const sendMessage = useMutation({
    mutationFn: async (message: string): Promise<AdvisorResponse & { stream?: ReadableStream }> => {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send message");
      }

      // Check if response is streaming (SSE)
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("text/event-stream")) {
        return {
          ok: true,
          stream: response.body,
        } as any;
      }

      // Fallback: non-streaming response
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      // Invalidate messages query to refetch
      queryClient.invalidateQueries({
        queryKey: ["advisor-messages", user?.id],
      });
    },
    onError: (error) => {
      console.error("Error sending message:", error);
    },
  });

  return {
    messages,
    sendMessage: sendMessage.mutateAsync,
    isLoading: sendMessage.isPending || isLoadingMessages,
    error: sendMessage.error,
  };
}

