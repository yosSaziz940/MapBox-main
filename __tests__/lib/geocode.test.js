import { geocodeAddress } from "../../lib/geocode";

// Mock global fetch
global.fetch = jest.fn();

afterEach(() => {
  jest.resetAllMocks();
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

  it("returns ok:false when address is empty", async () => {
    const result = await geocodeAddress("", TOKEN);

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/enter an address/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns ok:false when address is whitespace-only", async () => {
    const result = await geocodeAddress("   ", TOKEN);

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/enter an address/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns ok:false when token is missing", async () => {
    const result = await geocodeAddress("123 Main St", "");

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/token/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns ok:false when API returns no features", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ features: [] }),
    });

    const result = await geocodeAddress("Unknown Place", TOKEN);

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/no results/i);
  });

  it("returns ok:false when API returns a non-OK status", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const result = await geocodeAddress("123 Main St", TOKEN);

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/401/);
  });

  it("returns ok:false when fetch throws a network error", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await geocodeAddress("123 Main St", TOKEN);

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/network error/i);
  });
});
