import {
  highlightNearestBuilding,
  clearHighlight,
  _resetHighlightState,
} from "../../lib/buildingHighlight";

function createMockMap() {
  return {
    project: jest.fn(() => ({ x: 100, y: 100 })),
    queryRenderedFeatures: jest.fn(() => []),
    setFeatureState: jest.fn(),
    removeFeatureState: jest.fn(),
  };
}

afterEach(() => {
  _resetHighlightState();
});

describe("highlightNearestBuilding", () => {
  it("returns { found: false } when no buildings are rendered at the point", () => {
    const map = createMockMap();
    map.queryRenderedFeatures.mockReturnValue([]);

    const result = highlightNearestBuilding(map, -118.031, 33.977);

    expect(result).toEqual({ found: false });
    expect(map.setFeatureState).not.toHaveBeenCalled();
  });

  it("highlights the nearest building and returns its ID", () => {
    const map = createMockMap();
    map.queryRenderedFeatures.mockReturnValue([
      {
        id: 42,
        geometry: { coordinates: [[[-118.031, 33.977]]] },
      },
    ]);

    const result = highlightNearestBuilding(map, -118.031, 33.977);

    expect(result).toEqual({ found: true, buildingId: 42 });
    expect(map.setFeatureState).toHaveBeenCalledWith(
      { source: "composite", sourceLayer: "building", id: 42 },
      { highlighted: true }
    );
  });

  it("clears previous highlight before setting a new one", () => {
    const map = createMockMap();

    // First highlight
    map.queryRenderedFeatures.mockReturnValue([
      { id: 10, geometry: { coordinates: [[[-118.031, 33.977]]] } },
    ]);
    highlightNearestBuilding(map, -118.031, 33.977);

    // Second highlight — should clear building 10 first
    map.queryRenderedFeatures.mockReturnValue([
      { id: 20, geometry: { coordinates: [[[-118.032, 33.978]]] } },
    ]);
    highlightNearestBuilding(map, -118.032, 33.978);

    expect(map.removeFeatureState).toHaveBeenCalledWith({
      source: "composite",
      sourceLayer: "building",
      id: 10,
    });
    expect(map.setFeatureState).toHaveBeenLastCalledWith(
      { source: "composite", sourceLayer: "building", id: 20 },
      { highlighted: true }
    );
  });

  it("returns { found: false } when closest feature has no id", () => {
    const map = createMockMap();
    map.queryRenderedFeatures.mockReturnValue([
      {
        geometry: { coordinates: [[[-118.031, 33.977]]] },
        // no id property
      },
    ]);

    const result = highlightNearestBuilding(map, -118.031, 33.977);

    expect(result).toEqual({ found: false });
    expect(map.setFeatureState).not.toHaveBeenCalled();
  });
});

describe("clearHighlight", () => {
  it("does nothing when no building is highlighted", () => {
    const map = createMockMap();

    clearHighlight(map);

    expect(map.removeFeatureState).not.toHaveBeenCalled();
  });

  it("removes highlight from the previously highlighted building", () => {
    const map = createMockMap();

    // Set up a highlight first
    map.queryRenderedFeatures.mockReturnValue([
      { id: 99, geometry: { coordinates: [[[-118.031, 33.977]]] } },
    ]);
    highlightNearestBuilding(map, -118.031, 33.977);

    // Now clear
    clearHighlight(map);

    expect(map.removeFeatureState).toHaveBeenCalledWith({
      source: "composite",
      sourceLayer: "building",
      id: 99,
    });
  });
});
