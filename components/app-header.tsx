"use client";

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/trips" className="text-xl font-bold">
          Kruno
        </Link>
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
            <Link href="/trips">
              <Button variant="ghost">My trips</Button>
            </Link>
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

