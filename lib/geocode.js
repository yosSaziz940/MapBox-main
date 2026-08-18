/**
 * Geocodes an address string using the Mapbox Geocoding API.
 *
 * @param {string} address - The address to geocode.
 * @param {string} token - A valid Mapbox access token.
 * @returns {Promise<{ok: boolean, lng?: number, lat?: number, error?: string}>}
 */
export async function geocodeAddress(address, token) {
  if (!address || !address.trim()) {
    return { ok: false, error: "Please enter an address." };
  }

  if (!token) {
    return { ok: false, error: "Mapbox token is not configured." };
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(
        address.trim()
      )}&access_token=${token}`
    );

    if (!response.ok) {
      return {
        ok: false,
        error: `Geocoding request failed (HTTP ${response.status}).`,
      };
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return { ok: false, error: "No results found for that address." };
    }

    const [lng, lat] = data.features[0].geometry.coordinates;
    return { ok: true, lng, lat };
  } catch (error) {
    return {
      ok: false,
      error: `Geocoding failed: ${error.message}`,
    };
  }
}
