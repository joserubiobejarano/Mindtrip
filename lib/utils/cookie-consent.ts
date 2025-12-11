/**
 * Get the current cookie consent value from localStorage
 * @returns 'all' | 'essential' | null
 */
export function getCookieConsent(): "all" | "essential" | null {
  if (typeof window === "undefined") {
    return null;
  }
  const consent = localStorage.getItem("kruno_cookie_consent");
  if (consent === "all" || consent === "essential") {
    return consent;
  }
  return null;
}

/**
 * Check if user has consented to all cookies
 */
export function hasFullConsent(): boolean {
  return getCookieConsent() === "all";
}

/**
 * Check if user has given any consent (essential or all)
 */
export function hasConsent(): boolean {
  return getCookieConsent() !== null;
}
