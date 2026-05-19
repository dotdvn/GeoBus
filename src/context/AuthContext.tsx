"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

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
  loginWithEmailPassword: (emailOrId: string, pass: string, role: "passenger" | "driver" | "admin") => Promise<void>;
  signUpPassenger: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const supabase = createClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Monitor auth status changes on the Supabase client
  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const sbUser = session.user;
        const localRole = localStorage.getItem(`geobus_role_${sbUser.id}`) as UserRole || "passenger";
        setUser({
          uid: sbUser.id,
          email: sbUser.email || null,
          phoneNumber: sbUser.phone || null,
          displayName: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || "Passenger User",
          role: localRole,
        });
      }
      setLoading(false);
    });

    // 2. Auth state subscriptions
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        const sbUser = session.user;
        const localRole = localStorage.getItem(`geobus_role_${sbUser.id}`) as UserRole || "passenger";
        setUser({
          uid: sbUser.id,
          email: sbUser.email || null,
          phoneNumber: sbUser.phone || null,
          displayName: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || "Passenger User",
          role: localRole,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const openAuthModal = () => setIsModalOpen(true);
  const closeAuthModal = () => setIsModalOpen(false);

  // 1. Google Single Sign-On (OAuth)
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error("Supabase Google Auth redirect failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 2. Passenger Sign Up (Email/Password)
  const signUpPassenger = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
      });

      if (error) throw error;

      if (data?.user) {
        localStorage.setItem(`geobus_role_${data.user.id}`, "passenger");
        setUser({
          uid: data.user.id,
          email: data.user.email || null,
          phoneNumber: null,
          displayName: email.split("@")[0],
          role: "passenger",
        });
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Supabase sign up error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 3. Email & Password Log In (Passenger, Driver, or Admin)
  const loginWithEmailPassword = async (emailOrId: string, pass: string, role: "passenger" | "driver" | "admin") => {
    setLoading(true);
    try {
      // If it is a Driver login and they entered a raw ID (e.g. DRV-99321), resolve to fleet domain email
      const resolvedEmail = (role === "driver" && !emailOrId.includes("@")) 
        ? `${emailOrId}@geobus-fleet.com` 
        : emailOrId;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password: pass,
      });

      if (error) throw error;

      if (data?.user) {
        localStorage.setItem(`geobus_role_${data.user.id}`, role);
        setUser({
          uid: data.user.id,
          email: data.user.email || null,
          phoneNumber: null,
          displayName: role === "admin" 
            ? "GeoBus Admin Command" 
            : role === "driver" 
              ? `Driver #${emailOrId}` 
              : emailOrId.split("@")[0],
          role,
        });
        setIsModalOpen(false);
      }
    } catch (err: any) {
      console.error(`${role} login failed:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 4. Log out
  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
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
