"use client";

import { useUser } from "@clerk/nextjs";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Sparkles, Check, Infinity } from "lucide-react";

const CURRENCIES = [
  "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "INR", "MXN",
  "BRL", "ZAR", "SGD", "HKD", "NOK", "SEK", "DKK", "PLN", "RUB", "TRY",
  "NZD", "KRW", "THB", "IDR", "PHP", "MYR", "VND", "AED", "SAR", "ILS"
];

function SettingsContent({ showUpgrade }: { showUpgrade: boolean }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { addToast } = useToast();
  const supabase = createClient();
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [isSaving, setIsSaving] = useState(false);
  const [isPro, setIsPro] = useState(false);

  // Fetch profile and subscription status
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found" - that's okay, we'll create it
        throw error;
      }

      return data;
    },
    enabled: !!user?.id && isLoaded,
  });

  // Fetch subscription status
  useEffect(() => {
    if (user?.id) {
      fetch('/api/user/subscription-status')
        .then(res => res.json())
        .then(data => setIsPro(data.isPro || false))
        .catch(() => setIsPro(false));
    }
  }, [user?.id]);

  // Update local state when profile loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.full_name || user?.fullName || "");
      // Check if default_currency exists in profile (may need migration)
      if ((profile as any).default_currency) {
        setDefaultCurrency((profile as any).default_currency);
      }
    } else if (user) {
      setDisplayName(user.fullName || "");
    }
  }, [profile, user]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          full_name: displayName || null,
          default_currency: defaultCurrency,
        }, {
          onConflict: "id",
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      addToast({
        variant: "success",
        title: "Settings saved",
        description: "Your account settings have been updated.",
      });
    },
    onError: (error) => {
      console.error("Error saving profile:", error);
      addToast({
        variant: "destructive",
        title: "Failed to save settings",
        description: "Please try again.",
      });
    },
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveProfile.mutateAsync();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and settings.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your account information from Clerk
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={user.fullName || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Managed by Clerk
              </p>
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={user.primaryEmailAddress?.emailAddress || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Managed by Clerk
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Subscription / Upgrade Section */}
        <Card className={`mt-6 ${showUpgrade ? 'ring-2 ring-purple-500' : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>
                  {isPro ? 'You have Pro access' : 'Upgrade to unlock unlimited features'}
                </CardDescription>
              </div>
              {isPro && (
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">Pro</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isPro ? (
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="font-semibold mb-3 text-purple-900">Pro Benefits</h3>
                  <ul className="space-y-2 text-sm text-purple-800">
                    <li className="flex items-center gap-2 font-semibold text-base">
                      <Check className="h-5 w-5 text-purple-600" />
                      <span>Higher swipe limits (100 per trip)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-purple-600" />
                      <span>Advanced filters (budget & distance)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-purple-600" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-4">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const response = await fetch("/api/billing/portal", {
                          method: "POST",
                        });

                        if (!response.ok) {
                          const error = await response.json();
                          throw new Error(error.error || "Failed to open billing portal");
                        }

                        const { url } = await response.json();
                        if (url) {
                          window.location.href = url;
                        }
                      } catch (error) {
                        console.error("Error opening billing portal:", error);
                        addToast({
                          variant: "destructive",
                          title: "Failed to open billing portal",
                          description: "Please try again.",
                        });
                      }
                    }}
                  >
                    Manage Subscription
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Thank you for being a Pro member!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <h3 className="font-semibold mb-3">Upgrade to Pro</h3>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-center gap-2 font-semibold text-base">
                      <Check className="h-5 w-5 text-purple-600" />
                      <span>Higher swipe limits (100 per trip)</span>
                      <span className="text-xs text-muted-foreground font-normal">(vs 10 free)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-purple-600" />
                      <span>Advanced filters: budget & distance</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-purple-600" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    size="lg"
                    onClick={async () => {
                      try {
                        const response = await fetch("/api/billing/checkout/subscription", {
                          method: "POST",
                        });

                        if (!response.ok) {
                          const error = await response.json();
                          throw new Error(error.error || "Failed to create checkout session");
                        }

                        const { url } = await response.json();
                        if (url) {
                          window.location.href = url;
                        }
                      } catch (error) {
                        console.error("Error creating checkout:", error);
                        addToast({
                          variant: "destructive",
                          title: "Failed to start checkout",
                          description: "Please try again.",
                        });
                      }
                    }}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Upgrade to Pro
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Free plan includes 10 swipes per trip. Upgrade for higher limits (100 per trip).
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>
              Customize your display name and default currency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="Enter your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This name will be shown to other trip members
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultCurrency">Default Currency</Label>
              <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
                <SelectTrigger id="defaultCurrency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Default currency for new trips
              </p>
            </div>
            <div className="pt-4">
              <Button
                onClick={handleSave}
                disabled={isSaving || saveProfile.isPending}
              >
                {isSaving || saveProfile.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    }>
      <SettingsPageContent />
    </Suspense>
  );
}

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const showUpgrade = searchParams?.get('upgrade') === 'true';
  
  return <SettingsContent showUpgrade={showUpgrade} />;
}

