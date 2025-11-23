"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, DollarSign, MapPin, CheckSquare, Play } from "lucide-react";

export default function HomePage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState<"itinerary" | "explore" | "expenses" | "tripmates" | "checklists">("itinerary");

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

  const renderFeaturePreview = () => {
    switch (activeFeature) {
      case "itinerary":
        return (
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-medium">Day 1</div>
                <div className="px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-xs">Day 2</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="h-3 w-3 text-orange-500" />
                  <span className="text-gray-600">10:00 AM</span>
                  <span className="font-medium text-gray-800">Prado Museum</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="h-3 w-3 text-orange-500" />
                  <span className="text-gray-600">2:00 PM</span>
                  <span className="font-medium text-gray-800">Lunch at Mercado</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="h-3 w-3 text-orange-500" />
                  <span className="text-gray-600">7:00 PM</span>
                  <span className="font-medium text-gray-800">Flamenco Show</span>
                </div>
              </div>
            </div>
            <div className="bg-sky-50 rounded-lg border-2 border-dashed border-sky-200 p-2 relative">
              <div className="absolute top-2 left-2 w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="absolute top-6 left-4 w-2 h-2 bg-emerald-500 rounded-full"></div>
              <div className="absolute bottom-4 right-3 w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-0.5 bg-orange-400 rotate-45"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-0.5 bg-orange-400 -rotate-45"></div>
            </div>
          </div>
        );
      case "explore":
        return (
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="space-y-3">
              <div className="px-3 py-2 bg-white border border-sky-200 rounded-lg text-xs">
                Search museums, cafes, neighborhoods...
              </div>
              <div className="space-y-2">
                <div className="p-2 bg-emerald-50 rounded border border-emerald-100">
                  <div className="font-medium text-xs text-gray-800">Museo del Prado</div>
                  <div className="text-xs text-gray-600">Art museum · 0.5 mi</div>
                </div>
                <div className="p-2 bg-orange-50 rounded border border-orange-100">
                  <div className="font-medium text-xs text-gray-800">Café de Oriente</div>
                  <div className="text-xs text-gray-600">Cafe · 0.3 mi</div>
                </div>
                <div className="p-2 bg-sky-50 rounded border border-sky-100">
                  <div className="font-medium text-xs text-gray-800">Retiro Park</div>
                  <div className="text-xs text-gray-600">Park · 1.2 mi</div>
                </div>
              </div>
            </div>
            <div className="bg-sky-50 rounded-lg border-2 border-dashed border-sky-200 p-2 relative">
              <div className="absolute top-2 left-2 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></div>
              <div className="absolute top-2 left-2 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              <div className="absolute top-6 left-6 w-2 h-2 bg-emerald-500 rounded-full"></div>
              <div className="absolute bottom-4 right-3 w-2 h-2 bg-sky-500 rounded-full"></div>
              <div className="absolute top-4 right-4 w-2 h-2 bg-orange-500 rounded-full"></div>
            </div>
          </div>
        );
      case "expenses":
        return (
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="space-y-3">
              <div className="text-2xl font-bold text-gray-800">€1,240</div>
              <div className="text-xs text-gray-600">Total spent</div>
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-700">Hotel</span>
                  <span className="font-medium text-gray-800">€450</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-700">Dinner</span>
                  <span className="font-medium text-gray-800">€120</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-700">Tickets</span>
                  <span className="font-medium text-gray-800">€80</span>
                </div>
              </div>
            </div>
            <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-3 space-y-2">
              <div className="text-xs font-medium text-gray-700 mb-2">Balance</div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-400 rounded-full"></div>
                <div className="flex-1 text-xs">
                  <div className="font-medium text-gray-800">You</div>
                  <div className="text-emerald-600">+€320</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-sky-400 rounded-full"></div>
                <div className="flex-1 text-xs">
                  <div className="font-medium text-gray-800">Sarah</div>
                  <div className="text-orange-600">-€320</div>
                </div>
              </div>
            </div>
          </div>
        );
      case "tripmates":
        return (
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-6 h-6 bg-orange-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">You</div>
                    <div className="text-gray-600 text-xs">Owner</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-6 h-6 bg-sky-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">Sarah</div>
                    <div className="text-gray-600 text-xs">Editor</div>
                  </div>
                </div>
              </div>
              <button className="w-full px-3 py-1.5 bg-sky-100 text-sky-700 rounded-lg text-xs font-medium hover:bg-sky-200 transition-colors">
                + Invite
              </button>
            </div>
            <div className="bg-sky-50 rounded-lg border border-sky-200 p-3 flex items-center justify-center">
              <div className="relative">
                <div className="w-10 h-10 bg-orange-400 rounded-full border-2 border-white"></div>
                <div className="absolute top-0 right-0 w-10 h-10 bg-sky-400 rounded-full border-2 border-white -mr-2"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Users className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
            </div>
          </div>
        );
      case "checklists":
        return (
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="space-y-3">
              <div className="text-xs font-medium text-gray-700 mb-2">Packing</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 border-2 border-emerald-500 rounded bg-emerald-50"></div>
                  <span className="text-gray-700">Passport</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                  <span className="text-gray-700">Camera</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                  <span className="text-gray-700">Chargers</span>
                </div>
              </div>
              <div className="text-xs font-medium text-gray-700 mb-2 pt-2">To-do</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 border-2 border-emerald-500 rounded bg-emerald-50"></div>
                  <span className="text-gray-700">Book flights</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                  <span className="text-gray-700">Get travel insurance</span>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg border border-orange-200 p-4 flex items-center justify-center">
              <div className="text-4xl">🧳</div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-sky-50 border-b border-sky-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-3xl font-bold text-gray-900 hover:opacity-80 transition-opacity">
              Mindtrip
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => scrollToSection("benefits")}
                className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                How it works
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                Pricing
              </button>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="text-gray-700">
                  Log in
                </Button>
              </Link>
              <Button onClick={handleCTAClick} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                Open app
              </Button>
            </div>
            <div className="md:hidden">
              <Button onClick={handleCTAClick} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                Open app
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="py-20 sm:py-32 bg-sky-50 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-emerald-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-100 rounded-full opacity-20 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                <span>NEW</span>
                <span>·</span>
                <span>Plan every part of your trip in one place</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
                One app for all your travel planning
              </h1>
              <p className="text-xl text-gray-600">
                Create itineraries, discover places, and manage bookings with friends in one tool. Everything you need for your next adventure, organized and collaborative.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleCTAClick} 
                  size="lg" 
                  className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Start planning
                </Button>
                <Button
                  onClick={() => scrollToSection("feature-gallery")}
                  variant="ghost"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Watch how it works
                </Button>
              </div>
            </div>

            {/* Right Column - Video Preview */}
            <div className="lg:pl-8">
              <div 
                onClick={() => scrollToSection("feature-gallery")}
                className="cursor-pointer group"
              >
                <Card className="rounded-3xl shadow-xl border-0 overflow-hidden bg-gradient-to-br from-sky-200 via-emerald-200 to-orange-200 aspect-video relative">
                  {/* Browser frame */}
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm m-4 rounded-2xl shadow-lg flex flex-col">
                    {/* Browser top bar */}
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="flex-1 text-center text-xs text-gray-600 font-medium">Mindtrip preview</div>
                    </div>
                    
                    {/* Browser content - mini app mock */}
                    <div className="flex-1 p-4 grid grid-cols-2 gap-3">
                      {/* Left panel - trip rows */}
                      <div className="space-y-2">
                        <div className="h-12 bg-gray-100 rounded-lg flex items-center gap-2 px-2">
                          <Calendar className="h-4 w-4 text-orange-500" />
                          <div className="flex-1">
                            <div className="h-2 bg-gray-300 rounded w-3/4 mb-1"></div>
                            <div className="h-1.5 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="h-12 bg-gray-100 rounded-lg flex items-center gap-2 px-2">
                          <Calendar className="h-4 w-4 text-emerald-500" />
                          <div className="flex-1">
                            <div className="h-2 bg-gray-300 rounded w-2/3 mb-1"></div>
                            <div className="h-1.5 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="h-12 bg-gray-100 rounded-lg flex items-center gap-2 px-2">
                          <Calendar className="h-4 w-4 text-sky-500" />
                          <div className="flex-1">
                            <div className="h-2 bg-gray-300 rounded w-4/5 mb-1"></div>
                            <div className="h-1.5 bg-gray-200 rounded w-3/5"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right panel - map placeholder */}
                      <div className="bg-sky-50 rounded-lg border-2 border-dashed border-sky-300 relative">
                        <div className="absolute top-2 left-2 w-2 h-2 bg-orange-500 rounded-full"></div>
                        <div className="absolute top-4 right-3 w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <div className="absolute bottom-3 left-1/2 w-2 h-2 bg-sky-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="h-10 w-10 text-orange-500 ml-1" fill="currentColor" />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why travelers love Mindtrip
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Reduce planning stress and keep everything in one place, so you can focus on enjoying your trip.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="rounded-3xl shadow-md ring-1 ring-sky-100 border-0">
              <CardHeader>
                <div className="text-3xl mb-3">🗺️</div>
                <CardTitle className="text-xl">Plan your whole trip on one map</CardTitle>
                <CardDescription className="text-base">
                  You see days, places, and routes together, so you never double-book or lose time crossing the city.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="rounded-3xl shadow-md ring-1 ring-sky-100 border-0">
              <CardHeader>
                <div className="text-3xl mb-3">✨</div>
                <CardTitle className="text-xl">Discover places that match your style</CardTitle>
                <CardDescription className="text-base">
                  Use interests and filters to surface museums, food, nightlife, or quiet neighborhoods that fit your vibe.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="rounded-3xl shadow-md ring-1 ring-sky-100 border-0">
              <CardHeader>
                <div className="text-3xl mb-3">💸</div>
                <CardTitle className="text-xl">Travel with zero money drama</CardTitle>
                <CardDescription className="text-base">
                  Log expenses as you go and see who owes what in seconds.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="rounded-3xl shadow-md ring-1 ring-sky-100 border-0">
              <CardHeader>
                <div className="text-3xl mb-3">👥</div>
                <CardTitle className="text-xl">Keep everyone in sync</CardTitle>
                <CardDescription className="text-base">
                  Share a link, invite tripmates, and collaborate live on the same itinerary.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Feature Gallery */}
      <section id="feature-gallery" className="py-20 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              See Mindtrip in action
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Preview the core workflows that make trip planning effortless.
            </p>
          </div>

          {/* Feature tabs */}
          <div className="flex gap-3 mb-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
            <button
              onClick={() => setActiveFeature("itinerary")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap snap-start transition-all ${
                activeFeature === "itinerary"
                  ? "bg-white shadow-md border border-sky-200 text-gray-900"
                  : "bg-sky-100 hover:bg-sky-200 text-gray-700"
              }`}
            >
              <span>🗓️</span>
              <span>Itinerary</span>
            </button>
            <button
              onClick={() => setActiveFeature("explore")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap snap-start transition-all ${
                activeFeature === "explore"
                  ? "bg-white shadow-md border border-sky-200 text-gray-900"
                  : "bg-sky-100 hover:bg-sky-200 text-gray-700"
              }`}
            >
              <span>📍</span>
              <span>Explore</span>
            </button>
            <button
              onClick={() => setActiveFeature("expenses")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap snap-start transition-all ${
                activeFeature === "expenses"
                  ? "bg-white shadow-md border border-sky-200 text-gray-900"
                  : "bg-sky-100 hover:bg-sky-200 text-gray-700"
              }`}
            >
              <span>💰</span>
              <span>Expenses</span>
            </button>
            <button
              onClick={() => setActiveFeature("tripmates")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap snap-start transition-all ${
                activeFeature === "tripmates"
                  ? "bg-white shadow-md border border-sky-200 text-gray-900"
                  : "bg-sky-100 hover:bg-sky-200 text-gray-700"
              }`}
            >
              <span>👥</span>
              <span>Tripmates</span>
            </button>
            <button
              onClick={() => setActiveFeature("checklists")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap snap-start transition-all ${
                activeFeature === "checklists"
                  ? "bg-white shadow-md border border-sky-200 text-gray-900"
                  : "bg-sky-100 hover:bg-sky-200 text-gray-700"
              }`}
            >
              <span>✅</span>
              <span>Checklists</span>
            </button>
          </div>

          {/* Feature preview card */}
          <Card className="rounded-3xl shadow-xl border-0 bg-white p-6 min-h-[300px]">
            <CardContent className="p-0">
              {renderFeaturePreview()}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">How Mindtrip works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="rounded-3xl shadow-md ring-1 ring-sky-100 border-0">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Create your trip</CardTitle>
                <CardDescription className="text-base">
                  Choose dates, destination, budget, and interests. Set up your trip in minutes and invite your friends.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="rounded-3xl shadow-md ring-1 ring-sky-100 border-0">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle className="text-xl">Discover and save places</CardTitle>
                <CardDescription className="text-base">
                  Explore museums, restaurants, nightlife, and attractions. Add them to your itinerary with one click.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="rounded-3xl shadow-md ring-1 ring-sky-100 border-0">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-sky-600" />
                </div>
                <CardTitle className="text-xl">Travel and split costs</CardTitle>
                <CardDescription className="text-base">
                  Track expenses with friends and see who owes what. Keep everything balanced and transparent.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-emerald-50 to-sky-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">Mindtrip is in early access</h2>
          <p className="text-xl text-gray-600 mb-8">
            Use it for free while we build the full version.
          </p>
          <Button 
            onClick={handleCTAClick} 
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Start planning for free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sky-900 text-sky-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              © {currentYear} Mindtrip. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm hover:text-sky-200 transition-colors">
                Contact
              </Link>
              <Link href="#" className="text-sm hover:text-sky-200 transition-colors">
                Twitter
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
