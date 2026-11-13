"use client";

import { MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {/* Honors the OS "reduce motion" setting for every animation. */}
      <MotionConfig reducedMotion="user">
        <TooltipProvider>
          {children}
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
