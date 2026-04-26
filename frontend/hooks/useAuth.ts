"use client";

import { useMemo } from "react";
import { useAuthContext } from "@/components/providers/auth-provider";

export function useAuth() {
  const auth = useAuthContext();

  return useMemo(
    () => ({
      ...auth,
      isAuthenticated: Boolean(auth.session?.user),
      role: auth.profile?.role ?? null,
      displayName:
        auth.profile?.display_name ??
        auth.session?.user.email?.split("@")[0] ??
        "Guest",
    }),
    [auth],
  );
}
