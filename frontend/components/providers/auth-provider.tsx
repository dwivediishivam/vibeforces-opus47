"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import type { UserRole } from "@shared/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  username: string;
  display_name: string;
  role: UserRole;
  avatar_url?: string | null;
  rating?: number | null;
  rating_peak?: number | null;
  rating_solves?: number | null;
};

type SignupInput = {
  email: string;
  password: string;
  username: string;
  displayName: string;
  role: Exclude<UserRole, "admin">;
};

type SignupResult = {
  email: string;
  requiresEmailConfirmation: boolean;
  role: Exclude<UserRole, "admin">;
};

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignupInput) => Promise<SignupResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfile(userId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("profiles")
    .select(
      "id, username, display_name, role, avatar_url, rating, rating_peak, rating_solves",
    )
    .eq("id", userId)
    .single();

  return data as Profile | null;
}

async function waitForProfile(userId: string) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const profile = await loadProfile(userId);
    if (profile) return profile;
    await new Promise((resolve) => window.setTimeout(resolve, 250));
  }

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const client = supabase;
    let mounted = true;

    async function resolveProfile(userId: string) {
      // Retry briefly — handles the race where a fresh signup hasn't
      // yet had its profile row created by the handle_new_user trigger,
      // and any transient RLS/network blip.
      const profile = await waitForProfile(userId);
      if (profile) return profile;
      // No profile after retries: the session is unusable. Sign the user
      // out so AppShell redirects to /login instead of looping on the
      // "Restoring your session" card forever.
      await client.auth.signOut();
      return null;
    }

    async function initialize() {
      const {
        data: { session },
      } = await client.auth.getSession();

      if (!mounted) return;
      setSession(session);
      setProfile(session?.user ? await resolveProfile(session.user.id) : null);
      setLoading(false);
    }

    initialize();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setProfile(
        nextSession?.user ? await resolveProfile(nextSession.user.id) : null,
      );
      setLoading(false);
    });

    async function refreshFromStorage() {
      const {
        data: { session: latest },
      } = await client.auth.getSession();
      if (!mounted) return;
      setSession(latest);
      setProfile(latest?.user ? await loadProfile(latest.user.id) : null);
    }

    function onVisibility() {
      if (document.visibilityState === "visible") void refreshFromStorage();
    }
    function onFocus() {
      void refreshFromStorage();
    }
    function onStorage(event: StorageEvent) {
      if (event.key && event.key.includes("supabase")) void refreshFromStorage();
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      loading,
      async signIn(email, password) {
        if (!supabase) {
          throw new Error("Supabase auth is not configured for this environment.");
        }
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user && !data.user.email_confirmed_at) {
          await supabase.auth.signOut();
          throw new Error("Please verify your email before signing in.");
        }
      },
      async signUp(input) {
        if (!supabase) {
          throw new Error("Supabase auth is not configured for this environment.");
        }
        const emailRedirectTo =
          typeof window === "undefined"
            ? undefined
            : `${window.location.origin.replace(/\/$/, "")}/login`;
        const { data, error } = await supabase.auth.signUp({
          email: input.email,
          password: input.password,
          options: {
            emailRedirectTo,
            data: {
              username: input.username,
              display_name: input.displayName,
              role: input.role,
            },
          },
        });
        if (error) throw error;

        if (data.session?.user) {
          await supabase.auth.signOut();
          setSession(null);
          setProfile(null);
          setLoading(false);
        }

        return {
          email: input.email,
          requiresEmailConfirmation: true,
          role: input.role,
        };
      },
      async signOut() {
        if (!supabase) {
          throw new Error("Supabase auth is not configured for this environment.");
        }
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
    }),
    [loading, profile, session, supabase],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuthContext must be used within AuthProvider.");
  return value;
}
