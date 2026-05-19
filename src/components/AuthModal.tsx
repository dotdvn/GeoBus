"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Shield, User, Key, ArrowRight, Loader2, AlertCircle, Mail, Lock, Sparkles, CheckCircle2, Eye, EyeOff, RefreshCw, Check
} from "lucide-react";
import { useAuth, type UserRole } from "@/context/AuthContext";

export default function AuthModal() {
  const { 
    isModalOpen, 
    closeAuthModal, 
    loginWithGoogle, 
    signUpPassenger,
    loginWithEmailPassword,
    resendVerificationEmail,
    bypassEmailVerification
  } = useAuth();

  const [activeTab, setActiveTab] = useState<"passenger" | "driver" | "admin">("passenger");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Passenger state (Email/Password + Username + Confirm Password)
  const [isSignUp, setIsSignUp] = useState(false);
  const [passengerEmail, setPassengerEmail] = useState("");
  const [passengerUsername, setPassengerUsername] = useState("");
  const [passengerPassword, setPassengerPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Eye toggle visibility states
  const [showPassengerPass, setShowPassengerPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [showDriverAdminPass, setShowDriverAdminPass] = useState(false);

  // Verification Helper States
  const [resending, setResending] = useState(false);
  const [bypassing, setBypassing] = useState(false);

  // Driver/Admin states
  const [emailOrId, setEmailOrId] = useState("");
  const [password, setPassword] = useState("");

  // Clear states when tab changes
  useEffect(() => {
    setError(null);
    setSuccess(null);
    setIsSignUp(false);
    setPassengerEmail("");
    setPassengerUsername("");
    setPassengerPassword("");
    setConfirmPassword("");
    setEmailOrId("");
    setPassword("");
    setShowPassengerPass(false);
    setShowConfirmPass(false);
    setShowDriverAdminPass(false);
    setResending(false);
    setBypassing(false);
  }, [activeTab]);

  if (!isModalOpen) return null;

  // Handle Passenger Sign In or Sign Up
  const handlePassengerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!passengerEmail || !passengerPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (passengerPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (isSignUp) {
      if (!passengerUsername) {
        setError("Please enter a username.");
        return;
      }
      if (passengerPassword !== confirmPassword) {
        setError("Passwords do not match. Please try again.");
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUpPassenger(passengerEmail, passengerPassword, passengerUsername);
        setSuccess("Account created successfully! A secure verification email has been sent. Please check your spam folder if it doesn't arrive in 1-2 minutes.");
        // Clear inputs
        setPassengerEmail("");
        setPassengerUsername("");
        setPassengerPassword("");
        setConfirmPassword("");
        setIsSignUp(false);
      } else {
        await loginWithEmailPassword(passengerEmail, passengerPassword, "passenger");
        closeAuthModal();
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Check your credentials.");
    } finally {
      setLoading(false);
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
    setSuccess(null);
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

  // Handle Resend Verification Action
  const handleResend = async () => {
    setError(null);
    setResending(true);
    try {
      await resendVerificationEmail();
      setSuccess("Verification email successfully resent! Please check all folder tabs in your inbox.");
    } catch (err: any) {
      setError("Unable to resend email. Please try again in a few moments.");
    } finally {
      setResending(false);
    }
  };

  // Handle Instant Verification Bypass (Dev/Testing Mode)
  const handleBypass = () => {
    setBypassing(true);
    bypassEmailVerification();
    setSuccess("Instant verification successful! Accessing passenger portal...");
    setTimeout(() => {
      closeAuthModal();
      setBypassing(false);
    }, 1200);
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
              Firebase Gateway
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
            {activeTab === "passenger" 
              ? isSignUp ? "Passenger Sign-Up" : "Passenger Sign-In"
              : activeTab === "driver" ? "Driver Console" : "Security Command"}
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

        {/* Success Alert Block with Verification Utilities */}
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-950/40 border border-green-500/20 p-5 rounded-2xl mb-6 relative z-10 space-y-4"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
              <div className="text-sm text-green-200 font-medium leading-relaxed">{success}</div>
            </div>
            
            {/* Quick-action buttons for verification resend and bypass */}
            {activeTab === "passenger" && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50"
                >
                  {resending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  <span>Resend Email Link</span>
                </button>
                <button
                  type="button"
                  onClick={handleBypass}
                  disabled={bypassing}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-geobus-neon/10 hover:bg-geobus-neon/20 border border-geobus-neon/25 rounded-xl text-xs font-bold text-geobus-neon transition-all disabled:opacity-50"
                >
                  {bypassing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Verify Instantly (Dev Bypass)</span>
                </button>
              </div>
            )}
          </motion.div>
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
                <form onSubmit={handlePassengerSubmit} className="space-y-4">
                  
                  {isSignUp && (
                    <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5 font-heading">
                        Username
                      </label>
                      <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 focus-within:border-geobus-neon/50 transition-all">
                        <div className="pl-4 text-geobus-text">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={passengerUsername}
                          onChange={(e) => setPassengerUsername(e.target.value)}
                          placeholder="johndoe"
                          required
                          className="w-full bg-transparent border-none outline-none py-3 px-4 text-white placeholder:text-white/20 font-sans text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5 font-heading">
                      Email Address
                    </label>
                    <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 focus-within:border-geobus-neon/50 transition-all">
                      <div className="pl-4 text-geobus-text">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={passengerEmail}
                        onChange={(e) => setPassengerEmail(e.target.value)}
                        placeholder="passenger@example.com"
                        required
                        className="w-full bg-transparent border-none outline-none py-3 px-4 text-white placeholder:text-white/20 font-sans text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5 font-heading">
                      Password
                    </label>
                    <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 focus-within:border-geobus-neon/50 transition-all">
                      <div className="pl-4 text-geobus-text">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassengerPass ? "text" : "password"}
                        value={passengerPassword}
                        onChange={(e) => setPassengerPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-transparent border-none outline-none py-3 pl-4 pr-12 text-white placeholder:text-white/20 font-sans text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassengerPass(!showPassengerPass)}
                        className="absolute right-4 text-geobus-text hover:text-white transition-colors"
                      >
                        {showPassengerPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isSignUp && (
                    <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5 font-heading">
                        Confirm Password
                      </label>
                      <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 focus-within:border-geobus-neon/50 transition-all">
                        <div className="pl-4 text-geobus-text">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showConfirmPass ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full bg-transparent border-none outline-none py-3 pl-4 pr-12 text-white placeholder:text-white/20 font-sans text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-4 text-geobus-text hover:text-white transition-colors"
                        >
                          {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {isSignUp && (
                    <div className="py-2.5 px-3.5 bg-geobus-neon/5 border border-geobus-neon/15 rounded-xl flex flex-col gap-1 text-[10px] text-geobus-neon/85">
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-geobus-neon">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>Email Verification Note</span>
                      </div>
                      <p className="text-white/60 pl-5 leading-relaxed font-sans">
                        A secure verification link will be dispatched automatically. **Please check your Spam or Promotions folder** if it does not arrive in your primary inbox!
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-geobus-neon hover:bg-[#a5e635] text-black font-extrabold uppercase rounded-2xl transition-all tracking-wider font-heading flex items-center justify-center gap-2 disabled:opacity-50 neon-glow"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isSignUp ? "Verify & Create Account" : "Access Secure Portal"}
                    {!loading && <ArrowRight className="w-5 h-5" />}
                  </button>

                  <div className="text-center mt-3">
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-xs text-geobus-neon font-bold hover:underline"
                    >
                      {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Register as Passenger"}
                    </button>
                  </div>

                  {/* Google Login Separator */}
                  <div className="relative my-6 flex items-center justify-center">
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
                        type={showDriverAdminPass ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-transparent border-none outline-none py-4 pl-4 pr-12 text-white placeholder:text-white/20 font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowDriverAdminPass(!showDriverAdminPass)}
                        className="absolute right-4 text-geobus-text hover:text-white transition-colors"
                      >
                        {showDriverAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
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
