/**
 * Expo Push Token Validation
 * Validates that a token matches Expo's standard push token format
 */

/**
 * Validates if a string is a valid Expo push token
 * 
 * @param token - The token string to validate
 * @returns true if token matches Expo format (ExponentPushToken[...] or ExpoPushToken[...])
 */
export function isValidExpoPushToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // Expo tokens follow format: ExponentPushToken[...] or ExpoPushToken[...]
  // The content inside brackets is alphanumeric with underscores and hyphens
  const expoPushTokenPattern = /^Expo(nent)?PushToken\[[a-zA-Z0-9_-]+\]$/;
  return expoPushTokenPattern.test(token);
}

