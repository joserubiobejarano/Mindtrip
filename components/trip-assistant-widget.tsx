"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, MessageCircle, ChevronDown } from "lucide-react";
import { getChatMessages, type ChatMessage } from "@/lib/supabase/trip-chat-messages";
import { useToast } from "@/components/ui/toast";
import { clsx } from "clsx";

interface TripAssistantWidgetProps {
  tripId: string;
}

export function TripAssistantWidget({ tripId }: TripAssistantWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sendingChat, setSendingChat] = useState(false);
  const [chatHasMore, setChatHasMore] = useState(false);
  const [loadingChatMessages, setLoadingChatMessages] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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

  // Auto-expand if there are messages
  useEffect(() => {
    if (messages.length > 0 && !isExpanded) {
      setIsExpanded(true);
    }
  }, [messages.length, isExpanded]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && isExpanded) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages, isExpanded]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isExpanded]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendingChat) return;

    const userMessage = input.trim();
    setInput("");
    setSendingChat(true);
    setIsExpanded(true);

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

  const handleInputFocus = () => {
    setIsExpanded(true);
  };

  const handleMinimize = () => {
    setIsExpanded(false);
  };

  return (
    <div className="mx-auto mt-8 mb-4 max-w-3xl">
      {!isExpanded ? (
        // Collapsed state: compact pill
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) {
              handleSendMessage(e);
            } else {
              handleInputFocus();
            }
          }}
          className="flex items-center rounded-[999px] border-[3px] border-black bg-white px-4 py-2 shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
          onClick={handleInputFocus}
        >
          <MessageCircle className="h-4 w-4 text-slate-600 mr-2 flex-shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
            placeholder="Ask anything about your trip or tweak your plan…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={handleInputFocus}
            disabled={sendingChat}
          />
          <button
            type="submit"
            onClick={(e) => {
              e.stopPropagation();
            }}
            disabled={sendingChat}
            className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sendingChat ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      ) : (
        // Expanded state: full chat panel
        <div className="bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-gray-900">Trip Assistant</h3>
            <button
              onClick={handleMinimize}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors"
              title="Minimize"
            >
              <ChevronDown className="h-4 w-4 text-slate-600" />
            </button>
          </div>

          {/* Messages area */}
          <div className="max-h-[360px] overflow-y-auto space-y-3 p-4 text-sm">
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

          {/* Input form */}
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 rounded-2xl border-t border-slate-200 bg-white px-3 py-2"
          >
            <input
              ref={inputRef}
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
      )}
      {/* Disclaimer */}
      <p className="mt-2 text-xs text-slate-500 text-center">
        Kruno Assistant can make mistakes. Always double-check opening hours, bookings,
        and important details.
      </p>
    </div>
  );
}

