"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface TripChatBarProps {
  tripId: string;
}

export function TripChatBar({ tripId }: TripChatBarProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    const userMessage = message.trim();
    setMessage("");
    setSending(true);

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

      // Message sent successfully - could show a toast or handle response
      const { message: assistantMessage } = await response.json();
      
      // Optionally show the response in a toast
      addToast({
        title: "Trip Assistant",
        description: assistantMessage.substring(0, 100) + (assistantMessage.length > 100 ? "..." : ""),
        variant: "default",
      });
    } catch (error) {
      console.error("Error sending chat message:", error);
      addToast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-8">
      {/* chat input */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-4xl items-center gap-3 rounded-full border-[3px] border-black bg-white px-4 py-2 shadow-[6px_6px_0px_rgba(0,0,0,1)]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50">
          {/* little spark / assistant icon, can be anything */}
          <span className="h-3 w-3 rounded-full bg-purple-500" />
        </span>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask anything about your trip or tweak your plan..."
          className="flex-1 border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />

        <button
          type="submit"
          disabled={sending || !message.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff7a00] text-white shadow-sm transition hover:translate-y-[1px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </form>

      {/* disclaimer */}
      <p className="mx-auto mt-2 max-w-4xl text-center text-xs text-slate-400">
        Kruno uses automated suggestions and may make mistakes. Always double-check important details.
      </p>
    </div>
  );
}

