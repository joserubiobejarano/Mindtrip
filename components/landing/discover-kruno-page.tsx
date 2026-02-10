"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarRange, MapPin, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { DestinationAutocomplete, type DestinationOption as AutocompleteDestinationOption } from "@/components/destination-autocomplete";
import { useCreateTrip, type DestinationOption } from "@/hooks/use-create-trip";
import { useLanguage } from "@/components/providers/language-provider";
import {
  getStoredCoupon,
  getStoredUtm,
  persistAttributionFromUrl,
  postAttributionIfAuthed,
  type UtmPayload,
} from "@/lib/attribution/client";

const UTM_KEYS: Array<keyof UtmPayload> = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
];

const buildQueryString = (utms: UtmPayload) => {
  const params = new URLSearchParams();
  UTM_KEYS.forEach((key) => {
    const value = utms[key];
    if (value) params.set(key, value);
  });
  return params.toString();
};

const trackLandingEvent = (name: string, payload: Record<string, unknown>) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[analytics] ${name}`, payload);
  }
};

export function DiscoverKrunoPage({ isSignedIn = false }: { isSignedIn?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createTrip, loading: creatingTrip } = useCreateTrip();
  const { t } = useLanguage();

  const [destinationInput, setDestinationInput] = useState("");
  const [selectedDestination, setSelectedDestination] = useState<AutocompleteDestinationOption | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [storedUtm, setStoredUtm] = useState<UtmPayload | null>(null);
  const [storedCoupon, setStoredCoupon] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement | null>(null);

  const utmsFromUrl = useMemo<UtmPayload>(() => {
    const payload: UtmPayload = {};
    UTM_KEYS.forEach((key) => {
      const value = searchParams.get(key);
      if (value) {
        payload[key] = value;
      }
    });
    return payload;
  }, [searchParams]);

  const utmQueryString = useMemo(() => buildQueryString(utmsFromUrl), [utmsFromUrl]);

  const displayUtmContent = useMemo(() => {
    const candidate = searchParams.get("utm_content") || storedUtm?.utm_content || "";
    const trimmed = candidate.trim();
    if (!trimmed) return null;
    if (trimmed.length > 30) return null;
    if (!/^[A-Za-z0-9._@]+$/.test(trimmed)) return null;
    return trimmed;
  }, [searchParams, storedUtm]);

  const couponFromUrl = useMemo(() => searchParams.get("coupon")?.trim() || "", [searchParams]);
  const hasCoupon = Boolean(couponFromUrl || storedCoupon);

  useEffect(() => {
    persistAttributionFromUrl(searchParams);
    setStoredUtm(getStoredUtm());
    setStoredCoupon(getStoredCoupon());
  }, [searchParams]);

  useEffect(() => {
    if (!isSignedIn) return;
    void postAttributionIfAuthed();
  }, [isSignedIn]);

  useEffect(() => {
    trackLandingEvent("landing_view", { ...utmsFromUrl, hasCoupon });
  }, [utmsFromUrl, hasCoupon]);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePrimaryCta = () => {
    trackLandingEvent("cta_create_trip_click", { ...utmsFromUrl, hasCoupon });
    scrollToForm();
  };

  const handleBottomCta = () => {
    trackLandingEvent("cta_create_trip_click", { ...utmsFromUrl, hasCoupon });
    scrollToForm();
  };

  const handleStartPlanning = async (event: React.FormEvent) => {
    event.preventDefault();
    setSearchError(null);

    if (!selectedDestination) {
      setSearchError(
        destinationInput.trim()
          ? t("discover_error_select_city")
          : t("discover_error_enter_destination")
      );
      return;
    }

    if (!startDate || !endDate) {
      setSearchError(t("discover_error_select_dates"));
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setSearchError(t("discover_error_end_after_start"));
      return;
    }

    if (!isSignedIn) {
      const redirectTarget = `/discover-kruno${utmQueryString ? `?${utmQueryString}` : ""}`;
      router.push(`/sign-up?redirect_url=${encodeURIComponent(redirectTarget)}`);
      return;
    }

    const destinationObj: DestinationOption = {
      id: selectedDestination.placeId,
      placeName: selectedDestination.name,
      region: selectedDestination.country,
      type: "City",
      center: selectedDestination.center,
    };

    await createTrip({
      destination: destinationObj,
      startDate,
      endDate,
    });
  };

  return (
    <div className="bg-background">
      <section className="px-6 pt-14 pb-16">
        <div className="max-w-6xl mx-auto grid gap-10 items-center lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-7 text-center lg:text-left">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-foreground font-hand text-balance">
                {t("discover_hero_title")}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-xl lg:mx-0 mx-auto">
                {t("discover_hero_subtitle")}
              </p>
            </div>

            <ul className="space-y-3 text-sm md:text-base text-foreground">
              <li className="flex items-start justify-center gap-2 lg:justify-start">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                {t("discover_feature_city_breaks")}
              </li>
              <li className="flex items-start justify-center gap-2 lg:justify-start">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                {t("discover_feature_couples")}
              </li>
              <li className="flex items-start justify-center gap-2 lg:justify-start">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                {t("discover_feature_no_bookings")}
              </li>
            </ul>

            <Button
              onClick={handlePrimaryCta}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs tracking-wider uppercase rounded-full px-8 h-12 shadow-md"
            >
              {t("discover_primary_cta")}
            </Button>
            <p className="text-xs text-muted-foreground">
              {displayUtmContent
                ? t("discover_utm_offer").replace("{source}", displayUtmContent)
                : t("discover_default_offer")}
            </p>
          </div>
          <div className="bg-card rounded-3xl shadow-lg p-3 md:p-4">
            <div className="relative w-full overflow-hidden rounded-2xl aspect-[4/3]">
              <Image
                src="https://images.unsplash.com/photo-1431274172761-fca41d930114?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGVpZmZlbCUyMHRvd2VyfGVufDF8fHx8MTc2NDA3NTkwMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt={t("discover_image_alt")}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
                quality={75}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section ref={formRef} id="create-trip" className="px-6 pb-16">
        <div className="max-w-4xl mx-auto bg-card rounded-3xl shadow-xl p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-normal font-hand text-foreground mb-6">
            {t("discover_form_title")}
          </h2>
          <form onSubmit={handleStartPlanning}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
              <div className="flex flex-col items-start md:col-span-5">
                <label className="font-mono text-[10px] tracking-wider uppercase text-foreground font-semibold mb-2">
                  {t("discover_form_where_to")}
                </label>
                <div className="relative w-full">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                    <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-muted-foreground" strokeWidth={2} />
                    </div>
                  </div>
                  <DestinationAutocomplete
                    value={destinationInput}
                    onChange={setDestinationInput}
                    onSelect={(dest) => {
                      setSelectedDestination(dest);
                      setDestinationInput(dest.description);
                    }}
                    inputClassName="pl-16 bg-accent border-0 rounded-xl h-12 font-body placeholder:text-muted-foreground text-base"
                    placeholder={t("discover_form_placeholder_city")}
                  />
                </div>
              </div>

              <div className="flex flex-col items-start md:col-span-4">
                <label className="font-mono text-[10px] tracking-wider uppercase text-foreground font-semibold mb-2">
                  {t("discover_form_dates")}
                </label>
                <div className="relative w-full">
                  <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                    className="w-full pl-12 bg-secondary border-0 rounded-xl h-12 font-body text-left justify-start hover:bg-secondary text-base"
                    placeholder={t("discover_form_add_dates")}
                    hideIcon={true}
                  />
                </div>
              </div>

              <div className="flex flex-col justify-end md:col-span-3">
                <Button
                  type="submit"
                  disabled={creatingTrip}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs tracking-wider uppercase rounded-xl h-12 gap-2 w-full px-6"
                >
                  {t("discover_form_submit")}
                </Button>
              </div>
            </div>
          </form>

          {searchError && <div className="text-sm text-destructive text-center">{searchError}</div>}
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
          <div className="bg-card rounded-2xl p-6 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center mb-4">
              <MapPin className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">{t("discover_steps_pick_title")}</h3>
            <p className="text-sm text-muted-foreground">{t("discover_steps_pick_desc")}</p>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center mb-4">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">{t("discover_steps_itinerary_title")}</h3>
            <p className="text-sm text-muted-foreground">{t("discover_steps_itinerary_desc")}</p>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center mb-4">
              <Share2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">{t("discover_steps_share_title")}</h3>
            <p className="text-sm text-muted-foreground">{t("discover_steps_share_desc")}</p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto bg-secondary/40 rounded-2xl p-6 text-center">
          <p className="text-sm md:text-base text-muted-foreground">
            {t("discover_social_proof")}
          </p>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2">
          <div className="bg-card rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-4">{t("discover_what_is_title")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{t("discover_what_is_item_1")}</li>
              <li>{t("discover_what_is_item_2")}</li>
              <li>{t("discover_what_is_item_3")}</li>
            </ul>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-4">{t("discover_what_isnt_title")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{t("discover_what_isnt_item_1")}</li>
              <li>{t("discover_what_isnt_item_2")}</li>
              <li>{t("discover_what_isnt_item_3")}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto bg-card rounded-3xl p-8 md:p-10 text-center shadow-lg">
          <h2 className="text-2xl md:text-3xl font-normal font-hand text-foreground mb-4">
            {t("discover_bottom_title")}
          </h2>
          <Button
            onClick={handleBottomCta}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs tracking-wider uppercase rounded-full px-8 h-12 shadow-md"
          >
            {t("discover_bottom_cta")}
          </Button>
          <p className="text-xs text-muted-foreground mt-3">{t("discover_bottom_note")}</p>
        </div>
      </section>
    </div>
  );
}
