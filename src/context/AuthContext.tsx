"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword,
  type User as FirebaseUser,
  type ConfirmationResult
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured, RecaptchaVerifier, signInWithPhoneNumber } from "@/lib/firebase";

export type UserRole = "passenger" | "driver" | "admin" | null;

export interface AppUser {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  role: UserRole;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithGoogle: () => Promise<void>;
  sendPhoneOtp: (phone: string, elementId: string) => Promise<boolean>;
  verifyPhoneOtp: (code: string) => Promise<boolean>;
  loginWithEmailPassword: (emailOrId: string, pass: string, role: "driver" | "admin") => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  // Auto detect active firebase user session
  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Mock session restoration if any localstorage exists
      const savedUser = localStorage.getItem("geobus_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Derive role from custom claims or email structure (fallback to local role check)
        const localRole = localStorage.getItem(`geobus_role_${firebaseUser.uid}`) as UserRole || "passenger";
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          phoneNumber: firebaseUser.phoneNumber,
          displayName: firebaseUser.displayName || "Passenger User",
          role: localRole,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = () => setIsModalOpen(true);
  const closeAuthModal = () => setIsModalOpen(false);

  // Google Login
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        localStorage.setItem(`geobus_role_${fbUser.uid}`, "passenger");
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          phoneNumber: fbUser.phoneNumber,
          displayName: fbUser.displayName || "Passenger User",
          role: "passenger",
        });
      } else {
        // Mock delay & login
        await new Promise((res) => setTimeout(res, 1000));
        const mockUser: AppUser = {
          uid: "mock-google-user",
          email: "demo.passenger@velora.com",
          phoneNumber: null,
          displayName: "Velora Passenger",
          role: "passenger",
        };
        setUser(mockUser);
        localStorage.setItem("geobus_user", JSON.stringify(mockUser));
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Google Auth failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Phone OTP System
  const sendPhoneOtp = async (phone: string, elementId: string) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        // Clean old captcha if existing
        if (recaptchaVerifier) {
          recaptchaVerifier.clear();
        }
        
        const verifier = new RecaptchaVerifier(auth, elementId, {
          size: "invisible",
          callback: () => {
            console.log("Recaptcha verified");
          }
        });
        setRecaptchaVerifier(verifier);

        const confirmation = await signInWithPhoneNumber(auth, phone, verifier);
        setConfirmationResult(confirmation);
        return true;
      } else {
        // Simulation mode delay
        await new Promise((res) => setTimeout(res, 1500));
        console.log(`[GeoBus Simulation] OTP Sent to ${phone}. Enter Code: 123456`);
        return true;
      }
    } catch (err) {
      console.error("Phone Auth code delivery failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneOtp = async (code: string) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && confirmationResult) {
        const result = await confirmationResult.confirm(code);
        const fbUser = result.user;
        localStorage.setItem(`geobus_role_${fbUser.uid}`, "passenger");
        setUser({
          uid: fbUser.uid,
          email: null,
          phoneNumber: fbUser.phoneNumber,
          displayName: "Mobile Passenger",
          role: "passenger",
        });
        setIsModalOpen(false);
        return true;
      } else {
        // Simulation verification
        await new Promise((res) => setTimeout(res, 1000));
        if (code === "123456") {
          const mockUser: AppUser = {
            uid: "mock-phone-user",
            email: null,
            phoneNumber: "+1 (555) 0199",
            displayName: "PassenGer-199",
            role: "passenger",
          };
          setUser(mockUser);
          localStorage.setItem("geobus_user", JSON.stringify(mockUser));
          setIsModalOpen(false);
          return true;
        }
        throw new Error("Invalid verification code");
      }
    } catch (err) {
      console.error("OTP verification failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Drivers & Admins login (Email/ID + Password)
  const loginWithEmailPassword = async (emailOrId: string, pass: string, role: "driver" | "admin") => {
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        // Resolve Driver ID format to a mock email if needed
        const resolvedEmail = emailOrId.includes("@") ? emailOrId : `${emailOrId}@geobus-fleet.com`;
        const result = await signInWithEmailAndPassword(auth, resolvedEmail, pass);
        const fbUser = result.user;
        localStorage.setItem(`geobus_role_${fbUser.uid}`, role);
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          phoneNumber: null,
          displayName: role === "admin" ? "GeoBus Admin Command" : `Driver #${emailOrId}`,
          role,
        });
      } else {
        // Simulation credentials validation
        await new Promise((res) => setTimeout(res, 1200));
        
        // Simple demo criteria validation
        if (pass.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        
        const mockUser: AppUser = {
          uid: `mock-${role}-user`,
          email: emailOrId.includes("@") ? emailOrId : `${emailOrId}@geobus-fleet.com`,
          phoneNumber: null,
          displayName: role === "admin" ? "Admin Control Hub" : `Fleet Operator ID: ${emailOrId}`,
          role,
        };
        
        setUser(mockUser);
        localStorage.setItem("geobus_user", JSON.stringify(mockUser));
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(`${role} login failed:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const logout = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        await signOut(auth);
      }
      setUser(null);
      localStorage.removeItem("geobus_user");
    } catch (err) {
      console.error("Log out failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        isModalOpen, 
        openAuthModal, 
        closeAuthModal, 
        loginWithGoogle,
        sendPhoneOtp,
        verifyPhoneOtp,
        loginWithEmailPassword,
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
