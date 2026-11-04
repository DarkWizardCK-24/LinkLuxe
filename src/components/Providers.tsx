"use client";

import { MotionConfig } from "framer-motion";
import { Check, Info, TriangleAlert } from "lucide-react";
import { Toaster } from "sonner";
import { AuthProvider } from "./AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>{children}</AuthProvider>
      <Toaster
        position="top-center"
        offset={{ top: 64, bottom: 16 }}
        mobileOffset={{ top: 64, bottom: 16 }}
        icons={{
          success: <Check size={18} className="text-gold" aria-hidden="true" />,
          error: <TriangleAlert size={18} className="text-danger" aria-hidden="true" />,
          info: <Info size={18} className="text-rose" aria-hidden="true" />,
        }}
        toastOptions={{
          style: {
            background: "#1d1510",
            color: "#f6eee4",
            border: "1px solid rgba(232,190,122,0.35)",
            boxShadow: "0 18px 50px -18px rgba(0,0,0,0.9)",
          },
        }}
      />
    </MotionConfig>
  );
}
