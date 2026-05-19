"use client";

import { motion } from "framer-motion";
import { Menu, MapPin, LogIn, LogOut, Shield, Key, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, openAuthModal, logout } = useAuth();

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5"
    >
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="logo">
            <div className="circle">
              <div className="bus">
                <div className="top"></div>
                <div className="window"></div>
                <div className="light left"></div>
                <div className="light right"></div>
                <div className="wheel left"></div>
                <div className="wheel right"></div>
              </div>
            </div>
          </div>
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
        
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            /* Logged In State */
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full pl-3 pr-2 py-1">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold uppercase ${
                  user.role === "admin" 
                    ? "bg-red-600 text-white" 
                    : user.role === "driver" 
                      ? "bg-blue-500 text-white" 
                      : "bg-geobus-neon text-black"
                }`}>
                  {user.displayName?.charAt(0) || "U"}
                </div>
                <div className="flex flex-col pr-2">
                  <span className="text-sm font-semibold text-white truncate max-w-[120px]">
                    {user.displayName || user.phoneNumber || user.email}
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider -mt-1 font-heading flex items-center gap-1 ${
                    user.role === "admin" 
                      ? "text-red-400" 
                      : user.role === "driver" 
                        ? "text-blue-400" 
                        : "text-geobus-neon"
                  }`}>
                    {user.role === "admin" && <Key className="w-2.5 h-2.5" />}
                    {user.role === "driver" && <Shield className="w-2.5 h-2.5" />}
                    {user.role === "passenger" && <User className="w-2.5 h-2.5" />}
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
              className="px-6 py-2 bg-geobus-neon/15 border border-geobus-neon/50 text-geobus-neon font-semibold rounded-full hover:bg-geobus-neon hover:text-black transition-all flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}
        </div>

        <button className="md:hidden p-2 text-white">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </motion.nav>
  );
}
