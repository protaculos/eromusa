"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  credits: number;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  signInWithGithub: () => Promise<string | null>;
  signInWithDiscord: () => Promise<string | null>;
  signInWithApple: () => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshCredits: () => Promise<void>;
  reconcilePendingPayments: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  credits: 0,
  loading: true,
  signIn: async () => null,
  signUp: async () => null,
  signInWithGoogle: async () => null,
  signInWithGithub: async () => null,
  signInWithDiscord: async () => null,
  signInWithApple: async () => null,
  signOut: async () => {},
  refreshCredits: async () => {},
  reconcilePendingPayments: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log("AuthContext: Initial session check:", initialSession?.user?.email);

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await fetchCredits(initialSession.user.id);
          await reconcilePendingPayments();
        }
      } catch (error) {
        console.error("AuthContext: Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthContext: onAuthStateChange event:", event, "session:", session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchCredits(session.user.id);
          await reconcilePendingPayments();
        }
        setLoading(false);
      }
    );

    return () => listener?.subscription.unsubscribe();
  }, []);

  const fetchCredits = async (userId: string) => {
    console.log("fetchCredits called for user:", userId);
    const { data, error } = await supabase
      .from("users")
      .select("credits")
      .eq("id", userId)
      .single();
    console.log("fetchCredits result:", data, "error:", error);
    if (data) setCredits(data.credits ?? 0);
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return error?.message || null;
  };

  const signUp = async (
    email: string,
    password: string
  ): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return error.message;

    // Create user record in users table
    const { data: authData } = await supabase.auth.getSession();
    if (authData?.session?.user) {
      await supabase.from("users").insert({
        id: authData.session.user.id,
        email: email,
        credits: 0,
      });
    }
    return null;
  };

  const signInWithGoogle = async (): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    return error?.message || null;
  };

  const signInWithGithub = async (): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    return error?.message || null;
  };

  const signInWithDiscord = async (): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    return error?.message || null;
  };

  const signInWithApple = async (): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    return error?.message || null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setCredits(0);
  };

  const refreshCredits = async () => {
    console.log("refreshCredits called");
    // Try to get user from state first, or from supabase directly
    const userId = user?.id;
    if (userId) {
      console.log("Fetching credits for user:", userId);
      await fetchCredits(userId);
    } else {
      // Try to get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log("Fetching credits from session:", session.user.id);
        await fetchCredits(session.user.id);
      } else {
        console.log("No user found for refreshCredits");
      }
    }
  };

  // Reconcile pending payments when user logs in or on app load
  const reconcilePendingPayments = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch("/api/payments/reconcile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.processed > 0) {
          console.log(`Reconciled ${data.processed} pending payment(s)`);
          // Refresh credits after reconciliation
          await refreshCredits();
        }
      }
    } catch (error) {
      console.error("Error reconciling payments:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, credits, loading, signIn, signUp, signInWithGoogle, signInWithGithub, signInWithDiscord, signInWithApple, signOut, refreshCredits, reconcilePendingPayments }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);