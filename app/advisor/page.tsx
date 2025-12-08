"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { useAdvisorChat, type AdvisorMessage } from "@/hooks/use-advisor-chat";
import { useCreateTrip, type DestinationOption } from "@/hooks/use-create-trip";
import { DestinationAutocomplete } from "@/components/destination-autocomplete";
import { DateRangePicker } from "@/components/date-range-picker";
import { OriginCityAutocomplete, type OriginCityOption } from "@/components/origin-city-autocomplete";
import { AccommodationAutocomplete, type AccommodationOption } from "@/components/accommodation-autocomplete";
import { useToast } from "@/components/ui/toast";
import { clsx } from "clsx";
import Link from "next/link";

const STARTER_PROMPTS = [
  "1 week in Tuscany, but not sure where to base myself",
  "Ideas for a 3-day city break in Europe in March",
  "Spain road trip for 10 days",
  "Best destinations for a solo trip in spring",
];

type OnboardingMode = "advisor" | "onboarding";

interface OnboardingData {
  destinationCityName?: string;
  destinationPlaceId?: string;
  startDate?: string;
  endDate?: string;
  lengthInNights?: number;
  originCityName?: string;
  originCityPlaceId?: string;
  travelers?: number;
  accommodationType?: "hotel" | "address" | "none";
  accommodationNameOrAddress?: string | null;
  accommodationPlaceId?: string | null;
  arrivalMode?: "plane" | "train" | "bus" | "car" | "not_sure";
  arrivalTimeLocal?: string | null;
  interests?: string[];
}

const INTEREST_KEYWORDS: Record<string, string[]> = {
  food: ["food", "restaurant", "dining", "eat", "cuisine", "meal"],
  cafes: ["cafe", "coffee", "brunch", "breakfast", "cappuccino"],
  museums: ["museum", "culture", "art", "gallery", "exhibition", "history"],
  parks: ["park", "nature", "outdoor", "hiking", "trail", "green"],
  nightlife: ["nightlife", "bar", "club", "night", "drinks", "party"],
  neighborhoods: ["neighborhood", "local", "area", "district", "quarter"],
  shopping: ["shopping", "shop", "market", "mall", "boutique"],
  landmarks: ["landmark", "monument", "sight", "attraction", "must-see", "famous"],
};

function AdvisorPageContent() {
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const { messages, sendMessage, isLoading } = useAdvisorChat();
  const { createTrip, loading: creatingTrip } = useCreateTrip();

  const [localMessages, setLocalMessages] = useState<AdvisorMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{ maxMessagesPerDay: number; isPro: boolean } | null>(null);
  const [mode, setMode] = useState<OnboardingMode>("advisor");
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [isPro, setIsPro] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Use refs for functions to avoid dependency issues
  const onboardingHandlersRef = useRef<{
    handleOnboardingResponse?: (message: string) => void;
    startOnboarding?: () => void;
  }>({});

  // Fetch Pro status
  useEffect(() => {
    if (userId) {
      fetch("/api/user/subscription-status")
        .then((res) => res.json())
        .then((data) => setIsPro(data.isPro || false))
        .catch(() => setIsPro(false));
    }
  }, [userId]);

  // Merge API messages with local messages
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  const handleSendMessage = useCallback(async (messageText?: string, isInitial = false) => {
    const message = messageText || input.trim();
    if (!message || sending || limitReached) return;

    if (!isInitial) {
      setInput("");
    }

    // If in onboarding mode, handle onboarding steps
    if (mode === "onboarding") {
      onboardingHandlersRef.current.handleOnboardingResponse?.(message);
      return;
    }

    // Check if user wants to start onboarding
    if (message.toLowerCase().includes("let's create") || message.toLowerCase().includes("create this trip")) {
      onboardingHandlersRef.current.startOnboarding?.();
      return;
    }

    setSending(true);

    // Optimistically add user message
    const tempUserMessage: AdvisorMessage = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: message,
      created_at: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await sendMessage(message);

      if (response.ok && response.reply) {
        // Add assistant reply
        const assistantMessage: AdvisorMessage = {
          id: `temp-assistant-${Date.now()}`,
          role: "assistant",
          content: response.reply,
          created_at: new Date().toISOString(),
        };
        setLocalMessages((prev) => {
          const withoutTemp = prev.filter((m) => !m.id.startsWith("temp-"));
          return [...withoutTemp, assistantMessage];
        });

        // Check for suggested action
        if (response.suggestedAction?.type === "offer_create_trip") {
          // Add a button message
          setTimeout(() => {
            setLocalMessages((prev) => [
              ...prev,
              {
                id: `action-${Date.now()}`,
                role: "assistant",
                content: "Would you like to create this trip now?",
                created_at: new Date().toISOString(),
              },
            ]);
          }, 500);
        }
      } else if (response.error === "limit_reached") {
        setLimitReached(true);
        setLimitInfo({
          maxMessagesPerDay: response.maxMessagesPerDay || 3,
          isPro: response.isPro || false,
        });
        setLocalMessages((prev) => {
          const withoutTemp = prev.filter((m) => !m.id.startsWith("temp-"));
          return [
            ...withoutTemp,
            {
              id: `limit-${Date.now()}`,
              role: "assistant",
              content: response.message || "You've reached your daily limit.",
              created_at: new Date().toISOString(),
            },
          ];
        });
      } else if (response.error === "off_topic") {
        setLocalMessages((prev) => {
          const withoutTemp = prev.filter((m) => !m.id.startsWith("temp-"));
          return [
            ...withoutTemp,
            {
              id: `error-${Date.now()}`,
              role: "assistant",
              content: response.message || "I can only help with travel planning.",
              created_at: new Date().toISOString(),
            },
          ];
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setLocalMessages((prev) => {
        const withoutTemp = prev.filter((m) => !m.id.startsWith("temp-"));
        return [
          ...withoutTemp,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: "Failed to send message. Please try again.",
            created_at: new Date().toISOString(),
          },
        ];
      });
    } finally {
      setSending(false);
    }
  }, [input, sending, limitReached, mode, sendMessage]);

  // Handle initial query param
  const [hasHandledInitial, setHasHandledInitial] = useState(false);
  useEffect(() => {
    const initialMessage = searchParams?.get("q");
    if (initialMessage && localMessages.length === 0 && !sending && !hasHandledInitial) {
      setHasHandledInitial(true);
      handleSendMessage(initialMessage, true);
    }
  }, [searchParams, localMessages.length, sending, hasHandledInitial, handleSendMessage]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const startOnboarding = () => {
    setMode("onboarding");
    setOnboardingStep(0);
    setOnboardingData({});
    addOnboardingMessage("Great! Let's set up your trip. I'll ask you a few quick questions so I can personalize your itinerary.");
    handleOnboardingStep(0);
  };

  const handleOnboardingStep = (step: number) => {
    setOnboardingStep(step);
    switch (step) {
      case 0: // Destination
        addOnboardingMessage("What's the main destination city you want to plan for?");
        break;
      case 1: // Dates
        addOnboardingMessage("What dates are you thinking of? You can say something like 'March 10 to 15' or 'any 1 week in June'.");
        break;
      case 2: // Origin
        addOnboardingMessage("Where will you be traveling from? (City)");
        break;
      case 3: // Travelers
        addOnboardingMessage("How many travelers are in your group?");
        break;
      case 4: // Accommodation
        addOnboardingMessage("Do you already have accommodation booked? You can tell me the hotel name or address, or say 'not yet'.");
        break;
      case 5: // Arrival mode
        addOnboardingMessage("How will you arrive? Plane, train, bus, car, or not sure yet?");
        break;
      case 6: // Arrival time
        addOnboardingMessage("Do you know roughly what time you arrive? (Local time, optional - e.g., '14:00' or '2 PM')");
        break;
      case 7: // Interests
        addOnboardingMessage(
          "What kind of things do you want in this trip?\n\nYou can mention any of these:\n- Food & restaurants\n- Cafés & brunch\n- Museums & culture\n- Parks & nature\n- Nightlife & bars\n- Local neighborhoods\n- Shopping\n- Landmarks & must-see"
        );
        break;
      case 8: // Complete
        completeOnboarding();
        break;
    }
  };

  const addOnboardingMessage = (content: string) => {
    const message: AdvisorMessage = {
      id: `onboarding-${Date.now()}`,
      role: "assistant",
      content,
      created_at: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, message]);
  };

  const handleOnboardingResponse = (userResponse: string) => {
    const response = userResponse.toLowerCase().trim();

    // Add user message
    const userMessage: AdvisorMessage = {
      id: `onboarding-user-${Date.now()}`,
      role: "user",
      content: userResponse,
      created_at: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, userMessage]);

    switch (onboardingStep) {
      case 0: // Destination
        // Try to extract destination from response
        setOnboardingData((prev) => ({ ...prev, destinationCityName: userResponse }));
        handleOnboardingStep(1);
        break;

      case 1: // Dates
        parseDates(userResponse);
        handleOnboardingStep(2);
        break;

      case 2: // Origin
        setOnboardingData((prev) => ({ ...prev, originCityName: userResponse }));
        handleOnboardingStep(3);
        break;

      case 3: // Travelers
        const travelers = parseInt(response) || 1;
        setOnboardingData((prev) => ({ ...prev, travelers: Math.max(1, travelers) }));
        handleOnboardingStep(4);
        break;

      case 4: // Accommodation
        if (response.includes("not yet") || response.includes("no") || response.includes("none")) {
          setOnboardingData((prev) => ({
            ...prev,
            accommodationType: "none",
            accommodationNameOrAddress: null,
          }));
        } else {
          setOnboardingData((prev) => ({
            ...prev,
            accommodationType: "hotel",
            accommodationNameOrAddress: userResponse,
          }));
        }
        handleOnboardingStep(5);
        break;

      case 5: // Arrival mode
        let arrivalMode: "plane" | "train" | "bus" | "car" | "not_sure" = "not_sure";
        if (response.includes("plane") || response.includes("flight") || response.includes("fly")) {
          arrivalMode = "plane";
        } else if (response.includes("train")) {
          arrivalMode = "train";
        } else if (response.includes("bus")) {
          arrivalMode = "bus";
        } else if (response.includes("car") || response.includes("drive")) {
          arrivalMode = "car";
        }
        setOnboardingData((prev) => ({ ...prev, arrivalMode }));
        handleOnboardingStep(6);
        break;

      case 6: // Arrival time
        const timeMatch = userResponse.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
          const period = timeMatch[3]?.toLowerCase();

          if (period === "pm" && hours !== 12) hours += 12;
          if (period === "am" && hours === 12) hours = 0;

          setOnboardingData((prev) => ({
            ...prev,
            arrivalTimeLocal: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
          }));
        }
        handleOnboardingStep(7);
        break;

      case 7: // Interests
        const interests: string[] = [];
        for (const [key, keywords] of Object.entries(INTEREST_KEYWORDS)) {
          if (keywords.some((kw) => response.includes(kw))) {
            interests.push(key);
          }
        }
        setOnboardingData((prev) => ({ ...prev, interests }));
        handleOnboardingStep(8);
        break;
    }
  };
  
  // Update ref with latest functions after they're defined
  useEffect(() => {
    onboardingHandlersRef.current.startOnboarding = startOnboarding;
    onboardingHandlersRef.current.handleOnboardingResponse = handleOnboardingResponse;
  });

  const parseDates = (text: string) => {
    // Simple date parsing - can be improved
    const today = new Date();
    const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

    // Try to find date patterns
    const datePattern = /(\w+)\s+(\d{1,2})\s+to\s+(\d{1,2})/i;
    const match = text.match(datePattern);

    if (match) {
      const monthName = match[1].toLowerCase();
      const monthIndex = monthNames.findIndex((m) => m.startsWith(monthName));
      if (monthIndex !== -1) {
        const year = today.getFullYear();
        const startDay = parseInt(match[2]);
        const endDay = parseInt(match[3]);
        const startDate = new Date(year, monthIndex, startDay);
        const endDate = new Date(year, monthIndex, endDay);

        if (startDate > today) {
          setOnboardingData((prev) => ({
            ...prev,
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
            lengthInNights: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
          }));
          return;
        }
      }
    }

    // Fallback: try to extract number of days/weeks
    const daysMatch = text.match(/(\d+)\s*(day|week|night)/i);
    if (daysMatch) {
      let nights = parseInt(daysMatch[1]);
      if (daysMatch[2].toLowerCase().includes("week")) {
        nights = nights * 7;
      }
      setOnboardingData((prev) => ({ ...prev, lengthInNights: nights }));
    }
  };

  const completeOnboarding = async () => {
    if (!onboardingData.destinationCityName || !onboardingData.startDate || !onboardingData.endDate) {
      addOnboardingMessage("I need at least a destination and dates to create your trip. Let's start over.");
      setMode("advisor");
      setOnboardingStep(0);
      setOnboardingData({});
      return;
    }

    addOnboardingMessage("Creating your trip...");

    try {
      // Resolve destination to place ID using Mapbox (same as homepage)
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!mapboxToken) {
        throw new Error("Mapbox token not configured");
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(onboardingData.destinationCityName || "")}.json?access_token=${mapboxToken}&types=place,country,region&limit=1`
      );

      if (!response.ok) {
        throw new Error("Failed to resolve destination");
      }

      const data = await response.json();
      const features = data.features || [];

      if (features.length === 0) {
        throw new Error("Destination not found");
      }

      const feature = features[0];
      const placeName = feature.place_name.split(",")[0].trim();

      const regionParts: string[] = [];
      if (feature.context) {
        const country = feature.context.find((ctx: any) => ctx.id.startsWith("country"));
        const region = feature.context.find((ctx: any) => ctx.id.startsWith("region"));

        if (region) regionParts.push(region.text);
        if (country) regionParts.push(country.text);
      }
      const region = regionParts.join(", ") || feature.place_name.split(",").slice(1).join(",").trim();

      let type: "City" | "Country" | "Region" = "City";
      if (feature.place_type?.includes("country")) {
        type = "Country";
      } else if (feature.place_type?.includes("region")) {
        type = "Region";
      } else if (feature.place_type?.includes("place")) {
        type = "City";
      }

      const destination: DestinationOption = {
        id: feature.id,
        placeName,
        region,
        type,
        center: feature.center,
      };

      // Build personalization payload
      const personalization: any = {
        travelers: onboardingData.travelers || 1,
        hasAccommodation: onboardingData.accommodationType !== "none",
        interests: onboardingData.interests || [],
      };

      if (onboardingData.originCityName) {
        // Try to resolve origin city (simplified - would need proper autocomplete)
        personalization.originCityName = onboardingData.originCityName;
      }

      if (onboardingData.accommodationType === "hotel" && onboardingData.accommodationNameOrAddress) {
        personalization.accommodationName = onboardingData.accommodationNameOrAddress;
      }

      if (onboardingData.arrivalMode && onboardingData.arrivalMode !== "not_sure") {
        personalization.arrivalTransportMode = onboardingData.arrivalMode;
      }

      if (onboardingData.arrivalTimeLocal) {
        personalization.arrivalTimeLocal = onboardingData.arrivalTimeLocal;
      }

      // Create trip
      await createTrip({
        destination,
        startDate: onboardingData.startDate,
        endDate: onboardingData.endDate,
        personalization,
      });

      addOnboardingMessage("All set! I've created your trip. I'm taking you to your Smart Itinerary now 🎒");
      setTimeout(() => {
        router.push("/trips");
      }, 2000);
    } catch (error: any) {
      console.error("Error creating trip:", error);
      addOnboardingMessage("Something went wrong while creating the trip. Please try again from the homepage or reload.");
    }
  };

  const handleStarterPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in required</h1>
          <p className="text-muted-foreground mb-4">Please sign in to use the Travel Advisor.</p>
          <Link href="/sign-in">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3 flex items-center gap-4 flex-shrink-0">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Travel Advisor</h1>
          <p className="text-xs text-muted-foreground">Ask for ideas before creating your itinerary</p>
        </div>
        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">Beta</span>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {localMessages.length === 0 && !sending && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <Sparkles className="h-12 w-12 mx-auto text-primary/50" />
              <h2 className="text-xl font-semibold">How can I help you plan your trip?</h2>
              <p className="text-sm text-muted-foreground">Ask me about destinations, regions, or trip ideas</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {STARTER_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStarterPrompt(prompt)}
                  className="text-left p-4 border border-border rounded-lg hover:bg-muted transition-colors text-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {localMessages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div key={msg.id} className={clsx("flex", isUser ? "justify-end" : "justify-start")}>
              <div
                className={clsx(
                  "max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-2",
                  isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl px-4 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Limit reached banner */}
      {limitReached && limitInfo && (
        <div className="px-4 py-3 bg-destructive/10 border-t border-destructive/20 flex-shrink-0">
          <div className="max-w-2xl mx-auto space-y-2">
            <p className="text-sm text-destructive font-medium">
              {limitInfo.isPro
                ? `You've reached today's Advisor limit (${limitInfo.maxMessagesPerDay} messages). You can continue planning inside your trips, or come back tomorrow.`
                : `You've reached today's Advisor limit (${limitInfo.maxMessagesPerDay} messages). Create a trip to keep planning, or upgrade to Pro for more chat-based advice.`}
            </p>
            {!limitInfo.isPro && (
              <Link href="/settings?upgrade=true">
                <Button size="sm" className="w-full">
                  Upgrade to Pro
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-border bg-card px-4 py-3 flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="max-w-2xl mx-auto flex gap-2"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "onboarding" ? "Type your answer..." : "Ask about destinations, regions, or trip ideas..."}
            disabled={sending || limitReached || creatingTrip}
            className="flex-1"
          />
          <Button type="submit" disabled={sending || !input.trim() || limitReached || creatingTrip} size="icon">
            {sending || creatingTrip ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function AdvisorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <AdvisorPageContent />
    </Suspense>
  );
}

