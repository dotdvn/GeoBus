"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Navigation } from "lucide-react";
import maplibregl from "maplibre-gl";
import stationsData from "../data/stations.json";
import { Station } from "../utils/searchEngine";

export default function LiveTrackingSection() {
  const [busPosition, setBusPosition] = useState({ lat: 9.9312, lng: 76.2673 }); // Kerala [lat, lng]
  const [showAllBusStops, setShowAllBusStops] = useState(false);
  const [selectedStops, setSelectedStops] = useState<Station[]>([]);
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

    // Filter which stations to display: 
    // If showAllBusStops is false, ONLY show the selectedStops!
    // If showAllBusStops is true, show all 295 stations
    const stationsToShow = showAllBusStops
      ? (stationsData as Station[])
      : selectedStops;

    // Render new markers
    stationsToShow.forEach((station) => {
      const isSelected = selectedStops.some(s => s.id === station.id);

      let el: HTMLElement | undefined = undefined;
      if (isSelected && !showAllBusStops) {
        // Create custom neon stop marker element for the selected route stops
        el = document.createElement("div");
        el.className = "selected-stop-marker";
        el.style.width = "16px";
        el.style.height = "16px";
        el.style.backgroundColor = "#B6FF3B";
        el.style.border = "2px solid #0a0a0a";
        el.style.borderRadius = "50%";
        el.style.boxShadow = "0 0 10px #B6FF3B";
        el.style.cursor = "pointer";
      }

      const m = new maplibregl.Marker({ element: el })
        .setLngLat([station.lng, station.lat])
        .setPopup(
          new maplibregl.Popup({ closeButton: false })
            .setText(station.name)
        )
        .addTo(map.current!);

      stationMarkers.current.push(m);
    });
  }, [showAllBusStops, map.current, selectedStops]);

  // Update marker position smoothly (without auto-relocating map camera)
  useEffect(() => {
    if (marker.current) {
      marker.current.setLngLat([busPosition.lng, busPosition.lat]);
    }
  }, [busPosition]);

  // Focus station helper function
  const focusStation = (station: Station) => {
    if (map.current) {
      map.current.flyTo({
        center: [station.lng, station.lat],
        zoom: 14,
        essential: true
      });
    }
  };

  // Add event listener to dynamically focus map on selected search station
  useEffect(() => {
    const handleFocusStation = (e: Event) => {
      const station = (e as CustomEvent).detail as Station;
      if (station) {
        // Add to selected stops list dynamically if not already present
        setSelectedStops(prev => {
          if (prev.some(s => s.id === station.id)) return prev;
          return [...prev, station];
        });

        // Smoothly scroll to the map tracking section
        const section = document.getElementById("live-tracking");
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        // Trigger map zoom and pan flight
        focusStation(station);
      }
    };

    window.addEventListener("focus-station", handleFocusStation);
    return () => window.removeEventListener("focus-station", handleFocusStation);
  }, []);

  return (
    <section id="live-tracking" className="py-32 relative bg-geobus-black border-t border-white/5">
      <div className="container px-6 mx-auto mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-geobus-neon/10 border border-geobus-neon/20 mb-6"
        >
          <div className="w-2 h-2 rounded-full bg-geobus-neon animate-pulse" />
          <span className="text-xs font-semibold text-geobus-neon uppercase tracking-wider">Live System Active</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-heading font-bold text-white uppercase tracking-tight"
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
          className="relative h-[100vh] w-full rounded-3xl overflow-hidden glass-card p-2"
        >
          <div className="absolute inset-0 rounded-3xl pointer-events-none border border-white/10 z-10" />

          <div className="w-full h-full rounded-2xl overflow-hidden relative">
            {/* MapLibre Container */}
            <div ref={mapContainer} id="map" className="w-full h-full rounded-2xl overflow-hidden" />

            {/* Overlay UI elements */}
            <div className="absolute top-6 left-6 z-20 glass-card p-4 rounded-2xl max-w-[250px]">
              <h4 className="text-white font-heading font-bold text-lg mb-1">Route 42A Express</h4>
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

            <div className="absolute bottom-6 right-6 z-20 glass p-3 rounded-xl flex items-center gap-3">
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
