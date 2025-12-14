/**
 * Validates Stripe environment variables and provides type-safe access to price IDs.
 * 
 * Ensures that STRIPE_PRICE_ID_PRO_YEARLY and STRIPE_PRICE_ID_PER_TRIP:
 * - Exist and are non-empty
 * - Start with 'price_' prefix (not 'prod_' or other invalid formats)
 * 
 * Throws descriptive errors to help developers fix configuration issues.
 */

/**
 * Validates that a Stripe price ID environment variable is set and has the correct format.
 * @param envVarName - The name of the environment variable (for error messages)
 * @param value - The value to validate
 * @throws Error if the value is missing or invalid
 */
function validatePriceId(envVarName: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(
      `${envVarName} is not set. Please add it to your environment variables.`
    );
  }

  if (!value.startsWith('price_')) {
    const truncated = value.length > 20 ? value.substring(0, 20) + '...' : value;
    throw new Error(
      `Invalid ${envVarName}. Expected a Price ID starting with 'price_' but got: '${truncated}'. Copy the Price API ID from Stripe product pricing.`
    );
  }

  return value;
}

/**
 * Validates all Stripe price ID environment variables.
 * @throws Error if any price ID is missing or invalid
 */
export function assertStripeEnv(): void {
  validatePriceId('STRIPE_PRICE_ID_PRO_YEARLY', process.env.STRIPE_PRICE_ID_PRO_YEARLY);
  validatePriceId('STRIPE_PRICE_ID_PER_TRIP', process.env.STRIPE_PRICE_ID_PER_TRIP);
}

/**
 * Returns validated Stripe price IDs.
 * Calls assertStripeEnv() internally to ensure all IDs are valid.
 * 
 * @returns Object containing validated price IDs
 * @throws Error if any price ID is missing or invalid
 */
export function getStripePriceIds(): {
  proYearly: string;
  perTrip: string;
} {
  assertStripeEnv();

  return {
    proYearly: process.env.STRIPE_PRICE_ID_PRO_YEARLY!,
    perTrip: process.env.STRIPE_PRICE_ID_PER_TRIP!,
  };
}
