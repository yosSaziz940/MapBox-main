import { render, screen, fireEvent } from "@testing-library/react";
import MapControls from "../../components/MapControls";

function createMockMapRef() {
  const mockMap = {
    zoomIn: jest.fn(),
    zoomOut: jest.fn(),
  };
  return {
    current: {
      getMap: () => mockMap,
    },
    _mockMap: mockMap,
  };
}

describe("MapControls", () => {
  it("renders all six control buttons", () => {
    const mapRef = createMockMapRef();
    render(
      <MapControls
        mapRef={mapRef}
        bearing={-20}
        pitch={60}
        onViewChange={jest.fn()}
      />
    );

    expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
    expect(screen.getByLabelText("Zoom out")).toBeInTheDocument();
    expect(screen.getByLabelText("Rotate left")).toBeInTheDocument();
    expect(screen.getByLabelText("Rotate right")).toBeInTheDocument();
    expect(screen.getByLabelText("Tilt up")).toBeInTheDocument();
    expect(screen.getByLabelText("Tilt down")).toBeInTheDocument();
  });

  it("calls map.zoomIn when the zoom-in button is clicked", () => {
    const mapRef = createMockMapRef();
    render(
      <MapControls
        mapRef={mapRef}
        bearing={-20}
        pitch={60}
        onViewChange={jest.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText("Zoom in"));
    expect(mapRef._mockMap.zoomIn).toHaveBeenCalledTimes(1);
  });

  it("calls map.zoomOut when the zoom-out button is clicked", () => {
    const mapRef = createMockMapRef();
    render(
      <MapControls
        mapRef={mapRef}
        bearing={-20}
        pitch={60}
        onViewChange={jest.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText("Zoom out"));
    expect(mapRef._mockMap.zoomOut).toHaveBeenCalledTimes(1);
  });

  it("calls onViewChange with decreased bearing when rotate-left is clicked", () => {
    const onViewChange = jest.fn();
    const mapRef = createMockMapRef();
    render(
      <MapControls
        mapRef={mapRef}
        bearing={-20}
        pitch={60}
        onViewChange={onViewChange}
      />
    );

    fireEvent.click(screen.getByLabelText("Rotate left"));
    expect(onViewChange).toHaveBeenCalledWith(-30, 60);
  });

  it("calls onViewChange with increased bearing when rotate-right is clicked", () => {
    const onViewChange = jest.fn();
    const mapRef = createMockMapRef();
    render(
      <MapControls
        mapRef={mapRef}
        bearing={-20}
        pitch={60}
        onViewChange={onViewChange}
      />
    );

    fireEvent.click(screen.getByLabelText("Rotate right"));
    expect(onViewChange).toHaveBeenCalledWith(-10, 60);
  });

  it("clamps pitch to max 85 when tilt-up is clicked at pitch 83", () => {
    const onViewChange = jest.fn();
    const mapRef = createMockMapRef();
    render(
      <MapControls
        mapRef={mapRef}
        bearing={0}
        pitch={83}
        onViewChange={onViewChange}
      />
    );

    fireEvent.click(screen.getByLabelText("Tilt up"));
    expect(onViewChange).toHaveBeenCalledWith(0, 85);
  });

  it("clamps pitch to min 0 when tilt-down is clicked at pitch 3", () => {
    const onViewChange = jest.fn();
    const mapRef = createMockMapRef();
    render(
      <MapControls
        mapRef={mapRef}
        bearing={0}
        pitch={3}
        onViewChange={onViewChange}
      />
    );

    fireEvent.click(screen.getByLabelText("Tilt down"));
    expect(onViewChange).toHaveBeenCalledWith(0, 0);
  });
});
