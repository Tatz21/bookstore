"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "./CartProvider";
import { ThemeProvider } from "./ThemeProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <CartProvider>{children}</CartProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
