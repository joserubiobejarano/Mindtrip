"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { getChatMessages, saveChatMessage, type ChatMessage } from "@/lib/supabase/trip-chat-messages";
import { useToast } from "@/components/ui/toast";
import { clsx } from "clsx";

interface TripAssistantPanelProps {
  tripId: string;
}

export function TripAssistantPanel({ tripId }: TripAssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sendingChat, setSendingChat] = useState(false);
  const [chatHasMore, setChatHasMore] = useState(false);
  const [loadingChatMessages, setLoadingChatMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  const loadChatMessages = useCallback(async (limit: number = 20, offset: number = 0) => {
    setLoadingChatMessages(true);
    const { data, error, hasMore } = await getChatMessages(tripId, limit, offset);
    if (!error && data) {
      if (offset === 0) {
        setMessages(data);
      } else {
        setMessages((prev) => [...data, ...prev]);
      }
      setChatHasMore(hasMore);
    }
    setLoadingChatMessages(false);
  }, [tripId]);

  // Load chat messages on mount
  useEffect(() => {
    if (tripId && messages.length === 0) {
      loadChatMessages(20, 0);
    }
  }, [tripId, loadChatMessages, messages.length]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendingChat) return;

    const userMessage = input.trim();
    setInput("");
    setSendingChat(true);

    const tempUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      trip_id: tripId,
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await fetch(`/api/trips/${tripId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const { message: assistantMessage } = await response.json();

      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => !m.id.startsWith("temp-"));
        const tempAssistantMessage: ChatMessage = {
          id: `temp-assistant-${Date.now()}`,
          trip_id: tripId,
          role: "assistant",
          content: assistantMessage,
          created_at: new Date().toISOString(),
        };
        return [...withoutTemp, tempAssistantMessage];
      });

      await loadChatMessages(20, 0);
    } catch (error) {
      console.error("Error sending chat message:", error);
      addToast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => !m.id.startsWith("temp-"));
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          trip_id: tripId,
          role: "assistant",
          content: "Failed – please try again",
          created_at: new Date().toISOString(),
        };
        return [...withoutTemp, errorMessage];
      });
    } finally {
      setSendingChat(false);
    }
  };

  return (
    <div className="mt-10 border-t border-slate-200 pt-4">
      <div className="max-h-80 overflow-y-auto space-y-3 pb-4 text-sm">
        {chatHasMore && (
          <div className="text-center">
            <button
              onClick={() => loadChatMessages(20, messages.length)}
              disabled={loadingChatMessages}
              className="text-xs text-muted-foreground hover:underline"
            >
              {loadingChatMessages ? "Loading..." : "Load earlier messages"}
            </button>
          </div>
        )}
        {messages.length === 0 && !loadingChatMessages && (
          <div className="text-sm text-muted-foreground text-center py-4 px-4">
            Ask me anything about your trip! I can suggest places, check opening hours, or help you adjust your plans.
          </div>
        )}
        {messages.map((msg) => {
          const isError = msg.id.startsWith("error-");
          const isUser = msg.role === "user";
          
          return (
            <div
              key={msg.id}
              className={clsx(
                "max-w-xl rounded-2xl px-3 py-2",
                isUser
                  ? "ml-auto bg-orange-500 text-white"
                  : isError
                  ? "mr-auto bg-destructive/10 text-destructive border border-destructive/20"
                  : "mr-auto bg-slate-100 text-slate-800"
              )}
            >
              {msg.content}
            </div>
          );
        })}
        {sendingChat && (
          <div className="mr-auto text-xs text-slate-500">
            Trip Assistant is thinking…
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSendMessage}
        className="sticky bottom-0 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm"
      >
        <input
          className="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
          placeholder="Ask anything about your trip or tweak your plan…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sendingChat}
        />
        <button
          type="submit"
          disabled={sendingChat || !input.trim()}
          className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-xs font-medium text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sendingChat ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              <Send className="h-3 w-3" />
              Send
            </>
          )}
        </button>
      </form>
    </div>
  );
}

