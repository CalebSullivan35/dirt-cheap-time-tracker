import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { TRPCReactProvider } from "@/trpc/react";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DirtCheapTimeTracker",
  description: "Track time on projects, solo or with your team.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // next-themes sets the theme class on <html> before hydration.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Providers>
          {/* Clerk's shadcn theme reads our CSS variables, so it follows light/dark and the accent. */}
          <ClerkProvider appearance={{ theme: shadcn }}>
            <TRPCReactProvider>
              <SiteHeader />
              <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
                {/* Everything below depends on the signed-in user, so it streams per request. */}
                <Suspense fallback={null}>{children}</Suspense>
              </main>
            </TRPCReactProvider>
          </ClerkProvider>
        </Providers>
      </body>
    </html>
  );
}
