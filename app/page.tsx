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
  Plane
} from "lucide-react";
import { useCreateTrip, type DestinationOption } from "@/hooks/use-create-trip";
import { HeroSearch } from "@/components/hero-search";
import { FloatingShapes } from "@/components/floating-shapes";
import { WhyTravelersLove } from "@/components/why-travelers-love";
import { DestinationCard } from "@/components/destination-card";
import { FeatureCard } from "@/components/feature-card";
import { GetTheApp } from "@/components/get-the-app";
import { Newsletter } from "@/components/newsletter";

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

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 bg-white border-b-4 border-black"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24 py-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-purple-500 p-2 rounded-xl border-2 border-black">
                <Globe2 className="size-6 text-white" />
              </div>
              <span className="text-2xl text-gray-800">MindTrip</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-700 hover:text-purple-600 transition-colors">Travel Planning</Link>
              <Link href="/hotels" className="text-gray-700 hover:text-purple-600 transition-colors">Hotels</Link>
              <Link href="/flights" className="text-gray-700 hover:text-purple-600 transition-colors">Flights</Link>
            </div>

            <div className="flex items-center gap-4">
              <SignedOut>
                <Link href="/sign-in">
                  <Button variant="ghost" className="hidden md:flex">Sign In</Button>
                </Link>
                <Button 
                  onClick={handleCTAClick}
                  className="bg-orange-500 hover:bg-orange-600 text-white border-2 border-black"
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
      <section id="hero" className="relative overflow-hidden pt-24 pb-32 px-4">
        <FloatingShapes />
        
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-8">
              <div className="bg-purple-500 text-white px-6 py-2 rounded-full inline-flex items-center gap-2 border-2 border-black">
                <span className="text-sm">Plan every part of your trip in one place</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl mb-12 text-gray-900">
              Your Next
              <br />
              Adventure
              <br />
              Starts Here.
            </h1>
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
              className="mt-4 text-sm text-red-600 bg-red-50 border-2 border-red-200 rounded-lg p-3 max-w-md mx-auto"
            >
              {searchError}
            </motion.div>
          )}

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 gap-8 max-w-2xl mx-auto mt-20"
          >
            <div className="bg-white rounded-2xl p-6 border-4 border-black" style={{ boxShadow: '6px 6px 0px rgba(0, 0, 0, 1)', transform: 'rotate(-2deg)' }}>
              <div className="text-4xl mb-2 text-purple-600">1M+</div>
              <div className="text-gray-600">Destinations</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border-4 border-black" style={{ boxShadow: '6px 6px 0px rgba(0, 0, 0, 1)', transform: 'rotate(2deg)' }}>
              <div className="text-4xl mb-2 text-orange-600">4.9★</div>
              <div className="text-gray-600">User Rating</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Travelers Love */}
      <WhyTravelersLove />

      {/* Popular Destinations */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl mb-4 text-gray-900">
              Need ideas?
            </h2>
            <p className="text-xl text-gray-600">Explore the world&apos;s most breathtaking locations</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-6 rounded-xl border-2 border-black"
            >
              View All Destinations
              <ChevronRight className="ml-2 size-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl mb-4 text-gray-900">
              Why Choose MindTrip?
            </h2>
            <p className="text-xl text-gray-600">Everything you need for the perfect journey</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4 overflow-hidden bg-orange-400">
        <div className="absolute inset-0">
          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 border-4 border-black rounded-full" style={{ transform: 'rotate(15deg)' }}></div>
          <div className="absolute bottom-20 right-20 w-16 h-16 bg-yellow-300 border-4 border-black" style={{ transform: 'rotate(-10deg)' }}></div>
          <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-pink-400 border-4 border-black rounded-full"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-6xl mb-6 text-gray-900">
              Ready to Start Your Adventure?
            </h2>
            <p className="text-xl mb-10 text-gray-800">
              Join millions of travelers who trust MindTrip to plan their perfect getaway
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleCTAClick}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 rounded-xl text-lg border-2 border-black"
              >
                Start Planning Now
              </Button>
              <Button 
                variant="outline" 
                onClick={() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })}
                className="border-2 border-black bg-white hover:bg-gray-100 px-8 py-6 rounded-xl text-lg"
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
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-purple-500 p-2 rounded-xl border-2 border-white">
                  <Globe2 className="size-6 text-white" />
                </div>
                <span className="text-2xl">MindTrip</span>
              </div>
              <p className="text-gray-400">
                Your trusted companion for unforgettable travel experiences around the globe.
              </p>
            </div>

            <div>
              <h4 className="mb-4">Explore</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Destinations</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Activities</Link></li>
                <li><Link href="/hotels" className="hover:text-white transition-colors">Hotels</Link></li>
                <li><Link href="/flights" className="hover:text-white transition-colors">Flights</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Press</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; {currentYear} MindTrip. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
