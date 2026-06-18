/**
 * Error codes for geocoding operations.
 * @readonly
 * @enum {string}
 */
export const GeocodeErrorCode = {
  EMPTY_ADDRESS: "EMPTY_ADDRESS",
  MISSING_TOKEN: "MISSING_TOKEN",
  HTTP_ERROR: "HTTP_ERROR",
  NO_RESULTS: "NO_RESULTS",
  NETWORK_ERROR: "NETWORK_ERROR",
};

/**
 * Validates an address input string.
 *
 * @param {string} address
 * @returns {{ valid: boolean, error?: string, code?: string, trimmed?: string }}
 */
export function validateAddressInput(address) {
  if (!address || typeof address !== "string" || !address.trim()) {
    return {
      valid: false,
      code: GeocodeErrorCode.EMPTY_ADDRESS,
      error: "Please enter an address.",
    };
  }
  return { valid: true, trimmed: address.trim() };
}

/**
 * Validates a Mapbox API token.
 *
 * @param {string} token
 * @returns {{ valid: boolean, error?: string, code?: string }}
 */
export function validateTokenInput(token) {
  if (!token || typeof token !== "string" || !token.trim()) {
    return {
      valid: false,
      code: GeocodeErrorCode.MISSING_TOKEN,
      error: "Mapbox token is not configured.",
    };
  }
  return { valid: true };
}
