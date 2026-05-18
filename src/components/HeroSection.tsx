"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Search, Calendar, ArrowRightLeft, TrendingUp } from "lucide-react";
import AutocompleteSearch from "./AutocompleteSearch";

const POPULAR_ROUTES = [
  { from: "Thrissur KSRTC Bus Stand", to: "Vyttila Mobility Hub" },
  { from: "East Fort", to: "Ksrtc Depot, Thalassery" },
  { from: "Kattakada", to: "Town Bus Stand" },
];

export default function HeroSection() {
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");

  const swapLocations = () => {
    const temp = fromQuery;
    setFromQuery(toQuery);
    setToQuery(temp);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-geobus-black z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-geobus-neon/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] z-0" />

      <div className="container relative z-10 px-6 mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-geobus-neon/20 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-geobus-neon animate-pulse" />
          <span className="text-sm font-medium text-geobus-neon tracking-wide uppercase">Track Buses</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold text-white mb-6 tracking-tight leading-tight uppercase"
        >
          Smart Mobility <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-geobus-neon to-geobus-neon/50">
            Redefined
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-lg md:text-xl text-geobus-text max-w-2xl mb-10 font-sans"
        >
          Realtime GPS Tracking for Modern Transportation. Experience the next generation of intelligent, fast, and premium mobility.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="w-full max-w-4xl mt-4 flex flex-col items-center gap-4 relative z-20"
        >
          <div className="w-full glass-card rounded-3xl p-3 flex flex-col lg:flex-row items-center gap-2 border border-white/10 shadow-2xl relative">
            {/* From Input */}
            <AutocompleteSearch
              value={fromQuery}
              onChange={setFromQuery}
              onSelect={(station) => {
                console.log("Selected leaving station:", station);
                const event = new CustomEvent("focus-station", { detail: station });
                window.dispatchEvent(event);
              }}
              placeholder="Leaving from..."
              icon={<MapPin className="w-5 h-5 text-geobus-text shrink-0" />}
            />
            
            <div className="hidden lg:flex items-center justify-center px-2">
              <button 
                onClick={swapLocations}
                className="w-10 h-10 rounded-full glass flex items-center justify-center hover:border-geobus-neon/50 transition-all active:scale-95 text-white hover:text-geobus-neon"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* To Input */}
            <AutocompleteSearch
              value={toQuery}
              onChange={setToQuery}
              onSelect={(station) => {
                console.log("Selected going station:", station);
                const event = new CustomEvent("focus-station", { detail: station });
                window.dispatchEvent(event);
              }}
              placeholder="Going to..."
              icon={<MapPin className="w-5 h-5 text-geobus-neon shrink-0" />}
            />

            <div className="flex-1 w-full flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-transparent focus-within:border-geobus-neon/50">
              <Calendar className="w-5 h-5 text-geobus-text shrink-0" />
              <input 
                type="date" 
                className="bg-transparent border-none outline-none text-white placeholder:text-geobus-text w-full font-sans [color-scheme:dark]"
              />
            </div>

            <button className="w-full lg:w-auto px-8 py-4 bg-geobus-neon text-black font-semibold rounded-2xl transition-all hover:scale-105 neon-glow flex items-center justify-center gap-2 mt-2 lg:mt-0 shrink-0">
              <Search className="w-5 h-5 shrink-0" />
              <span>Search</span>
            </button>
          </div>

          {/* Popular Routes */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2 w-full">
            <div className="flex items-center gap-2 text-geobus-text text-sm mr-2">
              <TrendingUp className="w-4 h-4" />
              <span>Popular in Kerala:</span>
            </div>
            {POPULAR_ROUTES.map((route, i) => (
              <button 
                key={i}
                onClick={() => {
                  setFromQuery(route.from);
                  setToQuery(route.to);
                }}
                className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-xs font-medium hover:bg-white/10 hover:border-geobus-neon/50 transition-all flex items-center gap-2 cursor-pointer"
              >
                {route.from.replace(" KSRTC Bus Stand", "").replace(" Mobility Hub", "").replace(" Depot, Thalassery", "")} 
                <ArrowRightLeft className="w-3 h-3 text-geobus-neon opacity-70" /> 
                {route.to.replace(" KSRTC Bus Stand", "").replace(" Mobility Hub", "").replace(" Depot, Thalassery", "")}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Decorative Mockups / Elements */}
      <div className="absolute bottom-[-10%] w-full h-[40vh] flex justify-center items-end opacity-40 pointer-events-none mix-blend-screen mask-image-b">
         {/* Map Lines Placeholder */}
         <div className="w-[80%] h-[80%] border-t border-geobus-neon/30 rounded-t-[50%] blur-[2px]"></div>
      </div>
    </section>
  );
}
