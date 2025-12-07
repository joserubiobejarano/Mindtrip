import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface TripAssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface UseTripAssistantOptions {
  activeSegmentId?: string;
  activeDayId?: string;
}

export function useTripAssistant(
  tripId: string,
  options?: UseTripAssistantOptions
) {
  const queryClient = useQueryClient();
  const { activeSegmentId, activeDayId } = options || {};

  // Fetch message history from trip_chat_messages
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['trip-assistant-messages', tripId],
    queryFn: async () => {
      // Fetch messages from Supabase client
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data, error } = await supabase
        .from('trip_chat_messages')
        .select('id, role, content, created_at')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      return (data || []).map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        created_at: msg.created_at,
      })) as TripAssistantMessage[];
    },
    enabled: !!tripId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch(`/api/trips/${tripId}/assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          activeSegmentId,
          activeDayId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      // Invalidate messages query to refetch
      queryClient.invalidateQueries({
        queryKey: ['trip-assistant-messages', tripId],
      });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
    },
  });

  return {
    messages,
    sendMessage: sendMessage.mutateAsync,
    isLoading: sendMessage.isPending || isLoadingMessages,
    error: sendMessage.error,
  };
}

