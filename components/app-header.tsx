"use client";

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/ui/logo";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";

export function AppHeader() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
          </Link>
          <SignedIn>
            <Link href="/trips" className="text-sm text-muted-foreground hover:text-foreground">
              {t('nav_trips')}
            </Link>
          </SignedIn>
        </div>
        <div className="flex items-center gap-4">

          <SignedOut>
            <SignInButton forceRedirectUrl="/">
              <Button variant="ghost">{t('nav_sign_in')}</Button>
            </SignInButton>
            <SignUpButton forceRedirectUrl="/">
              <Button>{t('nav_get_started')}</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/settings">
              <Button variant="ghost" size="icon" title={t('nav_settings')}>
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

