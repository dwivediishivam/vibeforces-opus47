"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/providers/auth-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider forcedTheme="dark" attribute="class">
      <TooltipProvider>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1e293b",
                color: "#f1f5f9",
                border: "1px solid #334155",
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
              },
            }}
          />
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
