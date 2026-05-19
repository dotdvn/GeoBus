"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MapPin, LogIn, LogOut, Shield, Key, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, openAuthModal, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5"
    >
      <div className="container mx-auto px-6 h-20 flex items-center justify-between relative">
        {/* Brand Logo Section */}
        <div className="flex items-center gap-2">
          <MapPin className="w-8 h-8 text-geobus-neon" />
          <span className="text-xl font-heading font-bold text-white tracking-wider">
            GeoBus
          </span>
        </div>
        
        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-geobus-text hover:text-white transition-colors">Live Tracking</a>
          <a href="#" className="text-sm font-medium text-geobus-text hover:text-white transition-colors">App Features</a>
          <a href="#" className="text-sm font-medium text-geobus-text hover:text-white transition-colors">Dashboard</a>
          <a href="#" className="text-sm font-medium text-geobus-text hover:text-white transition-colors">About</a>
        </div>
        
        {/* Auth Actions Block (Always accessible on both Desktop and Mobile!) */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              /* Logged In State */
              <div className="flex items-center gap-2 md:gap-3 bg-white/5 border border-white/10 rounded-full pl-2 pr-1 md:pl-3 md:pr-2 py-1">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold uppercase ${
                    user.role === "admin" 
                      ? "bg-red-600 text-white" 
                      : user.role === "driver" 
                        ? "bg-blue-500 text-white" 
                        : "bg-geobus-neon text-black"
                  }`}>
                    {user.displayName?.charAt(0) || "U"}
                  </div>
                  <div className="hidden sm:flex flex-col pr-1 md:pr-2">
                    <span className="text-xs md:text-sm font-semibold text-white truncate max-w-[80px] md:max-w-[120px]">
                      {user.displayName || user.phoneNumber || user.email}
                    </span>
                    <span className={`text-[8px] md:text-[10px] uppercase font-bold tracking-wider -mt-1 font-heading flex items-center gap-1 ${
                      user.role === "admin" 
                        ? "text-red-400" 
                        : user.role === "driver" 
                          ? "text-blue-400" 
                          : "text-geobus-neon"
                    }`}>
                      {user.role === "admin" && <Key className="w-2 md:w-2.5 h-2 md:h-2.5" />}
                      {user.role === "driver" && <Shield className="w-2 md:w-2.5 h-2 md:h-2.5" />}
                      {user.role === "passenger" && <User className="w-2 md:w-2.5 h-2 md:h-2.5" />}
                      <span>{user.role}</span>
                    </span>
                  </div>
                </div>
                <button 
                  onClick={logout}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-400 flex items-center justify-center transition-colors border border-white/5"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Logged Out State */
              <button 
                onClick={openAuthModal}
                className="px-4 py-1.5 md:px-6 md:py-2 bg-geobus-neon/15 border border-geobus-neon/50 text-geobus-neon text-xs md:text-sm font-semibold rounded-full hover:bg-geobus-neon hover:text-black transition-all flex items-center gap-1.5 md:gap-2"
              >
                <LogIn className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Action Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-geobus-neon transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-20 left-0 right-0 glass border-b border-white/5 overflow-hidden md:hidden z-40"
          >
            <div className="flex flex-col gap-4 py-6 px-6">
              <a 
                href="#" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-medium text-geobus-text hover:text-white transition-colors py-2 border-b border-white/5"
              >
                Live Tracking
              </a>
              <a 
                href="#" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-medium text-geobus-text hover:text-white transition-colors py-2 border-b border-white/5"
              >
                App Features
              </a>
              <a 
                href="#" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-medium text-geobus-text hover:text-white transition-colors py-2 border-b border-white/5"
              >
                Dashboard
              </a>
              <a 
                href="#" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-medium text-geobus-text hover:text-white transition-colors py-2"
              >
                About
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
