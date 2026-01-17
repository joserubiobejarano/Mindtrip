"use client";

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { CircleUser } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export function NewNavbar() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full py-4 px-6 md:px-12 bg-background/80 backdrop-blur-sm border-b border-border/40">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo size="md" />
        </Link>

        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton forceRedirectUrl="/">
              <Button variant="ghost" className="font-mono text-xs tracking-wider uppercase">
                {t('nav_sign_in')}
              </Button>
            </SignInButton>
            <SignUpButton forceRedirectUrl="/">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs tracking-wider uppercase rounded-full px-6">
                {t('nav_get_started')}
              </Button>
            </SignUpButton>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-muted-foreground">
              <CircleUser className="h-5 w-5" />
            </div>
          </SignedOut>
          <SignedIn>
            <Link href="/trips" className="font-mono text-xs tracking-wider uppercase hover:text-primary transition-colors">
              <Button variant="ghost" className="font-mono text-xs tracking-wider uppercase">
                {t('nav_trips')}
              </Button>
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}

