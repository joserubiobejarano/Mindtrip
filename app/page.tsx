"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Users, DollarSign, Route, Compass, Wallet } from "lucide-react";

export default function HomePage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.replace("/trips");
    }
  }, [isSignedIn, router]);

  const handleCTAClick = () => {
    if (isSignedIn) {
      router.push("/trips");
    } else {
      router.push("/sign-in");
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-foreground hover:opacity-80 transition-opacity">
              Mindtrip
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => scrollToSection("features")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                How it works
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </button>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Button onClick={handleCTAClick} size="sm">
                Open app
              </Button>
            </div>
            <div className="md:hidden">
              <Button onClick={handleCTAClick} size="sm">
                Open app
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                Plan smarter trips with your friends.
              </h1>
              <p className="text-xl text-muted-foreground">
                Create collaborative itineraries, discover amazing places, and split expenses seamlessly—all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleCTAClick} size="lg" className="w-full sm:w-auto">
                  Start planning
                </Button>
                <Button
                  onClick={() => scrollToSection("how-it-works")}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  See how it works
                </Button>
              </div>
            </div>
            <div className="lg:pl-8">
              <Card className="rounded-2xl shadow-lg border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Trip to Madrid</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span className="text-muted-foreground">10:00 AM</span>
                      <span className="font-medium">Prado Museum</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span className="text-muted-foreground">2:00 PM</span>
                      <span className="font-medium">Tapas at Mercado San Miguel</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span className="text-muted-foreground">7:00 PM</span>
                      <span className="font-medium">Flamenco Show</span>
                    </div>
                  </div>
                  <div className="flex gap-4 pt-2">
                    <div className="flex-1 h-32 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 rounded-lg"></div>
                    <div className="flex-1 h-32 bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 rounded-lg"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">How Mindtrip works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="rounded-2xl">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Create your trip</CardTitle>
                <CardDescription>
                  Choose dates, destination, budget, and interests. Set up your trip in minutes and invite your friends.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Compass className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Discover & save places</CardTitle>
                <CardDescription>
                  Explore museums, restaurants, nightlife, and attractions. Add them to your itinerary with one click.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Travel & split costs</CardTitle>
                <CardDescription>
                  Track expenses with friends and see who owes what. Keep everything balanced and transparent.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Everything in one place</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Route className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Itinerary + live map</CardTitle>
                <CardDescription>
                  Build day-by-day plans and see everything on an interactive map. Never miss a spot or get lost.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Explore & saved places</CardTitle>
                <CardDescription>
                  Discover new places by category, save your favorites, and add them to your itinerary instantly.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Tripmates & collaboration</CardTitle>
                <CardDescription>
                  Invite friends to your trip, collaborate on planning, and make decisions together in real-time.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Expenses & balance summary</CardTitle>
                <CardDescription>
                  Track all expenses, see who paid what, and automatically calculate who owes whom. Stay fair and organized.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Mindtrip is in early access</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Use it for free while we build the full version.
          </p>
          <Button onClick={handleCTAClick} size="lg">
            Start planning for free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Mindtrip. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
