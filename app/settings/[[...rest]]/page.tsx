"use client";

import { useUser, UserProfile } from "@clerk/nextjs";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Sparkles, Check } from "lucide-react";
import { NewNavbar } from "@/components/new-navbar";

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
  const [activeTab, setActiveTab] = useState("account");

  // Fetch profile and subscription status
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("clerk_user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found" - that's okay, we'll create it
        throw error;
      }

      type ProfileQueryResult = {
        full_name: string | null
        default_currency?: string | null
        [key: string]: any
      }

      return data as ProfileQueryResult | null;
    },
    enabled: !!user?.id && isLoaded,
  });

  // Fetch subscription status using React Query
  const { data: subscriptionStatus, isLoading: isLoadingSubscription, error: subscriptionError } = useQuery({
    queryKey: ["subscription-status", user?.id],
    queryFn: async () => {
      if (!user?.id) return { isPro: false };
      const response = await fetch('/api/user/subscription-status');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }
      return response.json();
    },
    enabled: !!user?.id && isLoaded,
    retry: 1,
    staleTime: 60000, // Cache for 1 minute to prevent flicker
  });

  const isPro = subscriptionStatus?.isPro || false;

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

  // Auto-switch to billing tab if upgrade param is present
  useEffect(() => {
    if (showUpgrade) {
      setActiveTab("billing");
    }
  }, [showUpgrade]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");

      // Check if profile exists to get its id (UUID)
      const { data: existingProfileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .maybeSingle();
      
      const existingProfile = existingProfileData as { id: string } | null;

      // Generate UUID for new profiles, use existing id for updates
      // Use browser's crypto.randomUUID() for client-side generation
      const profileId = existingProfile?.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '');
      
      if (!profileId) {
        throw new Error('Unable to generate profile ID');
      }

      const { error } = await (supabase
        .from("profiles") as any)
        .upsert({
          id: profileId,
          clerk_user_id: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          full_name: displayName || null,
          default_currency: defaultCurrency,
        }, {
          onConflict: "clerk_user_id",
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

  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  const handleManageSubscription = async () => {
    setIsOpeningPortal(true);
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
      setIsOpeningPortal(false);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NewNavbar />
        <div className="p-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  const isLoadingBilling = isLoadingSubscription;

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <NewNavbar />
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account preferences and billing.
            </p>
          </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Mobile: Horizontal tabs */}
          <div className="block md:hidden mb-6">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>
          </div>

          {/* Desktop: Side navigation or horizontal tabs */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="hidden md:block md:w-48 flex-shrink-0">
              <TabsList className="flex flex-col h-auto w-full bg-transparent p-0">
                <TabsTrigger 
                  value="account" 
                  className="w-full justify-start data-[state=active]:bg-muted"
                >
                  Account
                </TabsTrigger>
                <TabsTrigger 
                  value="billing"
                  className="w-full justify-start data-[state=active]:bg-muted"
                >
                  Billing
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1">
              <TabsContent value="account" className="space-y-6 mt-0">
                {/* Clerk UserProfile Component */}
                <Card>
                  <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>
                      Manage your account information, security, and profile settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <UserProfile />
                  </CardContent>
                </Card>

                {/* Preferences Card */}
                <Card>
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
              </TabsContent>

              <TabsContent value="billing" className="space-y-6 mt-0">
                <Card className={showUpgrade ? 'ring-2 ring-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Billing</CardTitle>
                        <CardDescription className="mt-2">
                          {isLoadingBilling ? (
                            <span className="text-muted-foreground">Loading billing status...</span>
                          ) : subscriptionError ? (
                            <span className="text-destructive">Failed to load billing status</span>
                          ) : isPro ? (
                            <span>Current plan: Kruno Pro (Yearly)</span>
                          ) : (
                            <span>Current plan: Free</span>
                          )}
                        </CardDescription>
                      </div>
                      {isPro && !isLoadingBilling && !subscriptionError && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full">
                          <Sparkles className="h-4 w-4" />
                          <span className="text-sm font-medium">Pro</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingBilling ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <div className="animate-pulse space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                          <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                        </div>
                      </div>
                    ) : subscriptionError ? (
                      <div className="p-4 text-center">
                        <p className="text-sm text-destructive mb-2">
                          Failed to load billing status. Please refresh the page.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            queryClient.invalidateQueries({ queryKey: ["subscription-status", user?.id] });
                          }}
                        >
                          Retry
                        </Button>
                      </div>
                    ) : isPro ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg border">
                          <p className="text-sm font-medium mb-2">You&apos;re on Kruno Pro (Yearly)</p>
                          <p className="text-sm text-muted-foreground">
                            Your subscription is active.
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          You can change or cancel your subscription at any time in the Stripe billing portal.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-3">Upgrade to Kruno Pro</h3>
                          <ul className="space-y-2 text-sm mb-4">
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>Longer trips (more than 14 days)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>Bigger touristic places list (100 per trip vs 10 free)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>Multi-city itineraries</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>Advanced Explore filters (budget & distance)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>Higher itinerary regeneration limits</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>Unlimited active trips</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>Future collaboration tools (polls, comments, shared editing)</span>
                            </li>
                          </ul>
                        </div>
                        <Button
                          variant="default"
                          size="lg"
                          className="w-full"
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
                          Upgrade to Kruno Pro
                        </Button>
                      </div>
                    )}
                    
                    {/* Manage Subscription - Available for all users */}
                    {!isLoadingBilling && !subscriptionError && (
                      <div className="pt-6 border-t">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Subscription Management</h3>
                          <p className="text-sm text-muted-foreground">
                            Manage your payment methods, view invoices, and update your subscription settings.
                          </p>
                          <Button
                            variant="outline"
                            onClick={handleManageSubscription}
                            disabled={isOpeningPortal}
                            className="w-full sm:w-auto"
                          >
                            {isOpeningPortal ? "Opening..." : "Manage Subscription"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <NewNavbar />
        <div className="p-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-muted-foreground">Loading...</div>
          </div>
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
