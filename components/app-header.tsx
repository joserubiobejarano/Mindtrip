"use client";

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/brand/kruno.png" 
              alt="Kruno" 
              width={32}
              height={32}
              priority
            />
            <span className="text-xl font-bold">Kruno</span>
          </Link>
          <SignedIn>
            <Link href="/trips" className="text-sm text-muted-foreground hover:text-foreground">
              My trips
            </Link>
          </SignedIn>
        </div>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton forceRedirectUrl="/">
              <Button variant="ghost">Sign In</Button>
            </SignInButton>
            <SignUpButton forceRedirectUrl="/">
              <Button>Sign Up</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/settings">
              <Button variant="ghost" size="icon" title="Settings">
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

