"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Phone, Shield, User, Key, ArrowRight, Loader2, Sparkles, AlertCircle, RefreshCw
} from "lucide-react";
import { useAuth, type UserRole } from "@/context/AuthContext";
const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

export default function AuthModal() {
  const { 
    isModalOpen, 
    closeAuthModal, 
    loginWithGoogle, 
    sendPhoneOtp, 
    verifyPhoneOtp, 
    loginWithEmailPassword 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<"passenger" | "driver" | "admin">("passenger");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Passenger state
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(""));
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Driver/Admin states
  const [emailOrId, setEmailOrId] = useState("");
  const [password, setPassword] = useState("");

  // Clear states when tab changes
  useEffect(() => {
    setError(null);
    setOtpSent(false);
    setPhone("");
    setOtpCode(Array(6).fill(""));
    setEmailOrId("");
    setPassword("");
  }, [activeTab]);

  // Clean captcha element on modal mount/unmount
  useEffect(() => {
    return () => {
      // clean up any lingering recaptcha badge if DOM is updated
      const badges = document.getElementsByClassName("grecaptcha-badge");
      if (badges.length > 0) {
        badges[0].remove();
      }
    };
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  // Handle send OTP SMS
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number with country code.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // Check if code has + prefix
      const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
      await sendPhoneOtp(formattedPhone, "recaptcha-container");
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpCode.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await verifyPhoneOtp(code);
      closeAuthModal();
    } catch (err: any) {
      setError(err.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otpCode];
    newOtp[index] = value.substring(value.length - 1);
    setOtpCode(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Email/Pass login (Driver and Admin)
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrId || !password) {
      setError("All fields are required.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await loginWithEmailPassword(emailOrId, password, activeTab as "driver" | "admin");
      closeAuthModal();
    } catch (err: any) {
      setError(err.message || "Authentication failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Overlay background */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeAuthModal}
        className="absolute inset-0 bg-[#000]/80 backdrop-blur-md"
      />

      {/* Invisible Recaptcha target element required by firebase auth */}
      <div id="recaptcha-container" className="absolute top-0 left-0 hidden pointer-events-none" />

      {/* Modal Card */}
      <motion.div 
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="relative w-full max-w-lg glass-card rounded-[32px] overflow-hidden border border-white/10 shadow-2xl z-10 p-6 md:p-8"
      >
        {/* Glow Effects */}
        <div className={`absolute top-0 right-1/4 w-[250px] h-[250px] rounded-full blur-[80px] opacity-10 pointer-events-none transition-colors duration-500 ${
          activeTab === "passenger" ? "bg-geobus-neon" : activeTab === "driver" ? "bg-blue-500" : "bg-red-500"
        }`} />

        {/* Header */}
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              activeTab === "passenger" ? "bg-geobus-neon" : activeTab === "driver" ? "bg-blue-400" : "bg-red-500"
            }`} />
            <span className="text-sm font-semibold tracking-widest text-white/50 uppercase font-heading">
              Secure Gateway
            </span>
          </div>
          <button 
            onClick={closeAuthModal}
            className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:border-white/20 transition-all hover:bg-white/10"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Title */}
        <div className="mb-6 relative z-10">
          <h2 className="text-3xl font-heading font-extrabold text-white tracking-tight uppercase">
            {activeTab === "passenger" ? "Passenger Sign-In" : activeTab === "driver" ? "Driver Console" : "Security Command"}
          </h2>
          <p className="text-sm text-geobus-text mt-1">
            Access your secure portal connected dynamically to VeloraMobility.
          </p>
        </div>

        {/* Role Tab Selector */}
        <div className="flex bg-white/5 border border-white/5 p-1 rounded-2xl gap-1 mb-8 relative z-10">
          {(["passenger", "driver", "admin"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-bold rounded-xl uppercase tracking-wider transition-all duration-300 relative ${
                activeTab === tab 
                  ? tab === "passenger" 
                    ? "bg-geobus-neon text-black shadow-[0_0_15px_rgba(182,255,59,0.3)] font-black" 
                    : tab === "driver"
                      ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                      : "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                {tab === "passenger" && <User className="w-4 h-4" />}
                {tab === "driver" && <Shield className="w-4 h-4" />}
                {tab === "admin" && <Key className="w-4 h-4" />}
                <span>{tab}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Errors Block */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 bg-red-950/40 border border-red-500/20 p-4 rounded-2xl mb-6 relative z-10"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm text-red-200">{error}</div>
          </motion.div>
        )}

        {/* Supabase Config Notice for Dev */}
        {!isSupabaseConfigured && (
          <div className="mb-6 py-2 px-3 bg-yellow-950/20 border border-yellow-500/10 rounded-xl flex items-center gap-2 text-xs text-yellow-300/80 relative z-10">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Simulation Mode Active (Use code <strong>123456</strong> for OTP, or any credentials)</span>
          </div>
        )}

        {/* Tab Contents */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {activeTab === "passenger" ? (
              <motion.div
                key="passenger"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                {!otpSent ? (
                  /* Phone Entry Form */
                  <form onSubmit={handleSendOtp} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 font-heading">
                        Mobile Phone Number
                      </label>
                      <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 focus-within:border-geobus-neon/50 transition-all">
                        <div className="pl-4 pr-2 flex items-center gap-1 border-r border-white/10 text-white font-medium">
                          <Phone className="w-4 h-4 text-geobus-text" />
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 555 0199"
                          required
                          className="w-full bg-transparent border-none outline-none py-4 px-4 text-white placeholder:text-white/20 font-sans"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-geobus-neon hover:bg-[#a5e635] text-black font-extrabold uppercase rounded-2xl transition-all tracking-wider font-heading flex items-center justify-center gap-2 disabled:opacity-50 neon-glow"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Secure OTP"}
                      {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>

                    {/* Google Login Separator */}
                    <div className="relative my-8 flex items-center justify-center">
                      <div className="absolute inset-x-0 h-px bg-white/10" />
                      <span className="relative bg-[#0d0d0d] px-4 text-xs font-bold text-white/30 uppercase tracking-wider">
                        Or authenticate with
                      </span>
                    </div>

                    {/* Google login button */}
                    <button
                      type="button"
                      onClick={loginWithGoogle}
                      disabled={loading}
                      className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-3"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Sign in with Google</span>
                    </button>
                  </form>
                ) : (
                  /* OTP Code Screen */
                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div className="text-center mb-4">
                      <p className="text-sm text-geobus-text">
                        A secure OTP has been dispatched to <strong className="text-white">{phone}</strong>.
                      </p>
                      <button 
                        type="button"
                        onClick={() => setOtpSent(false)} 
                        className="text-xs text-geobus-neon font-bold hover:underline mt-2 flex items-center gap-1 mx-auto"
                      >
                        <RefreshCw className="w-3 h-3" /> Change Phone Number
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-widest text-center mb-4 font-heading">
                        Enter 6-Digit OTP Code
                      </label>
                      <div className="flex justify-center gap-2.5">
                        {otpCode.map((val, idx) => (
                          <input
                            key={idx}
                            type="text"
                            maxLength={1}
                            value={val}
                            ref={(el) => {
                              otpInputRefs.current[idx] = el;
                            }}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            className="w-12 h-14 bg-white/5 border border-white/10 hover:bg-white/10 focus:border-geobus-neon focus:ring-1 focus:ring-geobus-neon text-center text-white text-xl font-bold font-heading rounded-xl outline-none transition-all"
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-geobus-neon hover:bg-[#a5e635] text-black font-extrabold uppercase rounded-2xl transition-all tracking-wider font-heading flex items-center justify-center gap-2 disabled:opacity-50 neon-glow"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify and Login"}
                    </button>
                  </form>
                )}
              </motion.div>
            ) : (
              /* Drivers & Admins Forms */
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <form onSubmit={handleEmailLogin} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 font-heading">
                      {activeTab === "driver" ? "Driver ID or Email" : "Admin Email Address"}
                    </label>
                    <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 focus-within:border-white/30 transition-all">
                      <div className="pl-4 text-geobus-text">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={emailOrId}
                        onChange={(e) => setEmailOrId(e.target.value)}
                        placeholder={activeTab === "driver" ? "DRV-99321" : "admin@veloramobility.com"}
                        required
                        className="w-full bg-transparent border-none outline-none py-4 px-4 text-white placeholder:text-white/20 font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 font-heading">
                      Secret Password
                    </label>
                    <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 focus-within:border-white/30 transition-all">
                      <div className="pl-4 text-geobus-text">
                        <Key className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-transparent border-none outline-none py-4 px-4 text-white placeholder:text-white/20 font-sans"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 text-black font-extrabold uppercase rounded-2xl transition-all tracking-wider font-heading flex items-center justify-center gap-2 disabled:opacity-50 ${
                      activeTab === "driver" 
                        ? "bg-blue-500 hover:bg-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                        : "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                    }`}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Access Secure Portal`}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
