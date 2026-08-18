/**
 * Manages 3D building highlighting on a Mapbox map.
 *
 * Tracks the last highlighted building internally so callers don't need to
 * manage feature-state bookkeeping.
 */

let lastHighlightedBuildingId = null;

/**
 * Clears the currently highlighted building, if any.
 *
 * @param {import('mapbox-gl').Map} map - The Mapbox GL map instance.
 */
export function clearHighlight(map) {
  if (lastHighlightedBuildingId !== null) {
    map.removeFeatureState({
      source: "composite",
      sourceLayer: "building",
      id: Number(lastHighlightedBuildingId),
    });
    lastHighlightedBuildingId = null;
  }
}

/**
 * Highlights the building nearest to the given coordinates.
 *
 * Automatically clears any previous highlight before applying a new one.
 *
 * @param {import('mapbox-gl').Map} map - The Mapbox GL map instance.
 * @param {number} lng - Longitude of the target point.
 * @param {number} lat - Latitude of the target point.
 * @returns {{ found: boolean, buildingId?: number }}
 */
export function highlightNearestBuilding(map, lng, lat) {
  clearHighlight(map);

  const point = map.project([lng, lat]);
  const features = map.queryRenderedFeatures(point, {
    layers: ["3d-buildings"],
  });

  if (!features || features.length === 0) {
    return { found: false };
  }

  let closestFeature = features[0];
  let minDistance = Number.MAX_VALUE;

  features.forEach((feature) => {
    if (
      !feature.geometry ||
      !feature.geometry.coordinates ||
      !feature.geometry.coordinates[0] ||
      !feature.geometry.coordinates[0][0]
    ) {
      return;
    }

    const [featureLng, featureLat] = feature.geometry.coordinates[0][0];
    const distance = Math.sqrt(
      Math.pow(featureLng - lng, 2) + Math.pow(featureLat - lat, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestFeature = feature;
    }
  });

  if (closestFeature.id === undefined) {
    return { found: false };
  }

  const buildingId = Number(closestFeature.id);
  map.setFeatureState(
    { source: "composite", sourceLayer: "building", id: buildingId },
    { highlighted: true }
  );

  lastHighlightedBuildingId = buildingId;
  return { found: true, buildingId };
}

/**
 * Resets the internal highlight tracking state.
 * Useful for testing to ensure a clean state between tests.
 */
export function _resetHighlightState() {
  lastHighlightedBuildingId = null;
}
