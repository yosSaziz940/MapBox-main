import {
  validateAddressInput,
  validateTokenInput,
  GeocodeErrorCode,
} from "../../lib/validation";

describe("validateAddressInput", () => {
  it("returns valid: true and trimmed address for non-empty input", () => {
    const result = validateAddressInput("  1600 Pennsylvania Ave NW  ");
    expect(result).toEqual({
      valid: true,
      trimmed: "1600 Pennsylvania Ave NW",
    });
  });

  it("returns EMPTY_ADDRESS error code for null, empty, or whitespace string", () => {
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
  it("returns valid: true for non-empty token string", () => {
    expect(validateTokenInput("pk.valid_token_string")).toEqual({
      valid: true,
    });
  });

  it("returns MISSING_TOKEN error code for empty or null token", () => {
    expect(validateTokenInput("")).toEqual({
      valid: false,
      code: GeocodeErrorCode.MISSING_TOKEN,
      error: "Mapbox token is not configured.",
    });
    expect(validateTokenInput(null)).toEqual({
      valid: false,
      code: GeocodeErrorCode.MISSING_TOKEN,
      error: "Mapbox token is not configured.",
    });
  });
});
