import { getStoredAttribution } from "@/lib/attribution/client";

type UmamiPayload = Record<string, unknown>;

const isProduction = process.env.NODE_ENV === "production";

const buildPayload = (payload?: UmamiPayload) => {
  const attribution = getStoredAttribution();
  const merged: UmamiPayload = { ...(payload ?? {}) };

  (Object.keys(attribution) as Array<keyof typeof attribution>).forEach((key) => {
    const value = attribution[key];
    if (value !== undefined && value !== null && value !== "") {
      merged[key] = value;
    }
  });

  return merged;
};

export const trackUmamiEvent = (eventName: string, payload?: UmamiPayload) => {
  if (!isProduction || typeof window === "undefined") return;

  const umami = (window as Window & {
    umami?: { track?: (name: string, data?: UmamiPayload) => void };
  }).umami;

  if (!umami?.track) return;

  try {
    const mergedPayload = buildPayload(payload);
    if (Object.keys(mergedPayload).length > 0) {
      umami.track(eventName, mergedPayload);
    } else {
      umami.track(eventName);
    }
  } catch {
    // Ignore analytics errors.
  }
};
