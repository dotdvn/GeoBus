"use client";

import { motion } from "framer-motion";
import { Navigation, Clock, Ticket, GraduationCap, ShieldCheck, BarChart3, AlertTriangle, Route } from "lucide-react";

const features = [
  { icon: Navigation, title: "Live GPS Tracking", desc: "Real-time accuracy down to the meter." },
  { icon: Clock, title: "AI ETA Prediction", desc: "Machine learning powered arrival times." },
  { icon: Ticket, title: "Smart Ticketing", desc: "Contactless QR boarding." },
  { icon: GraduationCap, title: "Student Transport", desc: "Dedicated secure routing for schools." },
  { icon: ShieldCheck, title: "Driver Monitoring", desc: "Live health and fatigue tracking." },
  { icon: BarChart3, title: "Fleet Analytics", desc: "Deep insights into fleet performance." },
  { icon: AlertTriangle, title: "Emergency Alerts", desc: "Instant SOS and dynamic rerouting." },
  { icon: Route, title: "Route Optimization", desc: "AI-driven fuel & time efficiency." },
];

export default function FeaturesSection() {
  return (
    <section className="py-32 relative z-10 bg-geobus-black">
      <div className="container px-6 mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-heading font-bold text-white mb-4 uppercase"
          >
            Intelligent Features
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-geobus-text max-w-2xl mx-auto"
          >
            Powered by advanced telemetry and AI, our platform ensures safety, efficiency, and real-time intelligence.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-6 rounded-2xl group hover:border-geobus-neon/50 transition-colors duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-geobus-neon/5 rounded-full blur-[50px] -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-50" />
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-geobus-neon/10 transition-colors">
                <feature.icon className="w-6 h-6 text-geobus-neon" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-heading">{feature.title}</h3>
              <p className="text-sm text-geobus-text">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
