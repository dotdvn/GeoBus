"use client";

import { motion } from "framer-motion";
import { Activity, Users, Bus, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  return (
    <section className="py-32 relative bg-geobus-graphite border-y border-white/5">
      <div className="container px-6 mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-heading font-bold text-white mb-4 uppercase tracking-tight"
          >
            Command & Control
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-geobus-text max-w-2xl mx-auto"
          >
            A powerful, centralized hub for fleet managers. Monitor health, optimize routes, and respond to incidents in real-time.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-5xl mx-auto rounded-3xl overflow-hidden glass-card border border-white/10 shadow-2xl"
        >
          {/* Dashboard Header Mockup */}
          <div className="h-14 bg-geobus-black/50 border-b border-white/5 flex items-center px-6 gap-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="w-64 h-6 bg-white/5 rounded-md mx-auto" />
          </div>

          {/* Dashboard Content Mockup */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-6 bg-[#0f0f0f]">
            {/* Sidebar Stats */}
            <div className="col-span-1 space-y-4">
              {[
                { label: "Active Fleet", value: "TRIAL", icon: Bus, color: "text-geobus-neon" },
                { label: "Total Passengers", value: "TRIAL", icon: Users, color: "text-white" },
                { label: "System Health", value: "TRIAL", icon: Activity, color: "text-green-400" },
                { label: "Alerts", value: "TRIAL", icon: AlertCircle, color: "text-red-400" },
              ].map((stat, idx) => (
                <div key={idx} className="glass p-4 rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-geobus-text">{stat.label}</p>
                    <p className="text-xl font-bold text-white font-heading">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Chart Area Mockup */}
            <div className="col-span-1 md:col-span-3 glass rounded-2xl p-6 relative overflow-hidden flex flex-col">
              <h3 className="text-white font-heading font-bold mb-6">Fleet Performance Analytics</h3>

              <div className="flex-grow flex items-end gap-2 h-48 opacity-80 mt-auto">
                {/* CSS Mock Chart */}
                {[40, 60, 30, 80, 50, 90, 70, 100, 85, 60, 40, 75, 95].map((height, idx) => (
                  <div key={idx} className="w-full relative group cursor-pointer h-full flex items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + (idx * 0.05), duration: 0.8 }}
                      className={`w-full rounded-t-sm ${idx % 3 === 0 ? 'bg-geobus-neon' : 'bg-white/20'} group-hover:bg-white transition-colors`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
