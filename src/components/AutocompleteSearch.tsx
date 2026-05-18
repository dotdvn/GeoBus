"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Search, 
  Star, 
  History, 
  Navigation, 
  X, 
  Locate,
  ArrowRightLeft
} from "lucide-react";
import { Station, searchStations, getNearbyStations } from "../utils/searchEngine";
import stationsData from "../data/stations.json";

interface AutocompleteSearchProps {
  value: string;
  onChange: (val: string) => void;
  onSelect: (station: Station) => void;
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
}

export default function AutocompleteSearch({
  value,
  onChange,
  onSelect,
  placeholder = "Search bus station...",
  label,
  icon
}: AutocompleteSearchProps) {
  const [query, setQuery] = useState(value || "");
  const [debouncedQuery, setDebouncedQuery] = useState(value || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<Station[]>([]);
  const [favoriteStations, setFavoriteStations] = useState<Station[]>([]);
  const [nearbyStations, setNearbyStations] = useState<(Station & { distance: number })[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronize internal query state with value prop
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Handle debounce (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Load Recent & Favorite Stations from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRecents = localStorage.getItem("geobus-recent-searches");
      const savedFavorites = localStorage.getItem("geobus-favorite-stations");
      
      if (savedRecents) {
        try { setRecentSearches(JSON.parse(savedRecents)); } catch (e) {}
      }
      if (savedFavorites) {
        try { setFavoriteStations(JSON.parse(savedFavorites)); } catch (e) {}
      }
    }
  }, []);

  // Filter stations based on debounced search query
  const suggestions = useMemo(() => {
    return searchStations(debouncedQuery, stationsData as Station[]);
  }, [debouncedQuery]);

  // Save to Recents Helper
  const addToRecents = (station: Station) => {
    const updated = [station, ...recentSearches.filter(s => s.id !== station.id)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("geobus-recent-searches", JSON.stringify(updated));
  };

  // Toggle Favorite Helper
  const toggleFavorite = (e: React.MouseEvent, station: Station) => {
    e.stopPropagation();
    const isFav = favoriteStations.some(s => s.id === station.id);
    let updated: Station[];
    if (isFav) {
      updated = favoriteStations.filter(s => s.id !== station.id);
    } else {
      updated = [station, ...favoriteStations];
    }
    setFavoriteStations(updated);
    localStorage.setItem("geobus-favorite-stations", JSON.stringify(updated));
  };

  // Detect Nearby Stations using Geolocation API
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      return;
    }

    setLoadingNearby(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const nearby = getNearbyStations(latitude, longitude, stationsData as Station[], 4);
        setNearbyStations(nearby);
        setLoadingNearby(false);
      },
      (error) => {
        setLoadingNearby(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsError("Location permission denied");
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsError("Location info unavailable");
            break;
          default:
            setGpsError("Failed to detect location");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle item selection
  const handleSelectItem = (station: Station) => {
    onChange(station.name);
    onSelect(station);
    addToRecents(station);
    setShowDropdown(false);
    setActiveIndex(-1);
  };

  // Compile total items currently accessible via Arrow Keys
  const navigationItems = useMemo(() => {
    if (query.trim()) return suggestions;
    // When search is empty, combine favorites, recents and nearby in order
    return [...favoriteStations, ...recentSearches, ...nearbyStations.map(n => ({ id: n.id, name: n.name, nameMl: n.nameMl, district: n.district, lat: n.lat, lng: n.lng, aliases: n.aliases }))];
  }, [query, suggestions, favoriteStations, recentSearches, nearbyStations]);

  // Keyboard navigation logic
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setShowDropdown(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % Math.max(navigationItems.length, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + navigationItems.length) % Math.max(navigationItems.length, 1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < navigationItems.length) {
          handleSelectItem(navigationItems[activeIndex]);
        } else if (suggestions.length > 0) {
          handleSelectItem(suggestions[0]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowDropdown(false);
        setActiveIndex(-1);
        break;
    }
  };

  // Text Highlighting Utility for Match Indicators
  const renderHighlightedText = (text: string, search: string) => {
    if (!search.trim()) return <span className="text-white">{text}</span>;
    const cleanSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`(${cleanSearch})`, "gi");
    const parts = text.split(regex);
    
    return (
      <span className="text-white/80">
        {parts.map((part, i) => 
          regex.test(part) ? (
            <span key={i} className="text-geobus-neon font-semibold neon-text-glow">{part}</span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  const isFavorite = (stationId: string) => {
    return favoriteStations.some(s => s.id === stationId);
  };

  return (
    <div ref={containerRef} className="w-full relative">
      {label && (
        <span className="block text-xs font-semibold text-geobus-text uppercase tracking-wider mb-1 px-1">
          {label}
        </span>
      )}
      
      {/* Input Field wrapper */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-transparent focus-within:border-geobus-neon/50 relative shadow-inner">
        {icon || <Search className="w-5 h-5 text-geobus-text shrink-0" />}
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setShowDropdown(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="bg-transparent border-none outline-none text-white placeholder:text-geobus-text w-full font-sans text-sm focus:ring-0"
        />

        {query && (
          <button 
            onClick={() => {
              setQuery("");
              onChange("");
              inputRef.current?.focus();
            }}
            className="p-1 rounded-full hover:bg-white/10 text-geobus-text hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestion Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-[105%] left-0 w-full mt-2 bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-50 shadow-[0_20px_50px_rgba(0,0,0,0.8)] py-2 max-h-[400px] overflow-y-auto"
          >
            {/* If Typing: Show intelligent search results */}
            {query.trim().length > 0 ? (
              suggestions.length > 0 ? (
                <div>
                  <div className="px-4 py-2 text-[10px] font-bold text-geobus-text uppercase tracking-widest border-b border-white/5 flex justify-between items-center">
                    <span>Search Results ({suggestions.length})</span>
                    <span className="text-geobus-neon/70">Kerala Transit</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {suggestions.map((station, index) => (
                      <div
                        key={station.id}
                        onClick={() => handleSelectItem(station)}
                        className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${
                          index === activeIndex ? "bg-white/10" : "hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-geobus-neon/80 shrink-0 mt-0.5" />
                          <div className="flex flex-col text-left">
                            <span className="text-sm font-medium">
                              {renderHighlightedText(station.name, query)}
                            </span>
                            {station.nameMl && (
                              <span className="text-xs text-geobus-text font-sans">
                                {renderHighlightedText(station.nameMl, query)}
                              </span>
                            )}
                            {station.district && (
                              <span className="text-[10px] text-geobus-neon/60 font-semibold uppercase tracking-wider mt-0.5">
                                {station.district}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Favorite Button */}
                        <button
                          onClick={(e) => toggleFavorite(e, station)}
                          className="p-1.5 rounded-full hover:bg-white/10 text-geobus-text hover:text-geobus-neon transition-colors"
                        >
                          <Star 
                            className={`w-4 h-4 ${isFavorite(station.id) ? "fill-geobus-neon text-geobus-neon" : ""}`} 
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-6 py-8 text-center text-geobus-text text-sm flex flex-col items-center gap-2">
                  <Search className="w-8 h-8 text-white/10" />
                  <span>No bus stations found in Kerala matching &ldquo;{query}&rdquo;</span>
                </div>
              )
            ) : (
              /* If Empty Query: Show premium default widgets (Favorites, Recents, GPS Nearby) */
              <div className="flex flex-col">
                {/* Geolocation Hook */}
                <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between gap-3">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-white">Need nearby stations?</span>
                    <span className="text-[10px] text-geobus-text">Query stations closest to your current location</span>
                  </div>
                  <button
                    onClick={handleLocateMe}
                    disabled={loadingNearby}
                    className="px-3 py-1.5 bg-geobus-neon text-black text-xs font-semibold rounded-lg hover:scale-102 transition-transform shrink-0 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {loadingNearby ? (
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Locate className="w-3.5 h-3.5" />
                    )}
                    <span>Nearby</span>
                  </button>
                </div>

                {gpsError && (
                  <div className="px-4 py-1.5 bg-red-500/10 text-red-400 text-[10px] text-left">
                    {gpsError}
                  </div>
                )}

                {/* Dynamic Content blocks */}
                <div className="divide-y divide-white/5">
                  {/* Geolocation matches */}
                  {nearbyStations.length > 0 && (
                    <div className="py-1">
                      <div className="px-4 py-1.5 text-[9px] font-bold text-geobus-neon uppercase tracking-wider flex items-center gap-1">
                        <Navigation className="w-3 h-3 rotate-45" />
                        <span>Closest Stations (GPS detected)</span>
                      </div>
                      {nearbyStations.map((station, i) => (
                        <div
                          key={`nearby-${station.id}`}
                          onClick={() => handleSelectItem(station)}
                          className="px-4 py-2.5 hover:bg-white/5 cursor-pointer flex items-center justify-between text-left"
                        >
                          <div className="flex items-center gap-2.5">
                            <MapPin className="w-3.5 h-3.5 text-geobus-neon" />
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-white">{station.name}</span>
                              {station.nameMl && (
                                <span className="text-[10px] text-geobus-text">{station.nameMl}</span>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-geobus-neon px-2 py-0.5 bg-geobus-neon/10 rounded-full">
                            {station.distance.toFixed(1)} km away
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Favorites Panel */}
                  {favoriteStations.length > 0 && (
                    <div className="py-1">
                      <div className="px-4 py-1.5 text-[9px] font-bold text-yellow-500 uppercase tracking-wider flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        <span>Starred Stations</span>
                      </div>
                      {favoriteStations.map((station) => (
                        <div
                          key={`fav-${station.id}`}
                          onClick={() => handleSelectItem(station)}
                          className="px-4 py-2.5 hover:bg-white/5 cursor-pointer flex items-center justify-between text-left"
                        >
                          <div className="flex items-center gap-2.5">
                            <MapPin className="w-3.5 h-3.5 text-white/50" />
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-white">{station.name}</span>
                              {station.nameMl && (
                                <span className="text-[10px] text-geobus-text">{station.nameMl}</span>
                              )}
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => toggleFavorite(e, station)}
                            className="p-1 rounded-full text-yellow-500 hover:text-white/60 transition-colors"
                          >
                            <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recents Panel */}
                  {recentSearches.length > 0 && (
                    <div className="py-1">
                      <div className="px-4 py-1.5 text-[9px] font-bold text-geobus-text uppercase tracking-wider flex items-center gap-1">
                        <History className="w-3 h-3" />
                        <span>Recent Searches</span>
                      </div>
                      {recentSearches.map((station) => (
                        <div
                          key={`recent-${station.id}`}
                          onClick={() => handleSelectItem(station)}
                          className="px-4 py-2.5 hover:bg-white/5 cursor-pointer flex items-center text-left gap-2.5"
                        >
                          <MapPin className="w-3.5 h-3.5 text-white/30" />
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-white">{station.name}</span>
                            {station.nameMl && (
                              <span className="text-[10px] text-geobus-text">{station.nameMl}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* If nothing is cached / loaded yet, offer standard suggestions */}
                  {favoriteStations.length === 0 && recentSearches.length === 0 && nearbyStations.length === 0 && (
                    <div className="py-2">
                      <div className="px-4 py-1.5 text-[9px] font-bold text-geobus-text uppercase tracking-wider">
                        Popular Kerala Hubs
                      </div>
                      {(stationsData as Station[]).slice(0, 5).map((station) => (
                        <div
                          key={`pop-${station.id}`}
                          onClick={() => handleSelectItem(station)}
                          className="px-4 py-2.5 hover:bg-white/5 cursor-pointer flex items-center text-left gap-2.5"
                        >
                          <MapPin className="w-3.5 h-3.5 text-geobus-neon/55" />
                          <div className="flex flex-col font-sans">
                            <span className="text-xs font-medium text-white">{station.name}</span>
                            {station.nameMl && (
                              <span className="text-[10px] text-geobus-text">{station.nameMl}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
