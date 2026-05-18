"use client";

import { motion } from "framer-motion";
import { Cpu, Wifi, Globe, Shield } from "lucide-react";

export default function SmartCitySection() {
  return (
    <section className="py-32 relative bg-geobus-black overflow-hidden">
      {/* Cityscape stylized background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex items-end justify-center">
         <div className="w-full h-1/2 bg-[linear-gradient(to_top,#1a1a1a_1px,transparent_1px),linear-gradient(to_right,#1a1a1a_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:linear-gradient(to_top,black_10%,transparent_100%)]" />
      </div>

      <div className="container px-6 mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2 relative">
            <div className="relative w-full aspect-square max-w-[500px] mx-auto">
              {/* Circular IoT Nodes */}
              <div className="absolute inset-0 rounded-full border border-white/5 animate-[spin_60s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full border border-geobus-neon/20 animate-[spin_40s_linear_infinite_reverse]" />
              <div className="absolute inset-12 rounded-full border border-white/5 animate-[spin_30s_linear_infinite]" />
              
              {/* Center Core */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-geobus-black rounded-full flex items-center justify-center neon-glow border border-geobus-neon/50">
                <Cpu className="w-12 h-12 text-geobus-neon" />
              </div>

              {/* Floating Icons */}
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[15%] left-[15%] w-16 h-16 glass rounded-2xl flex items-center justify-center border border-white/10"
              >
                <Wifi className="w-6 h-6 text-white" />
              </motion.div>

              <motion.div 
                animate={{ y: [0, 15, 0] }} 
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[20%] left-[10%] w-14 h-14 glass rounded-2xl flex items-center justify-center border border-white/10"
              >
                <Globe className="w-6 h-6 text-white" />
              </motion.div>

              <motion.div 
                animate={{ y: [0, -15, 0] }} 
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-[30%] right-[10%] w-16 h-16 glass rounded-2xl flex items-center justify-center border border-white/10"
              >
                <Shield className="w-6 h-6 text-white" />
              </motion.div>
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            <motion.h2
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-heading font-bold text-white mb-6 uppercase tracking-tight"
            >
              Smart City Ecosystem
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-geobus-text mb-8"
            >
              GeoBus isn't just an app. It's a connected IoT mobility platform designed to integrate seamlessly into modern digital infrastructures, reducing emissions and streamlining transit.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-full transition-all hover:scale-105 flex items-center justify-center gap-2 glass">
                Explore The Technology
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
