/**
 * Tests for app/page.js — mocks all heavy dependencies so no Mapbox/browser
 * APIs are needed.
 */

// Auto-uses __mocks__/mapbox-gl.js (root-level manual mock for node_modules)
jest.mock("mapbox-gl");

// Mock next/dynamic to simply execute the loader and return the result
jest.mock("next/dynamic", () => {
  return function dynamic(loader) {
    // We return a placeholder that renders children — handles AddressAutofill
    const Passthrough = ({ children }) => children ?? null;
    Passthrough.displayName = "DynamicMock";
    return Passthrough;
  };
});

// Mock mapbox-gl CSS import
jest.mock("mapbox-gl/dist/mapbox-gl.css", () => {}, { virtual: true });

// Mock @mapbox/search-js-react AddressAutofill to simply render its children
jest.mock("@mapbox/search-js-react", () => ({
  AddressAutofill: ({ children }) => children,
}));

// Mock react-map-gl Map component
jest.mock("react-map-gl", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../../lib/geocode", () => ({
  geocodeAddress: jest.fn(),
}));

jest.mock("../../lib/buildingHighlight", () => ({
  highlightNearestBuilding: jest.fn(),
}));

jest.mock("../../lib/mapLayers", () => ({
  addBuildingLayers: jest.fn(),
}));

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { geocodeAddress } from "../../lib/geocode";
import Home from "../../app/page";

afterEach(() => {
  jest.clearAllMocks();
});

describe("Home page", () => {
  it("renders the address search input", () => {
    render(<Home />);
    expect(screen.getByPlaceholderText("Enter an address")).toBeInTheDocument();
  });

  it("renders the Search button", () => {
    render(<Home />);
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("renders all map control buttons", () => {
    render(<Home />);
    expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
    expect(screen.getByLabelText("Zoom out")).toBeInTheDocument();
    expect(screen.getByLabelText("Rotate left")).toBeInTheDocument();
    expect(screen.getByLabelText("Rotate right")).toBeInTheDocument();
    expect(screen.getByLabelText("Tilt up")).toBeInTheDocument();
    expect(screen.getByLabelText("Tilt down")).toBeInTheDocument();
  });

  it("updates address state when user types in the input", () => {
    render(<Home />);
    const input = screen.getByPlaceholderText("Enter an address");
    fireEvent.change(input, { target: { value: "123 Main St" } });
    expect(input.value).toBe("123 Main St");
  });

  it("shows error message when geocodeAddress returns ok:false", async () => {
    geocodeAddress.mockResolvedValueOnce({
      ok: false,
      error: "No results found for that address.",
    });

    render(<Home />);
    fireEvent.change(screen.getByPlaceholderText("Enter an address"), {
      target: { value: "Nowhere" },
    });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(
        screen.getByText("No results found for that address.")
      ).toBeInTheDocument();
    });
  });

  it("clears previous error when a new search starts", async () => {
    geocodeAddress
      .mockResolvedValueOnce({ ok: false, error: "First error" })
      .mockResolvedValueOnce({ ok: false, error: "Second error" });

    render(<Home />);
    const input = screen.getByPlaceholderText("Enter an address");
    const btn = screen.getByRole("button", { name: /search/i });

    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.click(btn);
    await waitFor(() => screen.getByText("First error"));

    fireEvent.change(input, { target: { value: "b" } });
    fireEvent.click(btn);
    await waitFor(() => screen.getByText("Second error"));
    expect(screen.queryByText("First error")).not.toBeInTheDocument();
  });

  it("calls geocodeAddress with the typed address on Search click", async () => {
    geocodeAddress.mockResolvedValueOnce({ ok: false, error: "nope" });

    render(<Home />);
    fireEvent.change(screen.getByPlaceholderText("Enter an address"), {
      target: { value: "Times Square" },
    });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(geocodeAddress).toHaveBeenCalledTimes(1);
      expect(geocodeAddress.mock.calls[0][0]).toBe("Times Square");
    });
  });

  it("does not show error message on initial render", () => {
    render(<Home />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
