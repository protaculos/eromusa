"use client";

import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
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
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await fetchCredits(initialSession.user.id);
          await reconcilePendingPayments();
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchCredits(session.user.id);
          await reconcilePendingPayments();
        }
        setLoading(false);
      }
    );

    // Check for success status in URL to trigger immediate credit refresh
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("status") === "success") {
        (async () => {
          if (session?.user) {
            await fetchCredits(session.user.id);
          } else {
            const { data: currentSession } = await supabase.auth.getSession();
            if (currentSession?.session?.user) {
              await fetchCredits(currentSession.session.user.id);
            }
          }
          window.history.replaceState({}, document.title, window.location.pathname);
        })();
      }
    }

    return () => listener?.subscription.unsubscribe();
  }, []);

  const fetchCredits = async (userId: string) => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        return;
      }

      const response = await fetch("/api/user/credits", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch credits");
      }

      const data = await response.json();
      setCredits(data.credits ?? 0);
    } catch (err: any) {
      console.error("Error fetching credits:", err.message);
    }
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

  const refreshCredits = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchCredits(session.user.id);
      }
    } catch (err) {
      console.error("Error refreshing credits:", err);
    }
  }, []);

  // --- Supabase Realtime: Escuta mudanças na coluna credits do usuário logado ---
  useEffect(() => {
    if (!user) {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      return;
    }

    console.log("[Realtime] Initializing channel for user:", user.id);

    const channel = supabase
      .channel(`user_credits_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const newCredits = payload.new.credits;
          console.log("[Realtime] Credits update received:", newCredits);
          setCredits(newCredits);
        }
      )
      .subscribe((status) => {
        console.log("[Realtime] Subscription status:", status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [user]);

  // --- Polling na visibilidade da aba (fallback para quando o usuário volta do checkout) ---
  useEffect(() => {
    if (!user) return;

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshCredits();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
    };
  }, [user, refreshCredits]);

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
