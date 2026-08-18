"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { geocodeAddress } from "../lib/geocode";
import { highlightNearestBuilding } from "../lib/buildingHighlight";
import { addBuildingLayers } from "../lib/mapLayers";
import { useMapView } from "../lib/useMapView";
import MapControls from "../components/MapControls";
import SearchHistory from "../components/SearchHistory";
import { createLogger } from "../lib/logger";
import {
  loadSearchHistory,
  addToSearchHistory,
  clearSearchHistory,
} from "../lib/searchHistory";

const logger = createLogger("app/page");

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
  const [searchHistory, setSearchHistory] = useState([]);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const { bearing, pitch, updateMapView } = useMapView();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      setSearchHistory(loadSearchHistory());
    }
  }, [isClient]);

  useEffect(() => {
    const handleSearchHistoryUpdate = () => {
      setSearchHistory(loadSearchHistory());
    };

    window.addEventListener("search-history-updated", handleSearchHistoryUpdate);

    return () => {
      window.removeEventListener(
        "search-history-updated",
        handleSearchHistoryUpdate
      );
    };
  }, []);

  const handleSearch = async () => {
    setError(null);
    logger.debug("Search initiated", { address });

    const result = await geocodeAddress(address, MAPBOX_TOKEN);

    if (!result.ok) {
      const errorMessage = result.error;
      setError(errorMessage);
      logger.error("Geocoding failed", {
        address,
        error: errorMessage,
      });
      return;
    }

    logger.info("Geocoding succeeded", { address });

    const updatedHistory = addToSearchHistory(address);
    setSearchHistory(updatedHistory);

    const { lng, lat } = result;
    setLocation({ lat, lng });

    if (mapRef.current) {
      const map = mapRef.current.getMap();

      if (markerRef.current) {
        markerRef.current.remove();
      }

      markerRef.current = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map);

      map.flyTo({ center: [lng, lat], zoom: 18, pitch, bearing });
      highlightNearestBuilding(map, lng, lat);
      logger.debug("Map view updated", { lng, lat, zoom: 18, bearing, pitch });
    }
  };

  const handleViewChange = (newBearing, newPitch) => {
    updateMapView(newBearing, newPitch);
    if (mapRef.current) {
      mapRef.current.getMap().flyTo({ bearing: newBearing, pitch: newPitch });
    }
  };

  return (
    <div className="relative">
      <div className="absolute top-5 left-5 flex space-x-2 p-2 rounded z-10 backdrop-blur-lg bg-white/30 shadow-md">
        <div className="relative w-64">
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
              className="p-2 border rounded w-full bg-transparent text-black placeholder-black focus:outline-none"
            />
          </AddressAutofill>
          <SearchHistory
            history={searchHistory}
            onSelectAddress={(selectedAddress) => {
              setAddress(selectedAddress);
              setTimeout(() => {
                const tempAddress = selectedAddress;
                setAddress(tempAddress);
                geocodeAddress(tempAddress, MAPBOX_TOKEN).then((result) => {
                  if (result.ok) {
                    const updatedHistory = addToSearchHistory(tempAddress);
                    setSearchHistory(updatedHistory);
                    const { lng, lat } = result;
                    setLocation({ lat, lng });

                    if (mapRef.current) {
                      const map = mapRef.current.getMap();
                      if (markerRef.current) {
                        markerRef.current.remove();
                      }
                      markerRef.current = new mapboxgl.Marker()
                        .setLngLat([lng, lat])
                        .addTo(map);
                      map.flyTo({ center: [lng, lat], zoom: 18, pitch, bearing });
                      highlightNearestBuilding(map, lng, lat);
                    }
                  }
                });
              }, 0);
            }}
            onClearAll={() => {
              clearSearchHistory();
              setSearchHistory([]);
            }}
          />
        </div>
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
        onViewChange={handleViewChange}
      />

      <div className="w-full h-screen">
        {isClient && (
          <Map
            ref={mapRef}
            initialViewState={{
              longitude: location?.lng || -118.031,
              latitude: location?.lat || 33.977,
              zoom: 18,
              pitch,
              bearing,
            }}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
            onLoad={(e) => addBuildingLayers(e.target)}
          />
        )}
      </div>
    </div>
  );
}
