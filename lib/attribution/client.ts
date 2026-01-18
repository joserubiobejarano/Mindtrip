export type UtmPayload = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
};

const COUPON_STORAGE_KEY = "kruno_coupon";
const UTM_STORAGE_KEY = "kruno_utm";
const ATTRIBUTION_POSTED_KEY = "kruno_attribution_posted";
const UTM_KEYS: Array<keyof UtmPayload> = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
];

const safelyGetLocalStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const persistAttributionFromUrl = (searchParams: URLSearchParams | null) => {
  if (!searchParams) return;

  const storage = safelyGetLocalStorage();
  if (!storage) return;

  const coupon = searchParams.get("coupon")?.trim();
  if (coupon) {
    try {
      storage.setItem(COUPON_STORAGE_KEY, coupon);
    } catch {
      // Ignore storage errors.
    }
  }

  const utmUpdates: UtmPayload = {};
  UTM_KEYS.forEach((key) => {
    const value = searchParams.get(key)?.trim();
    if (value) {
      utmUpdates[key] = value;
    }
  });

  if (Object.keys(utmUpdates).length === 0) return;

  try {
    const existingRaw = storage.getItem(UTM_STORAGE_KEY);
    const existing = existingRaw ? (JSON.parse(existingRaw) as UtmPayload) : {};
    storage.setItem(UTM_STORAGE_KEY, JSON.stringify({ ...existing, ...utmUpdates }));
  } catch {
    // Ignore storage errors.
  }
};

export const getStoredCoupon = () => {
  const storage = safelyGetLocalStorage();
  if (!storage) return null;
  try {
    const value = storage.getItem(COUPON_STORAGE_KEY);
    return value?.trim() || null;
  } catch {
    return null;
  }
};

export const getStoredUtm = (): UtmPayload | null => {
  const storage = safelyGetLocalStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(UTM_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UtmPayload) : null;
  } catch {
    return null;
  }
};

export const clearStoredCoupon = () => {
  const storage = safelyGetLocalStorage();
  if (!storage) return;
  try {
    storage.removeItem(COUPON_STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
};

export const getStoredAttribution = () => {
  const utm = getStoredUtm();
  const coupon = getStoredCoupon();

  return {
    utm_source: utm?.utm_source,
    utm_medium: utm?.utm_medium,
    utm_campaign: utm?.utm_campaign,
    utm_content: utm?.utm_content,
    coupon_code: coupon || undefined,
  };
};

const hasAttributionData = (payload: ReturnType<typeof getStoredAttribution>) =>
  Boolean(
    payload.utm_source ||
      payload.utm_medium ||
      payload.utm_campaign ||
      payload.utm_content ||
      payload.coupon_code
  );

const getAttributionPostedFlag = () => {
  const storage = safelyGetLocalStorage();
  if (!storage) return false;
  try {
    return storage.getItem(ATTRIBUTION_POSTED_KEY) === "1";
  } catch {
    return false;
  }
};

const setAttributionPostedFlag = () => {
  const storage = safelyGetLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(ATTRIBUTION_POSTED_KEY, "1");
  } catch {
    // Ignore storage errors.
  }
};

export const postAttributionIfAuthed = async () => {
  try {
    if (getAttributionPostedFlag()) return;
    const payload = getStoredAttribution();
    if (!hasAttributionData(payload)) return;

    const response = await fetch("/api/attribution", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return;
    setAttributionPostedFlag();
  } catch {
    // Ignore attribution failures.
  }
};
