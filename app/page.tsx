"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Users, MapPin } from "lucide-react";
import { DestinationAutocomplete } from "@/components/destination-autocomplete";
import { useCreateTrip, type DestinationOption } from "@/hooks/use-create-trip";
import { format } from "date-fns";

export default function HomePage() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState<"itinerary" | "explore" | "expenses" | "tripmates" | "checklists">("itinerary");
  
  // Hero search form state
  const [destination, setDestination] = useState<DestinationOption | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelersCount, setTravelersCount] = useState(2);
  const [searchError, setSearchError] = useState<string | null>(null);

  const { createTrip, loading: creatingTrip } = useCreateTrip();

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

  const handleStartPlanning = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);

    if (!destination) {
      setSearchError("Please select a destination");
      return;
    }

    if (!startDate || !endDate) {
      setSearchError("Please select both start and end dates");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setSearchError("End date must be after start date");
      return;
    }

    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (!user?.id) {
      setSearchError("Please sign in to create a trip");
      return;
    }

    try {
      await createTrip({
        destination,
        startDate,
        endDate,
        travelersCount,
      });
    } catch (error: any) {
      setSearchError(error.message || "Failed to create trip. Please try again.");
    }
  };

  const handleDestinationClick = (destName: string) => {
    // Pre-fill destination in search
    // For now, we'll just scroll to hero and focus the input
    const heroSection = document.getElementById("hero");
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const currentYear = new Date().getFullYear();

  const navItems = [
    { label: "Travel Planner", href: "/" },
    { label: "Hotels", href: "/hotels" },
    { label: "Flights", href: "/flights" },
  ];

  const formatDateRange = () => {
    if (!startDate || !endDate) return "Select dates";
    try {
      const start = format(new Date(startDate), "MMM d");
      const end = format(new Date(endDate), "MMM d, yyyy");
      return `${start} – ${end}`;
    } catch {
      return "Select dates";
    }
  };

  const destinations = [
    {
      name: "London",
      image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
      attractions: "Big Ben · Tower Bridge · British Museum",
    },
    {
      name: "Amsterdam",
      image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80",
      attractions: "Van Gogh Museum · Anne Frank House · Canal Cruise",
    },
    {
      name: "Barcelona",
      image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80",
      attractions: "Sagrada Familia · Park Güell · La Rambla",
    },
    {
      name: "Paris",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
      attractions: "Eiffel Tower · Louvre · Notre-Dame",
    },
    {
      name: "Berlin",
      image: "https://images.unsplash.com/photo-1587330979470-3585acf853aa?w=800&q=80",
      attractions: "Brandenburg Gate · Museum Island · Berlin Wall",
    },
    {
      name: "Rome",
      image: "https://images.unsplash.com/photo-1529260830199-42c24126f198?w=800&q=80",
      attractions: "Colosseum · Vatican · Trevi Fountain",
    },
    {
      name: "New York",
      image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
      attractions: "Statue of Liberty · Central Park · Times Square",
    },
    {
      name: "Tokyo",
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
      attractions: "Shibuya Crossing · Senso-ji · Tokyo Skytree",
    },
  ];

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
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo */}
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:opacity-80 transition-opacity">
              MindTrip
            </Link>
            
            {/* Center: Nav Links */}
            <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            {/* Right: Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="text-slate-600">
                  Log in
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                  Sign up
                </Button>
              </Link>
            </div>
            
            {/* Mobile: Simple menu */}
            <div className="md:hidden">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="py-16 sm:py-24 relative overflow-hidden bg-gradient-to-br from-sky-50 via-emerald-50 to-amber-50">
        {/* Decorative map blobs */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-white/50 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/30 rounded-full blur-3xl opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Slogan pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-orange-700 border border-orange-100">
              <span className="px-2 py-0.5 bg-orange-100 rounded-full text-xs font-bold">NEW</span>
              <span>Plan every part of your trip in one place</span>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleStartPlanning} className="bg-white shadow-xl rounded-2xl p-4 md:p-6 flex flex-col gap-4 md:flex-row md:items-center">
              {/* Destination */}
              <div className="flex-1 min-w-0">
                <Label htmlFor="destination" className="text-xs font-medium text-gray-500 mb-1 block">
                  Destination
                </Label>
                <DestinationAutocomplete
                  value={destination}
                  onChange={setDestination}
                  className="w-full"
                  placeholder="Where do you want to go?"
                />
              </div>
              
              {/* Divider */}
              <div className="hidden md:block w-px h-12 bg-gray-200"></div>
              
              {/* Dates */}
              <div className="flex-1 min-w-0">
                <Label htmlFor="dates" className="text-xs font-medium text-gray-500 mb-1 block">
                  Dates
                </Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    id="start_date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1 rounded-lg"
                    required
                  />
                  <Input
                    id="end_date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="flex-1 rounded-lg"
                    required
                  />
                </div>
              </div>
              
              {/* Divider */}
              <div className="hidden md:block w-px h-12 bg-gray-200"></div>
              
              {/* Travelers */}
              <div className="flex-1 min-w-0">
                <Label htmlFor="travelers" className="text-xs font-medium text-gray-500 mb-1 block">
                  Travelers
                </Label>
                <Input
                  id="travelers"
                  type="number"
                  min="1"
                  value={travelersCount}
                  onChange={(e) => setTravelersCount(Number(e.target.value))}
                  className="rounded-lg"
                />
              </div>
              
              {/* CTA Button */}
              <div className="flex-shrink-0">
                <Button
                  type="submit"
                  size="lg"
                  disabled={creatingTrip}
                  className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white h-12 px-8"
                >
                  {creatingTrip ? "Creating..." : "Start planning"}
                </Button>
              </div>
            </form>

            {searchError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 max-w-md mx-auto">
                {searchError}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why travelers love Mindtrip Section */}
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
            <Card className="rounded-2xl border shadow-sm bg-white/80 hover:translate-y-[-2px] hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center mb-3 text-2xl">
                  📍
                </div>
                <CardTitle className="text-xl font-bold">Plan your whole trip on one map</CardTitle>
                <CardDescription className="text-base mt-2">
                  See days, places, and routes together so you never double-book or lose time crossing the city.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="rounded-2xl border shadow-sm bg-white/80 hover:translate-y-[-2px] hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3 text-2xl">
                  ✨
                </div>
                <CardTitle className="text-xl font-bold">Discover places that match your style</CardTitle>
                <CardDescription className="text-base mt-2">
                  Use smart filters and AI to surface museums, food, nightlife, or quiet neighborhoods that fit your vibe.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="rounded-2xl border shadow-sm bg-white/80 hover:translate-y-[-2px] hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-3 text-2xl">
                  💸
                </div>
                <CardTitle className="text-xl font-bold">Travel with zero money drama</CardTitle>
                <CardDescription className="text-base mt-2">
                  Track expenses and see who owes what in seconds.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="rounded-2xl border shadow-sm bg-white/80 hover:translate-y-[-2px] hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3 text-2xl">
                  👥
                </div>
                <CardTitle className="text-xl font-bold">Keep everyone in sync</CardTitle>
                <CardDescription className="text-base mt-2">
                  Share a link, invite tripmates, and collaborate live on the same itinerary.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Destination Inspiration Section */}
      <section id="destinations" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Need ideas? Get inspired by popular destinations
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tap into curated city ideas to start your next adventure in seconds.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((dest, index) => (
              <Link
                key={dest.name}
                href={`/?destination=${encodeURIComponent(dest.name)}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleDestinationClick(dest.name);
                  const heroSection = document.getElementById("hero");
                  if (heroSection) {
                    heroSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="group relative rounded-3xl overflow-hidden aspect-[4/5] md:aspect-[4/5] cursor-pointer"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${dest.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{dest.name}</h3>
                    <p className="text-sm text-white/80">{dest.attractions}</p>
                  </div>
                </div>
              </Link>
            ))}
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
