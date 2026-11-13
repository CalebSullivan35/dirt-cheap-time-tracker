import { ClerkProvider, OrganizationSwitcher, Show, UserButton } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <TRPCReactProvider>
            <header className="border-b border-border">
              <nav className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
                <Link href="/" className="font-semibold tracking-tight">
                  DirtCheap<span className="text-accent">TimeTracker</span>
                </Link>
                <Suspense>
                  <Show when="signed-in">
                    <Link href="/" className="text-sm text-muted hover:text-foreground">
                      Timer
                    </Link>
                    <Link href="/projects" className="text-sm text-muted hover:text-foreground">
                      Projects
                    </Link>
                    <div className="ml-auto flex items-center gap-3">
                      <OrganizationSwitcher
                        hidePersonal={false}
                        afterSelectOrganizationUrl="/"
                        afterCreateOrganizationUrl="/"
                      />
                      <UserButton />
                    </div>
                  </Show>
                </Suspense>
              </nav>
            </header>
            <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
              {/* Everything below depends on the signed-in user, so it streams per request. */}
              <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>{children}</Suspense>
            </main>
          </TRPCReactProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
