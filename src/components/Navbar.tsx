"use client";

import { motion } from "framer-motion";
import { Menu, MapPin, LogIn } from "lucide-react";

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5"
    >
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-8 h-8 text-geobus-neon" />
          <span className="text-xl font-heading font-bold text-white tracking-wider">
            GeoBus
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-geobus-text hover:text-white transition-colors">Live Tracking</a>
          <a href="#" className="text-sm font-medium text-geobus-text hover:text-white transition-colors">App Features</a>
          <a href="#" className="text-sm font-medium text-geobus-text hover:text-white transition-colors">Dashboard</a>
          <a href="#" className="text-sm font-medium text-geobus-text hover:text-white transition-colors">About</a>
        </div>
        
        <div className="hidden md:flex">
          <button className="px-6 py-2 bg-geobus-neon/15 border border-geobus-neon/50 text-geobus-neon font-semibold rounded-full hover:bg-geobus-neon hover:text-black transition-all flex items-center gap-2">
            <LogIn className="w-4 h-4" />
            <span>Login</span>
          </button>
        </div>

        <button className="md:hidden p-2 text-white">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </motion.nav>
  );
}
