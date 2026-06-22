import {
  GeocodeErrorCode,
  validateAddressInput,
  validateTokenInput,
} from "./validation";

export { GeocodeErrorCode };

/**
 * Geocodes an address string using the Mapbox Geocoding API.
 *
 * @param {string} address - The address to geocode.
 * @param {string} token - A valid Mapbox access token.
 * @returns {Promise<{ok: boolean, lng?: number, lat?: number, code?: string, error?: string}>}
 */
export async function geocodeAddress(address, token) {
  const addressValidation = validateAddressInput(address);
  if (!addressValidation.valid) {
    return {
      ok: false,
      code: addressValidation.code,
      error: addressValidation.error,
    };
  }

  const tokenValidation = validateTokenInput(token);
  if (!tokenValidation.valid) {
    return {
      ok: false,
      code: tokenValidation.code,
      error: tokenValidation.error,
    };
  }

  const cleanAddress = addressValidation.trimmed;

  try {
    const response = await fetch(
      `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(
        cleanAddress
      )}&access_token=${token}`
    );

    if (!response.ok) {
      return {
        ok: false,
        code: GeocodeErrorCode.HTTP_ERROR,
        error: `Geocoding request failed (HTTP ${response.status}).`,
      };
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return {
        ok: false,
        code: GeocodeErrorCode.NO_RESULTS,
        error: "No results found for that address.",
      };
    }

    const [lng, lat] = data.features[0].geometry.coordinates;
    return { ok: true, lng, lat };
  } catch (error) {
    return {
      ok: false,
      code: GeocodeErrorCode.NETWORK_ERROR,
      error: `Geocoding failed: ${error.message}`,
    };
  }
}
