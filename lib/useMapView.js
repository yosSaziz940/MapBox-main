import { useState, useCallback } from "react";

/**
 * Custom hook that manages map bearing/pitch state and exposes updateMapView.
 *
 * @param {{ initialBearing?: number, initialPitch?: number }} options
 * @returns {{ bearing: number, pitch: number, updateMapView: (newBearing: number, newPitch: number) => void }}
 */
export function useMapView({ initialBearing = -20, initialPitch = 60 } = {}) {
  const [bearing, setBearing] = useState(initialBearing);
  const [pitch, setPitch] = useState(initialPitch);

  /**
   * Updates the bearing and pitch state.
   * The caller is responsible for calling map.flyTo if a map ref is available.
   *
   * @param {number} newBearing
   * @param {number} newPitch
   */
  const updateMapView = useCallback((newBearing, newPitch) => {
    setBearing(newBearing);
    setPitch(newPitch);
  }, []);

  return { bearing, pitch, updateMapView };
}
