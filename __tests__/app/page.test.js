/**
 * Tests for app/page.js — unit and integration tests for search, controls, and map orchestration.
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

// Mock mapbox-gl with chainable Marker mock
const mockMarkerInstance = {
  setLngLat: jest.fn().mockReturnThis(),
  addTo: jest.fn().mockReturnThis(),
  remove: jest.fn(),
};

jest.mock("mapbox-gl", () => ({
  Marker: jest.fn(() => mockMarkerInstance),
}));

// Mock mapbox-gl CSS import
jest.mock("mapbox-gl/dist/mapbox-gl.css", () => {}, { virtual: true });

// Mock @mapbox/search-js-react AddressAutofill to simply render its children
jest.mock("@mapbox/search-js-react", () => ({
  AddressAutofill: ({ children }) => children,
}));

// Mock react-map-gl Map component to attach ref and trigger onLoad
const mockMapInstance = {
  addLayer: jest.fn(),
  getLayer: jest.fn(() => null),
  flyTo: jest.fn(),
  project: jest.fn(() => ({ x: 100, y: 100 })),
  queryRenderedFeatures: jest.fn(() => [
    {
      id: 777,
      geometry: { coordinates: [[[-118.031, 33.977]]] },
    },
  ]),
  setFeatureState: jest.fn(),
  removeFeatureState: jest.fn(),
  zoomIn: jest.fn(),
  zoomOut: jest.fn(),
};

const MockMap = React.forwardRef(({ onLoad, children }, ref) => {
  React.useImperativeHandle(ref, () => ({
    getMap: () => mockMapInstance,
  }));
  React.useEffect(() => {
    if (onLoad) {
      onLoad({ target: mockMapInstance });
    }
  }, [onLoad]);
  return <div data-testid="mock-map">{children}</div>;
});
MockMap.displayName = "MockMap";

jest.mock("react-map-gl", () => ({
  __esModule: true,
  default: MockMap,
}));

// Mock next/dynamic to forward ref and props to loaded component
jest.mock("next/dynamic", () => {
  const React = require("react");
  return function dynamic(loader) {
    return React.forwardRef((props, ref) => {
      if (props.accessToken) {
        const AddressAutofill = ({ children }) => children;
        return <AddressAutofill {...props} ref={ref} />;
      }
      return <MockMap {...props} ref={ref} />;
    });
  };
});

jest.mock("../../lib/geocode", () => ({
  ...jest.requireActual("../../lib/geocode"),
  geocodeAddress: jest.fn(),
}));

jest.mock("../../lib/buildingHighlight", () => ({
  ...jest.requireActual("../../lib/buildingHighlight"),
  highlightNearestBuilding: jest.fn(),
}));

jest.mock("../../lib/mapLayers", () => ({
  ...jest.requireActual("../../lib/mapLayers"),
  addBuildingLayers: jest.fn(),
}));

import { geocodeAddress } from "../../lib/geocode";
import { highlightNearestBuilding } from "../../lib/buildingHighlight";
import { addBuildingLayers } from "../../lib/mapLayers";
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

  it("triggers map.flyTo and highlightNearestBuilding on successful geocode search (Integration)", async () => {
    const actualGeocode =
      jest.requireActual("../../lib/geocode").geocodeAddress;
    geocodeAddress.mockImplementationOnce((addr, token) =>
      actualGeocode(addr, token)
    );

    const actualHighlight = jest.requireActual(
      "../../lib/buildingHighlight"
    ).highlightNearestBuilding;
    highlightNearestBuilding.mockImplementationOnce((map, lng, lat) =>
      actualHighlight(map, lng, lat)
    );

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        features: [
          {
            geometry: { coordinates: [-118.031, 33.977] },
          },
        ],
      }),
    });

    render(<Home />);

    const input = screen.getByPlaceholderText("Enter an address");
    fireEvent.change(input, { target: { value: "100 Broadway" } });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(mockMapInstance.flyTo).toHaveBeenCalledWith(
        expect.objectContaining({
          center: [-118.031, 33.977],
          zoom: 18,
        })
      );
    });

    expect(mockMarkerInstance.setLngLat).toHaveBeenCalledWith([
      -118.031, 33.977,
    ]);
    expect(mockMarkerInstance.addTo).toHaveBeenCalledWith(mockMapInstance);
    expect(highlightNearestBuilding).toHaveBeenCalledWith(
      mockMapInstance,
      -118.031,
      33.977
    );
    expect(mockMapInstance.setFeatureState).toHaveBeenCalledWith(
      { source: "composite", sourceLayer: "building", id: 777 },
      { highlighted: true }
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("calls addBuildingLayers when map loads", () => {
    const actualAddLayers = jest.requireActual(
      "../../lib/mapLayers"
    ).addBuildingLayers;
    addBuildingLayers.mockImplementationOnce((map) => actualAddLayers(map));

    render(<Home />);
    expect(addBuildingLayers).toHaveBeenCalledWith(mockMapInstance);
    expect(mockMapInstance.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({ id: "3d-buildings" })
    );
  });
});
