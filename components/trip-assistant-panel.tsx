"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { useTripAssistant } from "@/hooks/use-trip-assistant";
import { useToast } from "@/components/ui/toast";
import { clsx } from "clsx";

interface TripAssistantPanelProps {
  tripId: string;
  activeSegmentId?: string;
  activeDayId?: string;
}

export function TripAssistantPanel({ tripId, activeSegmentId, activeDayId }: TripAssistantPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  const { messages, sendMessage, isLoading } = useTripAssistant(tripId, {
    activeSegmentId,
    activeDayId,
  });

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
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    try {
      await sendMessage(userMessage);
    } catch (error) {
      console.error("Error sending chat message:", error);
      addToast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-10 border-t border-slate-200 pt-4">
      <div className="max-h-80 overflow-y-auto space-y-3 pb-4 text-sm">
        {messages.length === 0 && !isLoading && (
          <div className="text-sm text-muted-foreground text-center py-4 px-4">
            Ask me anything about your trip! I can suggest places, check opening hours, or help you adjust your plans.
          </div>
        )}
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          
          return (
            <div
              key={msg.id}
              className={clsx(
                "max-w-xl rounded-2xl px-3 py-2",
                isUser
                  ? "ml-auto bg-orange-500 text-white"
                  : "mr-auto bg-slate-100 text-slate-800"
              )}
            >
              {msg.content}
            </div>
          );
        })}
        {isLoading && (
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
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-xs font-medium text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
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

