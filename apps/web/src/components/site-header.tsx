import { OrganizationSwitcher, Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "./ui/button";
import { Logo } from "./logo";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-4xl items-center gap-3 px-4">
        <Logo />
        <Suspense>
          <Show when="signed-in">
            <NavLinks />
          </Show>
        </Suspense>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Suspense>
            <Show when="signed-in">
              <div className="hidden sm:block">
                <OrganizationSwitcher
                  hidePersonal={false}
                  afterSelectOrganizationUrl="/"
                  afterCreateOrganizationUrl="/"
                />
              </div>
              <UserButton />
            </Show>
            <Show when="signed-out">
              <Button asChild size="sm" variant="ghost">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </Show>
          </Suspense>
        </div>
      </div>
    </header>
  );
}
