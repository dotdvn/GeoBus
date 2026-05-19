"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Navigation, Lock, Unlock } from "lucide-react";
import maplibregl from "maplibre-gl";
import stationsData from "../data/stations.json";
import { Station } from "../utils/searchEngine";

export default function LiveTrackingSection() {
  const [busPosition, setBusPosition] = useState({ lat: 9.9312, lng: 76.2673 }); // Kerala [lat, lng]
  const [showAllBusStops, setShowAllBusStops] = useState(false);
  const [selectedStops, setSelectedStops] = useState<Station[]>([]);
  const [isMapLocked, setIsMapLocked] = useState(true);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const stationMarkers = useRef<maplibregl.Marker[]>([]);

  // Simulate bus movement along a route in Kerala
  useEffect(() => {
    const interval = setInterval(() => {
      setBusPosition(prev => ({
        lat: prev.lat + 0.0001,
        lng: prev.lng + 0.00015,
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Initialize MapLibre GL Map
  useEffect(() => {
    if (map.current) return; // Only initialize once
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: "map",
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            ],
            tileSize: 256
          }
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm"
          }
        ]
      },
      center: [76.2673, 9.9312],
      zoom: 7,
      attributionControl: false,
    });

    // Disable scroll zoom initially so users can scroll down the page past the map
    map.current.scrollZoom.disable();

    // Create a custom neon bus marker element
    const el = document.createElement("div");
    el.className = "bus-marker-element";
    el.style.width = "40px";
    el.style.height = "40px";
    el.style.backgroundColor = "#0a0a0a";
    el.style.border = "2px solid #B6FF3B";
    el.style.borderRadius = "50%";
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
    el.style.boxShadow = "0 0 15px rgba(182, 255, 59, 0.6)";
    el.style.cursor = "pointer";
    el.style.transform = "rotate(45deg)";

    el.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B6FF3B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(45deg);"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
    `;

    marker.current = new maplibregl.Marker({ element: el })
      .setLngLat([76.2673, 9.9312])
      .addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Synchronize dynamic station markers based on showAllBusStops toggle
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    stationMarkers.current.forEach(m => m.remove());
    stationMarkers.current = [];

    // Filter which stations to display
    const targetStations = showAllBusStops
      ? (stationsData as Station[])
      : selectedStops;

    targetStations.forEach((station) => {
      // Small neon stop element
      const el = document.createElement("div");
      el.className = "station-marker-element";
      el.style.width = "12px";
      el.style.height = "12px";
      el.style.backgroundColor = "#B6FF3B";
      el.style.border = "2px solid #000";
      el.style.borderRadius = "50%";
      el.style.boxShadow = "0 0 8px #B6FF3B";
      el.style.cursor = "pointer";

      // Add simple popup on hover/click
      const popup = new maplibregl.Popup({ offset: 10, closeButton: false })
        .setHTML(`<div style="color: #000; font-family: sans-serif; font-size: 11px; font-weight: bold; padding: 2px 4px;">${station.name}</div>`);

      const m = new maplibregl.Marker({ element: el })
        .setLngLat([station.lng, station.lat])
        .setPopup(popup)
        .addTo(map.current!);

      stationMarkers.current.push(m);
    });
  }, [showAllBusStops, selectedStops]);

  // Synchronize dynamic bus marker location
  useEffect(() => {
    if (marker.current && map.current) {
      marker.current.setLngLat([busPosition.lng, busPosition.lat]);
    }
  }, [busPosition]);

  // Handle Lock / Unlock actions
  const handleUnlockMap = () => {
    setIsMapLocked(false);
    if (map.current) {
      map.current.scrollZoom.enable();
    }
  };

  const handleLockMap = () => {
    setIsMapLocked(true);
    if (map.current) {
      map.current.scrollZoom.disable();
    }
  };

  return (
    <section id="tracking" className="py-24 bg-[#050505] relative overflow-hidden">
      {/* Title */}
      <div className="text-center mb-16 px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-geobus-neon/5 border border-geobus-neon/10 rounded-full mb-4 text-xs font-bold text-geobus-neon uppercase tracking-widest font-heading"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Live Fleet Telemetry</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-5xl font-heading font-extrabold uppercase text-white tracking-tight leading-none"
        >
          Real-Time Tracking
        </motion.h2>
      </div>

      <div className="container px-6 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative h-[80vh] w-full rounded-3xl overflow-hidden glass-card p-2"
        >
          <div className="absolute inset-0 rounded-3xl pointer-events-none border border-white/10 z-10" />

          <div className="w-full h-full rounded-2xl overflow-hidden relative">

            {/* MapLibre Container */}
            <div ref={mapContainer} id="map" className="w-full h-full rounded-2xl overflow-hidden" />

            {/* Interactive Lock Overlay Block */}
            {isMapLocked && (
              <div
                onClick={handleUnlockMap}
                className="absolute inset-0 bg-black/55 backdrop-blur-[1px] flex flex-col items-center justify-center cursor-pointer z-30 group transition-all duration-300"
              >
                <div className="glass-card p-6 rounded-[24px] border border-white/10 flex flex-col items-center gap-3 text-center max-w-[280px] group-hover:scale-105 transition-transform duration-300 shadow-2xl">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-geobus-neon shadow-[0_0_15px_rgba(182,255,59,0.2)]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-heading font-extrabold uppercase tracking-wider text-xs">Interactive Map Locked</h4>
                    <p className="text-xs text-geobus-text mt-1.5 leading-relaxed">Click anywhere on the map to unlock zooming & panning</p>
                  </div>
                </div>
              </div>
            )}

            {/* Floating Unlock Padlock Button */}
            {!isMapLocked && (
              <button
                type="button"
                onClick={handleLockMap}
                className="absolute bottom-6 left-6 z-20 px-3.5 py-2.5 bg-geobus-neon hover:bg-[#a5e635] text-black border border-geobus-neon rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(182,255,59,0.3)] hover:scale-102 transition-transform cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Overlay UI elements */}
            <div className="hidden md:block absolute top-6 left-6 z-20 glass-card p-4 rounded-2xl max-w-[250px]">
              <h4 className="text-white font-heading font-bold text-lg mb-1">Route Trial Express</h4>
              <p className="text-sm text-geobus-neon flex items-center gap-2 font-medium mb-3">
                <span className="w-2 h-2 rounded-full bg-geobus-neon animate-pulse" />
                ETA: 4 mins
              </p>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-geobus-neon w-[70%]" />
              </div>
            </div>

            {/* Top-Right Control Widget */}
            <div className="absolute top-6 right-6 z-20">
              <button
                onClick={() => setShowAllBusStops(prev => !prev)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border transition-all cursor-pointer ${showAllBusStops
                  ? "bg-geobus-neon text-black border-geobus-neon shadow-[0_0_15px_rgba(182,255,59,0.4)] hover:scale-102"
                  : "glass text-white border-white/10 hover:border-geobus-neon/50 hover:scale-102"
                  }`}
              >
                <span className={`w-2 h-2 rounded-full ${showAllBusStops ? "bg-black animate-pulse" : "bg-geobus-neon animate-pulse"}`} />
                <span>{showAllBusStops ? "Showing All Stops" : "Show All Bus Stops"}</span>
              </button>
            </div>

            {/* Bottom-Right Online Status */}
            <div className="hidden md:flex absolute bottom-6 right-6 z-20 glass p-3 rounded-xl items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-white font-bold">1</span>
              </div>
              <div>
                <p className="text-xs text-geobus-text uppercase tracking-wider">Trial Fleet</p>
                <p className="text-white font-bold">Vehicles Online</p>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
