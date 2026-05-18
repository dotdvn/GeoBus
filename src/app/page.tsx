import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import LiveTrackingSection from "@/components/LiveTrackingSection";
import AdminDashboard from "@/components/AdminDashboard";
import SmartCitySection from "@/components/SmartCitySection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-geobus-black flex flex-col font-sans">
      <Navbar />
      <HeroSection />
      <LiveTrackingSection />
      <FeaturesSection />
      <AdminDashboard />
      <SmartCitySection />
      <Footer />
    </main>
  );
}
