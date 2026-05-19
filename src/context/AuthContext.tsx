"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendEmailVerification, 
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser
} from "firebase/auth";

export type UserRole = "passenger" | "driver" | "admin" | null;

export interface AppUser {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  role: UserRole;
  emailVerified: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmailPassword: (emailOrId: string, pass: string, role: "passenger" | "driver" | "admin") => Promise<void>;
  signUpPassenger: (email: string, pass: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Monitor auth status changes on the Firebase client
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Resolve user role
        const localRole = localStorage.getItem(`geobus_role_${fbUser.uid}`) as UserRole || "passenger";
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          phoneNumber: fbUser.phoneNumber,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || "Passenger",
          role: localRole,
          emailVerified: fbUser.emailVerified,
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

  // 1. Google Single Sign-On (OAuth)
  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured) return;
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      if (userCredential.user) {
        localStorage.setItem(`geobus_role_${userCredential.user.uid}`, "passenger");
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          phoneNumber: userCredential.user.phoneNumber,
          displayName: userCredential.user.displayName,
          role: "passenger",
          emailVerified: userCredential.user.emailVerified,
        });
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Firebase Google Auth failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 2. Passenger Sign Up with Username & Email Verification
  const signUpPassenger = async (email: string, pass: string, username: string) => {
    if (!isFirebaseConfigured) return;
    setLoading(true);
    try {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;

      // Update Display Name (Username)
      await updateProfile(fbUser, { displayName: username });

      // Send Verification Email
      await sendEmailVerification(fbUser);

      localStorage.setItem(`geobus_role_${fbUser.uid}`, "passenger");
      setUser({
        uid: fbUser.uid,
        email: fbUser.email,
        phoneNumber: fbUser.phoneNumber,
        displayName: username,
        role: "passenger",
        emailVerified: false, // verification is dispatched but not yet verified
      });
      
      setIsModalOpen(false);
    } catch (err) {
      console.error("Firebase sign up failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 3. Email & Password Log In (Passenger, Driver, or Admin)
  const loginWithEmailPassword = async (emailOrId: string, pass: string, role: "passenger" | "driver" | "admin") => {
    if (!isFirebaseConfigured) return;
    setLoading(true);
    try {
      const resolvedEmail = (role === "driver" && !emailOrId.includes("@")) 
        ? `${emailOrId}@geobus-fleet.com` 
        : emailOrId;
      
      const userCredential = await signInWithEmailAndPassword(auth, resolvedEmail, pass);
      const fbUser = userCredential.user;

      localStorage.setItem(`geobus_role_${fbUser.uid}`, role);
      setUser({
        uid: fbUser.uid,
        email: fbUser.email,
        phoneNumber: fbUser.phoneNumber,
        displayName: fbUser.displayName || resolvedEmail.split("@")[0],
        role,
        emailVerified: fbUser.emailVerified,
      });
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(`${role} login failed:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 4. Log out
  const logout = async () => {
    if (!isFirebaseConfigured) return;
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Sign out error:", err);
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
        signUpPassenger,
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
