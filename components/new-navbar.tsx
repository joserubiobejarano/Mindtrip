"use client";

import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function NewNavbar() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const handleCTAClick = () => {
    if (isSignedIn) {
      router.push("/trips");
    } else {
      router.push("/sign-in");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full py-4 px-6 md:px-12 bg-background/80 backdrop-blur-sm border-b border-border/40">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/icon.svg" 
            alt="Kruno" 
            width={40}
            height={40}
            priority
            className="w-10 h-10"
          />
          <span className="font-display text-xl font-semibold">Kruno</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="font-mono text-xs tracking-wider uppercase hover:text-primary transition-colors"
          >
            Travel Planning
          </Link>
          <Link
            href="/hotels"
            className="font-mono text-xs tracking-wider uppercase hover:text-primary transition-colors"
          >
            Hotels
          </Link>
          <Link
            href="/flights"
            className="font-mono text-xs tracking-wider uppercase hover:text-primary transition-colors"
          >
            Flights
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <SignedOut>
            <Link
              href="/sign-in"
              className="font-mono text-xs tracking-wider uppercase hover:text-primary transition-colors hidden sm:block"
            >
              Sign In
            </Link>
            <Button
              onClick={handleCTAClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs tracking-wider uppercase rounded-full px-6"
            >
              Get Started
            </Button>
          </SignedOut>
          <SignedIn>
            <Link href="/trips">
              <Button variant="ghost" className="font-mono text-xs tracking-wider uppercase hidden sm:block">
                My Trips
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

