import { renderHook, act } from "@testing-library/react";
import { useMapView } from "../../lib/useMapView";

describe("useMapView", () => {
  it("returns default bearing and pitch when no options given", () => {
    const { result } = renderHook(() => useMapView());

    expect(result.current.bearing).toBe(-20);
    expect(result.current.pitch).toBe(60);
  });

  it("accepts custom initial bearing and pitch", () => {
    const { result } = renderHook(() =>
      useMapView({ initialBearing: 45, initialPitch: 30 })
    );

    expect(result.current.bearing).toBe(45);
    expect(result.current.pitch).toBe(30);
  });

  it("updateMapView changes bearing and pitch state", () => {
    const { result } = renderHook(() => useMapView());

    act(() => {
      result.current.updateMapView(90, 45);
    });

    expect(result.current.bearing).toBe(90);
    expect(result.current.pitch).toBe(45);
  });

  it("handles negative bearings and extreme pitch boundary values", () => {
    const { result } = renderHook(() => useMapView());

    act(() => {
      result.current.updateMapView(-180, 85);
    });
    expect(result.current.bearing).toBe(-180);
    expect(result.current.pitch).toBe(85);

    act(() => {
      result.current.updateMapView(360, 0);
    });
    expect(result.current.bearing).toBe(360);
    expect(result.current.pitch).toBe(0);
  });

  it("updateMapView is stable across renders (memoized)", () => {
    const { result, rerender } = renderHook(() => useMapView());
    const firstUpdateFn = result.current.updateMapView;

    rerender();

    expect(result.current.updateMapView).toBe(firstUpdateFn);
  });
});
