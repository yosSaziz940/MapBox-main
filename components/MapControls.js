"use client";

/**
 * MapControls — zoom, bearing, and pitch control buttons for the map.
 *
 * @param {{ mapRef: React.RefObject, bearing: number, pitch: number, onViewChange: (bearing: number, pitch: number) => void }} props
 */
export default function MapControls({ mapRef, bearing, pitch, onViewChange }) {
  const zoomIn = () => mapRef.current?.getMap().zoomIn();
  const zoomOut = () => mapRef.current?.getMap().zoomOut();

  return (
    <div className="absolute bottom-10 right-5 flex flex-col space-y-2 z-10">
      <button
        onClick={zoomIn}
        aria-label="Zoom in"
        className="bg-gray-800 text-white p-3 rounded shadow-md"
      >
        ➕
      </button>
      <button
        onClick={zoomOut}
        aria-label="Zoom out"
        className="bg-gray-800 text-white p-3 rounded shadow-md"
      >
        ➖
      </button>
      <button
        onClick={() => onViewChange(bearing - 10, pitch)}
        aria-label="Rotate left"
        className="bg-gray-800 text-white p-3 rounded shadow-md"
      >
        ←
      </button>
      <button
        onClick={() => onViewChange(bearing + 10, pitch)}
        aria-label="Rotate right"
        className="bg-gray-800 text-white p-3 rounded shadow-md"
      >
        →
      </button>
      <button
        onClick={() => onViewChange(bearing, Math.min(pitch + 5, 85))}
        aria-label="Tilt up"
        className="bg-gray-800 text-white p-3 rounded shadow-md"
      >
        ↑
      </button>
      <button
        onClick={() => onViewChange(bearing, Math.max(pitch - 5, 0))}
        aria-label="Tilt down"
        className="bg-gray-800 text-white p-3 rounded shadow-md"
      >
        ↓
      </button>
    </div>
  );
}
