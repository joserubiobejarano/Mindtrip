"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CircleUser } from "lucide-react";
import { Logo } from "@/components/ui/logo";

interface MarketingNavbarProps {
  isSignedIn?: boolean;
}

export function MarketingNavbar({ isSignedIn = false }: MarketingNavbarProps) {
  const pathname = usePathname();
  const basePath =
    pathname?.startsWith("/es") ? "/es" : pathname?.startsWith("/en") ? "/en" : "";
  const redirectTarget = basePath || "/";
  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(redirectTarget)}`;
  const signUpHref = `/sign-up?redirect_url=${encodeURIComponent(redirectTarget)}`;

  return (
    <header className="sticky top-0 z-50 w-full py-4 px-6 md:px-12 bg-background/80 backdrop-blur-sm border-b border-border/40">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href={basePath || "/"} className="flex items-center gap-2">
          <Logo size="md" />
        </Link>

        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <>
              <Link href="/trips" className="font-mono text-xs tracking-wider uppercase hover:text-primary transition-colors">
                <Button variant="ghost" className="font-mono text-xs tracking-wider uppercase">
                  My Trips
                </Button>
              </Link>
              <Link
                href="/settings"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-muted-foreground"
                aria-label="Account settings"
              >
                <CircleUser className="h-5 w-5" />
              </Link>
            </>
          ) : (
            <>
              <Link href={signInHref}>
                <Button variant="ghost" className="font-mono text-xs tracking-wider uppercase">
                  Sign in
                </Button>
              </Link>
              <Link href={signUpHref}>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs tracking-wider uppercase rounded-full px-6">
                  Get started
                </Button>
              </Link>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-muted-foreground">
                <CircleUser className="h-5 w-5" />
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
