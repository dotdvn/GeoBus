"use client";

import { motion } from "framer-motion";
import { QrCode, BusFront, MapPin, User, ChevronRight, Ticket } from "lucide-react";

export default function MobileAppShowcase() {
  return (
    <section className="py-32 relative bg-geobus-black overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-geobus-neon/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container px-6 mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2 relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-heading font-bold text-white mb-6 uppercase tracking-tight"
            >
              The Ultimate Passenger Experience
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-geobus-text mb-8"
            >
              Everything you need in your pocket. Live tracking, smart contactless ticketing, and real-time alerts wrapped in a stunning dark luxury interface.
            </motion.p>

            <div className="space-y-4">
              {['Live GPS Tracking & ETA', 'Contactless QR Boarding', 'Interactive Seat Selection', 'Real-time Delay Alerts'].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="flex items-center gap-3 glass-card p-4 rounded-xl border border-white/5"
                >
                  <div className="w-8 h-8 rounded-full bg-geobus-neon/20 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-geobus-neon" />
                  </div>
                  <span className="text-white font-medium">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex justify-center relative h-[600px]">
            {/* Phone Mockup 1: Main Tracking */}
            <motion.div
              initial={{ opacity: 0, y: 50, rotate: -5 }}
              whileInView={{ opacity: 1, y: 0, rotate: -5 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="absolute left-[10%] top-10 w-[280px] h-[580px] rounded-[40px] bg-geobus-gray border-4 border-[#333] shadow-2xl overflow-hidden z-10"
            >
              {/* Notch */}
              <div className="absolute top-0 inset-x-0 h-6 flex justify-center">
                <div className="w-32 h-6 bg-[#333] rounded-b-xl" />
              </div>
              
              {/* App Screen Content */}
              <div className="w-full h-full bg-[#0a0a0a] pt-12 px-4 pb-6 flex flex-col relative">
                {/* Simulated Map Background */}
                <div className="absolute inset-0 bg-[#121212] z-0 overflow-hidden opacity-50">
                   <div className="absolute top-1/3 left-1/4 w-32 h-32 border border-geobus-neon/20 rounded-full blur-md" />
                   <div className="absolute w-full h-[200px] border-l-2 border-geobus-neon/50 left-1/2 top-1/4 -rotate-12 blur-[1px]" />
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <div className="w-10 h-10 rounded-full glass flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-white font-heading font-bold text-xl">GeoBus</h3>
                    <div className="w-10 h-10 rounded-full glass flex items-center justify-center">
                      <BusFront className="w-5 h-5 text-geobus-neon" />
                    </div>
                  </div>

                  <div className="glass-card p-4 rounded-2xl mb-4 border border-geobus-neon/30">
                    <h4 className="text-white font-bold mb-1">Route 701 Downtown</h4>
                    <p className="text-geobus-text text-sm mb-4">Arriving in 3 mins</p>
                    <div className="flex items-center gap-2">
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="w-[85%] h-full bg-geobus-neon" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-auto absolute bottom-8 left-4 right-4">
                    <div className="h-16 glass rounded-2xl flex justify-around items-center px-4">
                      <MapPin className="w-6 h-6 text-geobus-neon" />
                      <Ticket className="w-6 h-6 text-white/50" />
                      <User className="w-6 h-6 text-white/50" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Phone Mockup 2: QR Pass */}
            <motion.div
              initial={{ opacity: 0, y: 100, rotate: 5 }}
              whileInView={{ opacity: 1, y: 40, rotate: 5 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute right-[10%] top-20 w-[280px] h-[580px] rounded-[40px] bg-geobus-gray border-4 border-[#222] shadow-2xl overflow-hidden z-20"
            >
               {/* Notch */}
               <div className="absolute top-0 inset-x-0 h-6 flex justify-center">
                <div className="w-32 h-6 bg-[#222] rounded-b-xl" />
              </div>
              
              <div className="w-full h-full bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] pt-12 px-5 pb-6 flex flex-col items-center">
                <h3 className="text-white font-heading font-bold text-xl mb-8 w-full text-center">Smart Pass</h3>
                
                <div className="w-full bg-white rounded-3xl p-6 flex flex-col items-center relative overflow-hidden">
                  <div className="w-4 h-4 rounded-full bg-[#1a1a1a] absolute -left-2 top-1/2 -translate-y-1/2" />
                  <div className="w-4 h-4 rounded-full bg-[#1a1a1a] absolute -right-2 top-1/2 -translate-y-1/2" />
                  
                  <p className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-4">Boarding Pass</p>
                  <QrCode className="w-40 h-40 text-black mb-4" />
                  <div className="w-full border-t border-dashed border-gray-300 my-4" />
                  <h4 className="text-black font-bold text-2xl font-heading">John Doe</h4>
                  <p className="text-gray-500 text-sm">Zone A → Zone D</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
