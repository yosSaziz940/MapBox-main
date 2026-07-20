// Mock for mapbox-gl — provides stubs for Marker and Map used by the app.
class MockMarker {
  setLngLat() {
    return this;
  }
  addTo() {
    return this;
  }
  remove() {}
}

class MockMap {
  addLayer() {}
  getLayer() {
    return null;
  }
  flyTo() {}
  project() {
    return { x: 0, y: 0 };
  }
  queryRenderedFeatures() {
    return [];
  }
  setFeatureState() {}
  removeFeatureState() {}
  zoomIn() {}
  zoomOut() {}
}

module.exports = {
  Marker: MockMarker,
  Map: MockMap,
  default: {
    Marker: MockMarker,
    Map: MockMap,
  },
};
