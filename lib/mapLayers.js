/**
 * Adds the 3D building extrusion layer and house-number label layer to the map.
 *
 * Called once from the map's onLoad handler. Safe to call multiple times —
 * skips layers that already exist.
 *
 * @param {import('mapbox-gl').Map} map - The Mapbox GL map instance.
 */
export function addBuildingLayers(map) {
  if (!map.getLayer("3d-buildings")) {
    map.addLayer({
      id: "3d-buildings",
      source: "composite",
      "source-layer": "building",
      type: "fill-extrusion",
      minzoom: 15,
      paint: {
        "fill-extrusion-color": [
          "case",
          ["boolean", ["feature-state", "highlighted"], false],
          "#ff0000",
          "#aaa",
        ],
        "fill-extrusion-height": ["get", "height"],
        "fill-extrusion-opacity": 0.6,
      },
    });
  }

  if (!map.getLayer("housenum-label")) {
    map.addLayer({
      id: "housenum-label",
      type: "symbol",
      source: "composite",
      "source-layer": "housenum_label",
      minzoom: 19,
      layout: {
        "text-field": ["get", "house_num"],
        "text-size": 18,
        "text-anchor": "center",
        "text-allow-overlap": true,
      },
      paint: {
        "text-color": "#000000",
        "text-halo-color": "#ffffff",
        "text-halo-width": 2,
      },
    });
  }
}
