"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { geocodeAddress } from "../lib/geocode";
import { highlightNearestBuilding } from "../lib/buildingHighlight";
import MapControls from "../components/MapControls";

const AddressAutofill = dynamic(
  () => import("@mapbox/search-js-react").then((mod) => mod.AddressAutofill),
  { ssr: false }
);

const Map = dynamic(() => import("react-map-gl"), { ssr: false });

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function Home() {
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [bearing, setBearing] = useState(-20);
  const [pitch, setPitch] = useState(60);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSearch = async () => {
    setError(null);
    const result = await geocodeAddress(address, MAPBOX_TOKEN);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    const { lng, lat } = result;
    setLocation({ lat, lng });

    if (mapRef.current) {
      const map = mapRef.current.getMap();

      if (markerRef.current) {
        markerRef.current.remove();
      }

      markerRef.current = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);

      map.flyTo({
        center: [lng, lat],
        zoom: 18,
        pitch: pitch,
        bearing: bearing,
      });

      highlightNearestBuilding(map, lng, lat);
    }
  };

  const updateMapView = (newBearing, newPitch) => {
    setBearing(newBearing);
    setPitch(newPitch);
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      map.flyTo({ bearing: newBearing, pitch: newPitch });
    }
  };

  return (
    <div className="relative">
      <div className="absolute top-5 left-5 flex space-x-2 p-2 rounded z-10 backdrop-blur-lg bg-white/30 shadow-md">
        <AddressAutofill
          accessToken={MAPBOX_TOKEN}
          onRetrieve={(res) => {
            const fullAddress = res.features[0]?.properties.full_address || "";
            setAddress(fullAddress);
          }}
        >
          <input
            type="text"
            placeholder="Enter an address"
            autoComplete="address-line1"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="p-2 border rounded w-64 bg-transparent text-black placeholder-black focus:outline-none"
          />
        </AddressAutofill>
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {error && (
        <div className="absolute top-20 left-5 z-10 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-md">
          {error}
        </div>
      )}

      <MapControls
        mapRef={mapRef}
        bearing={bearing}
        pitch={pitch}
        onViewChange={updateMapView}
      />

      <div className="w-full h-screen">
        {isClient && (
          <Map
            ref={mapRef}
            initialViewState={{
              longitude: location?.lng || -118.031,
              latitude: location?.lat || 33.977,
              zoom: 18,
              pitch: pitch,
              bearing: bearing,
            }}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
            onLoad={(e) => {
              const map = e.target;

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
            }}
          />
        )}
      </div>
    </div>
  );
}
