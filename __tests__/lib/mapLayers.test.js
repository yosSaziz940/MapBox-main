import { addBuildingLayers } from "../../lib/mapLayers";

function createMockMap(existingLayers = []) {
  return {
    addLayer: jest.fn(),
    getLayer: jest.fn((id) => (existingLayers.includes(id) ? {} : null)),
  };
}

describe("addBuildingLayers", () => {
  it("adds both layers when neither exists", () => {
    const map = createMockMap([]);

    addBuildingLayers(map);

    expect(map.addLayer).toHaveBeenCalledTimes(2);
    expect(map.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({ id: "3d-buildings" })
    );
    expect(map.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({ id: "housenum-label" })
    );
  });

  it("skips 3d-buildings layer when it already exists", () => {
    const map = createMockMap(["3d-buildings"]);

    addBuildingLayers(map);

    expect(map.addLayer).toHaveBeenCalledTimes(1);
    expect(map.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({ id: "housenum-label" })
    );
  });

  it("skips housenum-label layer when it already exists", () => {
    const map = createMockMap(["housenum-label"]);

    addBuildingLayers(map);

    expect(map.addLayer).toHaveBeenCalledTimes(1);
    expect(map.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({ id: "3d-buildings" })
    );
  });

  it("adds no layers when both already exist", () => {
    const map = createMockMap(["3d-buildings", "housenum-label"]);

    addBuildingLayers(map);

    expect(map.addLayer).not.toHaveBeenCalled();
  });

  it("configures 3d-buildings as fill-extrusion type", () => {
    const map = createMockMap([]);

    addBuildingLayers(map);

    const buildingCall = map.addLayer.mock.calls.find(
      (call) => call[0].id === "3d-buildings"
    );
    expect(buildingCall[0].type).toBe("fill-extrusion");
    expect(buildingCall[0].minzoom).toBe(15);
  });

  it("configures housenum-label as symbol type with minzoom 19", () => {
    const map = createMockMap([]);

    addBuildingLayers(map);

    const labelCall = map.addLayer.mock.calls.find(
      (call) => call[0].id === "housenum-label"
    );
    expect(labelCall[0].type).toBe("symbol");
    expect(labelCall[0].minzoom).toBe(19);
  });
});
