"use client";

import { motion } from "framer-motion";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { useState, useEffect } from "react";
import { Navigation } from "lucide-react";

// Using a custom dark style for Google Maps
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] },
];

export default function LiveTrackingSection() {
  const [busPosition, setBusPosition] = useState({ lat: 40.7128, lng: -74.0060 }); // NYC roughly

  useEffect(() => {
    // Simulate bus movement
    const interval = setInterval(() => {
      setBusPosition(prev => ({
        lat: prev.lat + 0.0001,
        lng: prev.lng + 0.0001,
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-32 relative bg-geobus-black border-t border-white/5">
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
          className="relative h-[600px] w-full rounded-3xl overflow-hidden glass-card p-2"
        >
          <div className="absolute inset-0 rounded-3xl pointer-events-none border border-white/10 z-10" />
          
          <div className="w-full h-full rounded-2xl overflow-hidden relative">
            <APIProvider apiKey="AIzaSyD81Vi2_4CJnKyqQ4FmdAMhw-SnrZkM1x4">
              <Map
                defaultCenter={{ lat: 40.7128, lng: -74.0060 }}
                defaultZoom={14}
                disableDefaultUI={true}
                styles={darkMapStyle}
                gestureHandling="cooperative"
              >
                {/* Simulated Bus Marker */}
                <Marker position={busPosition}>
                  <div className="w-10 h-10 bg-geobus-black border-2 border-geobus-neon rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(182,255,59,0.5)]">
                    <Navigation className="w-5 h-5 text-geobus-neon" />
                  </div>
                </Marker>
              </Map>
            </APIProvider>

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
            
            <div className="absolute bottom-6 right-6 z-20 glass p-3 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-white font-bold">12</span>
              </div>
              <div>
                <p className="text-xs text-geobus-text uppercase tracking-wider">Active Fleet</p>
                <p className="text-white font-bold">Vehicles Online</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
