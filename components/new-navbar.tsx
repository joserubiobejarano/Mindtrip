"use client";

import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";

export function NewNavbar() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { language, setLanguage, t } = useLanguage();

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
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="font-mono text-xs tracking-wider uppercase hover:text-primary transition-colors"
          >
            {t('nav_planning')}
          </Link>
          <Link
            href="/hotels"
            className="font-mono text-xs tracking-wider uppercase hover:text-primary transition-colors"
          >
            {t('nav_hotels')}
          </Link>
          <Link
            href="/flights"
            className="font-mono text-xs tracking-wider uppercase hover:text-primary transition-colors"
          >
            {t('nav_flights')}
          </Link>
        </div>

        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <MenuIcon className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 pr-0">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Image src="/icon.svg" alt="Kruno" width={32} height={32} />
              <span className="text-2xl font-bold" style={{ fontFamily: "'Patrick Hand', cursive" }}>Kruno</span>
            </Link>
            <nav className="flex flex-col gap-4 text-lg">
              <Link
                href="/"
                className="font-mono uppercase hover:text-primary transition-colors py-2"
              >
                {t('nav_planning')}
              </Link>
              <Link
                href="/hotels"
                className="font-mono uppercase hover:text-primary transition-colors py-2"
              >
                {t('nav_hotels')}
              </Link>
              <Link
                href="/flights"
                className="font-mono uppercase hover:text-primary transition-colors py-2"
              >
                {t('nav_flights')}
              </Link>
              <SignedIn>
                <Link
                  href="/trips"
                  className="font-mono uppercase hover:text-primary transition-colors py-2"
                >
                  {t('nav_trips')}
                </Link>
              </SignedIn>
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <div className="flex items-center bg-secondary rounded-full p-1 mr-2">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-full text-[10px] font-mono transition-colors ${
                language === 'en' 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('es')}
              className={`px-2 py-1 rounded-full text-[10px] font-mono transition-colors ${
                language === 'es' 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ES
            </button>
          </div>

          <SignedOut>
            <Link
              href="/sign-in"
              className="font-mono text-xs tracking-wider uppercase hover:text-primary transition-colors hidden sm:block"
            >
              {t('nav_sign_in')}
            </Link>
            <Button
              onClick={handleCTAClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs tracking-wider uppercase rounded-full px-6"
            >
              {t('nav_get_started')}
            </Button>
          </SignedOut>
          <SignedIn>
            <Link href="/trips">
              <Button variant="ghost" className="font-mono text-xs tracking-wider uppercase hidden sm:block">
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

