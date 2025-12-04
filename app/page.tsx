"use client";

import { useAuth, useUser, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Globe2, 
  Menu,
  ChevronRight,
  Map,
  Calendar,
  Users,
  Sparkles,
  Compass
} from "lucide-react";
import { useCreateTrip, type DestinationOption } from "@/hooks/use-create-trip";
import { HeroSearch } from "@/components/hero-search";
import { FloatingShapes } from "@/components/floating-shapes";
import { WhyTravelersLove } from "@/components/why-travelers-love";
import { DestinationCard } from "@/components/destination-card";
import { FeatureCard } from "@/components/feature-card";
import { GetTheApp } from "@/components/get-the-app";
import { Newsletter } from "@/components/newsletter";
import { Footer } from "@/components/footer";

export default function HomePage() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  
  // Hero search form state
  const [destination, setDestination] = useState<DestinationOption | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelersCount, setTravelersCount] = useState(2);
  const [searchError, setSearchError] = useState<string | null>(null);

  const { createTrip, loading: creatingTrip } = useCreateTrip();

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
    // Scroll to hero section
    const heroSection = document.getElementById("hero");
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const destinations = [
    {
      image: "https://images.unsplash.com/photo-1570841964538-c0406b497337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb25kb24lMjBjaXR5c2NhcGUlMjB0aGFtZXN8ZW58MXx8fHwxNzY0MTA3ODA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      title: "London",
      attractions: ["Big Ben", "Tower Bridge", "British Museum"],
      gradient: "bg-blue-500"
    },
    {
      image: "https://images.unsplash.com/photo-1534203137048-137aa03c692e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbXN0ZXJkYW0lMjBjYW5hbCUyMGhvdXNlc3xlbnwxfHx8fDE3NjQwOTQ3MjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      title: "Amsterdam",
      attractions: ["Van Gogh Museum", "Anne Frank House", "Canal Cruise"],
      gradient: "bg-orange-500"
    },
    {
      image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXJjZWxvbmElMjBzYWdyYWRhJTIwZmFtaWxpYXxlbnwxfHx8fDE3NjQwNTU2NTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      title: "Barcelona",
      attractions: ["Sagrada Familia", "Park Güell", "La Rambla"],
      gradient: "bg-pink-500"
    },
    {
      image: "https://images.unsplash.com/photo-1431274172761-fca41d930114?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGVpZmZlbCUyMHRvd2VyfGVufDF8fHx8MTc2NDA3NTkwMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      title: "Paris",
      attractions: ["Eiffel Tower", "Louvre", "Notre-Dame"],
      gradient: "bg-purple-500"
    },
    {
      image: "https://images.unsplash.com/photo-1704471504038-5443d863e3a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZXJsaW4lMjBicmFuZGVuYnVyZyUyMGdhdGV8ZW58MXx8fHwxNzY0MDQ5MDk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      title: "Berlin",
      attractions: ["Brandenburg Gate", "Museum Island", "Berlin Wall"],
      gradient: "bg-green-500"
    },
    {
      image: "https://images.unsplash.com/photo-1552432552-06c0b0a94dda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21lJTIwY29sb3NzZXVtJTIwdmF0aWNhbnxlbnwxfHx8fDE3NjQxMDc4MDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      title: "Rome",
      attractions: ["Colosseum", "Vatican", "Trevi Fountain"],
      gradient: "bg-red-500"
    }
  ];

  const features = [
    {
      icon: Map,
      title: "Smart Itinerary",
      description: "AI-powered trip planning that creates the perfect itinerary based on your preferences",
      gradient: "bg-blue-400"
    },
    {
      icon: Calendar,
      title: "Flexible Booking",
      description: "Book with confidence with free cancellation and flexible date changes",
      gradient: "bg-purple-400"
    },
    {
      icon: Users,
      title: "Group Travel",
      description: "Plan and coordinate trips with friends and family all in one place",
      gradient: "bg-orange-400"
    },
    {
      icon: Sparkles,
      title: "Local Experiences",
      description: "Discover hidden gems and authentic experiences recommended by locals",
      gradient: "bg-green-400"
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fefbf6' }}>
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b-2 border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 py-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative">
                <Compass className="h-10 w-10 text-primary rotate-12" strokeWidth={2.5} />
                <div className="absolute inset-0 -z-10">
                  <Compass className="h-10 w-10 text-primary/20 -rotate-6" strokeWidth={2.5} />
                </div>
              </div>
              <span className="text-2xl text-primary">MindTrip</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-foreground hover:text-primary transition-colors relative group">
                Travel Planning
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all"></span>
              </Link>
              <Link href="/hotels" className="text-foreground hover:text-primary transition-colors relative group">
                Hotels
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all"></span>
              </Link>
              <Link href="/flights" className="text-foreground hover:text-primary transition-colors relative group">
                Flights
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all"></span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <SignedOut>
                <Link href="/sign-in">
                  <Button variant="ghost" className="hidden md:flex">Sign In</Button>
                </Link>
                <Button 
                  onClick={handleCTAClick}
                  className="bg-[#ff6b6b] hover:bg-[#ff6b6b]/90 text-white rounded-full px-6 shadow-lg transform hover:scale-105 transition-transform"
                >
                  Get Started
                </Button>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-2">
                  <Link href="/trips">
                    <Button variant="ghost" className="hidden md:flex">
                      My trips
                    </Button>
                  </Link>
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10"
                      }
                    }}
                  />
                </div>
              </SignedIn>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="size-6" />
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center overflow-hidden" style={{ backgroundColor: '#fefbf6' }}>
        {/* Subtle sketchbook-style background with minimal decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* Very subtle paper texture */}
          <div className="absolute inset-0 opacity-[0.02]">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="paper-texture" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="0.5" fill="currentColor" />
                  <circle cx="30" cy="25" r="0.5" fill="currentColor" />
                  <circle cx="50" cy="15" r="0.5" fill="currentColor" />
                  <circle cx="70" cy="30" r="0.5" fill="currentColor" />
                  <circle cx="90" cy="20" r="0.5" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#paper-texture)" />
            </svg>
          </div>
          
          {/* Minimal hand-drawn decorative elements - very subtle */}
          <svg className="absolute top-10 right-10 w-24 h-24 text-border opacity-30" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
          </svg>
          
          {/* Green blurred circles in bottom left */}
          <div className="absolute bottom-20 left-20 w-32 h-32 rounded-full bg-green-200/40 blur-2xl"></div>
          <div className="absolute bottom-32 left-32 w-40 h-40 rounded-full bg-green-300/30 blur-2xl"></div>
          <div className="absolute bottom-40 left-40 w-48 h-48 rounded-full bg-green-400/20 blur-2xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center w-full px-4 pt-16 pb-20">
          {/* Title from Figma */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="inline-block relative">
              <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-yellow-500 animate-pulse" />
              <h1 className="text-6xl md:text-7xl text-foreground mb-0 relative inline-block" style={{ fontFamily: "'Caveat', cursive" }}>
                your next Adventure awaits
                <svg className="absolute -bottom-2 left-0 w-full h-4" viewBox="0 0 400 12" preserveAspectRatio="none">
                  <path d="M0,6 Q100,2 200,6 T400,6" fill="none" stroke="#ff6b6b" strokeWidth="3" />
                </svg>
              </h1>
            </div>
          </motion.div>

          <HeroSearch
            destination={destination}
            onDestinationChange={setDestination}
            startDate={startDate}
            onStartDateChange={setStartDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
            travelersCount={travelersCount}
            onTravelersChange={setTravelersCount}
            onSubmit={handleStartPlanning}
            loading={creatingTrip}
          />

          {searchError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-sm text-destructive bg-destructive/10 border-2 border-destructive/20 rounded-lg p-3 max-w-md mx-auto"
            >
              {searchError}
            </motion.div>
          )}

          {/* Stats - Horizontal layout with solid colors and hover effects */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-row gap-6 max-w-2xl mx-auto mt-12 justify-center"
          >
            <div className="bg-[#fefbf6] rounded-3xl p-6 border-2 border-black shadow-lg transition-all cursor-pointer flex-1 max-w-xs hover:scale-110 hover:bg-green-50" style={{ transform: 'rotate(-2deg)' }}>
              <div className="text-4xl mb-2 text-green-600 font-bold">1M+</div>
              <div className="text-gray-700">Destinations</div>
            </div>
            <div className="bg-[#fefbf6] rounded-3xl p-6 border-2 border-black shadow-lg transition-all cursor-pointer flex-1 max-w-xs hover:scale-110 hover:bg-yellow-50" style={{ transform: 'rotate(2deg)' }}>
              <div className="text-4xl mb-2 font-bold flex items-center gap-2 justify-center">
                <span className="text-yellow-500">4.9</span><span className="text-yellow-500 text-2xl">★</span>
              </div>
              <div className="text-gray-700">User Rating</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Travelers Love */}
      <WhyTravelersLove />

      {/* Unique Experiences Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl mb-4 inline-block relative" style={{ fontFamily: "'Caveat', cursive" }}>
              Unique Experiences
              <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 300 8" preserveAspectRatio="none">
                <path d="M0,4 Q75,1 150,4 T300,4" fill="none" stroke="#4ecdc4" strokeWidth="2" />
              </svg>
            </h2>
            <p className="text-xl text-muted-foreground mt-4">Handpicked activities that make your trip unforgettable</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((dest, index) => (
              <DestinationCard 
                key={index} 
                {...dest} 
                index={index}
                onClick={() => handleDestinationClick(dest.title)}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button 
              onClick={handleCTAClick}
              className="px-8 py-3 border-2 border-primary text-primary rounded-full hover:bg-primary/10 transform hover:scale-105 transition-all relative group"
            >
              View All Destinations
              <ChevronRight className="ml-2 size-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Why Choose MindTrip */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl mb-4 text-foreground inline-block relative" style={{ fontFamily: "'Caveat', cursive" }}>
              Why Choose MindTrip?
              <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 300 8" preserveAspectRatio="none">
                <path d="M0,4 Q75,1 150,4 T300,4" fill="none" stroke="#ff6b6b" strokeWidth="2" />
              </svg>
            </h2>
            <p className="text-xl text-muted-foreground mt-4">Everything you need for the perfect journey</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4 overflow-hidden bg-background">
        <div className="absolute inset-0">
          {/* Decorative elements - subtle circles */}
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-border rounded-full opacity-20" style={{ transform: 'rotate(15deg)' }}></div>
          <div className="absolute bottom-20 right-20 w-16 h-16 border-2 border-border rounded-full opacity-20" style={{ transform: 'rotate(-10deg)' }}></div>
          <div className="absolute top-1/2 right-1/4 w-12 h-12 border-2 border-border rounded-full opacity-20"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-6xl mb-6 text-foreground inline-block relative" style={{ fontFamily: "'Caveat', cursive" }}>
              Ready to Start Your Adventure?
              <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 300 8" preserveAspectRatio="none">
                <path d="M0,4 Q75,1 150,4 T300,4" fill="none" stroke="#ff6b6b" strokeWidth="2" />
              </svg>
            </h2>
            <p className="text-xl mb-10 text-muted-foreground">
              Join millions of travelers who trust MindTrip to plan their perfect getaway
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleCTAClick}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 rounded-full text-lg shadow-lg transform hover:scale-105 transition-all"
              >
                Start Planning Now
              </Button>
              <Button 
                variant="outline" 
                onClick={() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })}
                className="border-2 border-border bg-card hover:bg-muted px-8 py-6 rounded-full text-lg"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Get The App */}
      <GetTheApp />

      {/* Newsletter */}
      <Newsletter />

      {/* Footer */}
      <Footer />
    </div>
  );
}
