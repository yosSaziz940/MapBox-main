import { geocodeAddress, GeocodeErrorCode } from "../../lib/geocode";
import { validateAddressInput, validateTokenInput } from "../../lib/validation";

// Mock global fetch
global.fetch = jest.fn();

afterEach(() => {
  jest.resetAllMocks();
});

describe("validateAddressInput", () => {
  it("returns valid:true and trimmed string for valid address", () => {
    const res = validateAddressInput("  123 Main St  ");
    expect(res).toEqual({ valid: true, trimmed: "123 Main St" });
  });

  it("returns EMPTY_ADDRESS error code for empty or whitespace string", () => {
    expect(validateAddressInput("")).toEqual({
      valid: false,
      code: GeocodeErrorCode.EMPTY_ADDRESS,
      error: "Please enter an address.",
    });
    expect(validateAddressInput("   ")).toEqual({
      valid: false,
      code: GeocodeErrorCode.EMPTY_ADDRESS,
      error: "Please enter an address.",
    });
    expect(validateAddressInput(null)).toEqual({
      valid: false,
      code: GeocodeErrorCode.EMPTY_ADDRESS,
      error: "Please enter an address.",
    });
  });
});

describe("validateTokenInput", () => {
  it("returns valid:true for non-empty token", () => {
    expect(validateTokenInput("my-token")).toEqual({ valid: true });
  });

  it("returns MISSING_TOKEN error code for empty token", () => {
    expect(validateTokenInput("")).toEqual({
      valid: false,
      code: GeocodeErrorCode.MISSING_TOKEN,
      error: "Mapbox token is not configured.",
    });
  });
});

describe("geocodeAddress", () => {
  const TOKEN = "test-token";

  it("returns ok:true with coordinates for a valid address", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        features: [
          {
            geometry: { coordinates: [-118.031, 33.977] },
          },
        ],
      }),
    });

    const result = await geocodeAddress("123 Main St", TOKEN);

    expect(result).toEqual({ ok: true, lng: -118.031, lat: 33.977 });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("123%20Main%20St")
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`access_token=${TOKEN}`)
    );
  });

  it("returns ok:false with EMPTY_ADDRESS code when address is empty", async () => {
    const result = await geocodeAddress("", TOKEN);

    expect(result.ok).toBe(false);
    expect(result.code).toBe(GeocodeErrorCode.EMPTY_ADDRESS);
    expect(result.error).toMatch(/enter an address/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns ok:false with EMPTY_ADDRESS code when address is whitespace-only", async () => {
    const result = await geocodeAddress("   ", TOKEN);

    expect(result.ok).toBe(false);
    expect(result.code).toBe(GeocodeErrorCode.EMPTY_ADDRESS);
    expect(result.error).toMatch(/enter an address/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns ok:false with MISSING_TOKEN code when token is missing", async () => {
    const result = await geocodeAddress("123 Main St", "");

    expect(result.ok).toBe(false);
    expect(result.code).toBe(GeocodeErrorCode.MISSING_TOKEN);
    expect(result.error).toMatch(/token/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns ok:false with NO_RESULTS code when API returns no features", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ features: [] }),
    });

    const result = await geocodeAddress("Unknown Place", TOKEN);

    expect(result.ok).toBe(false);
    expect(result.code).toBe(GeocodeErrorCode.NO_RESULTS);
    expect(result.error).toMatch(/no results/i);
  });

  it("returns ok:false with HTTP_ERROR code when API returns a non-OK status", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const result = await geocodeAddress("123 Main St", TOKEN);

    expect(result.ok).toBe(false);
    expect(result.code).toBe(GeocodeErrorCode.HTTP_ERROR);
    expect(result.error).toMatch(/401/);
  });

  it("returns ok:false with NETWORK_ERROR code when fetch throws a network error", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await geocodeAddress("123 Main St", TOKEN);

    expect(result.ok).toBe(false);
    expect(result.code).toBe(GeocodeErrorCode.NETWORK_ERROR);
    expect(result.error).toMatch(/network error/i);
  });
});
