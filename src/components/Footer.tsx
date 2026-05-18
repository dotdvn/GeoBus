"use client";

import { Globe, MessageCircle, Link as LinkIcon, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-geobus-black border-t border-white/5 py-12">
      <div className="container px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-heading font-bold text-white mb-4 uppercase flex items-center gap-2">
              <MapPin className="w-6 h-6 text-geobus-neon" />
              GeoBus
            </h3>
            <p className="text-geobus-text max-w-sm">
              Next Generation Bus Tracking. A premium smart-city solution by VeloraMobility.
            </p>
          </div>

          <div>
            <h4 className="text-white font-heading font-bold mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-geobus-text hover:text-geobus-neon transition-colors">Live Tracking</a></li>
              <li><a href="#" className="text-geobus-text hover:text-geobus-neon transition-colors">Passenger App</a></li>
              <li><a href="#" className="text-geobus-text hover:text-geobus-neon transition-colors">Admin Dashboard</a></li>
              <li><a href="#" className="text-geobus-text hover:text-geobus-neon transition-colors">Driver UI</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-heading font-bold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-geobus-text hover:text-geobus-neon transition-colors">About VeloraMobility</a></li>
              <li><a href="#" className="text-geobus-text hover:text-geobus-neon transition-colors">Contact</a></li>
              <li><a href="#" className="text-geobus-text hover:text-geobus-neon transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-geobus-text text-sm">
            © {new Date().getFullYear()} VeloraMobility. All rights reserved.
          </p>

          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-geobus-text hover:text-geobus-neon hover:bg-white/10 transition-colors">
              <Globe className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-geobus-text hover:text-geobus-neon hover:bg-white/10 transition-colors">
              <MessageCircle className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-geobus-text hover:text-geobus-neon hover:bg-white/10 transition-colors">
              <LinkIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
