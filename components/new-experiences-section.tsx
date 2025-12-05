"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { MapPin } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

const getCategoryColor = (category: string) => {
  const colors: Record<string, { bg: string; text: string; border: string; hoverColor: string }> = {
    "Adventure": { bg: "bg-red-100", text: "text-red-700", border: "border-red-500", hoverColor: "#b91c1c" },
    "Nature": { bg: "bg-green-100", text: "text-green-700", border: "border-green-500", hoverColor: "#15803d" },
    "Skiing": { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-500", hoverColor: "#1e40af" },
    "Food & Drink": { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-500", hoverColor: "#b45309" },
    "Workshop": { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-500", hoverColor: "#be185d" },
    "Sightseeing": { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-500", hoverColor: "#c2410c" },
    "Culture": { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-500", hoverColor: "#6b21a8" },
  };
  return colors[category] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-500", hoverColor: "#374151" };
};

const cities = [
  {
    categories: ["Culture", "Sightseeing", "Nature"],
    image: "https://images.unsplash.com/photo-1570841964538-c0406b497337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb25kb24lMjBjaXR5c2NhcGUlMjB0aGFtZXN8ZW58MXx8fHwxNzY0MTA3ODA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "London",
    location: "United Kingdom",
    attractions: ["Big Ben", "Tower Bridge", "British Museum"],
  },
  {
    categories: ["Culture", "Nature", "Food & Drink"],
    image: "https://images.unsplash.com/photo-1534203137048-137aa03c692e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbXN0ZXJkYW0lMjBjYW5hbCUyMGhvdXNlc3xlbnwxfHx8fDE3NjQwOTQ3MjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Amsterdam",
    location: "Netherlands",
    attractions: ["Van Gogh Museum", "Anne Frank House", "Canal Cruise"],
  },
  {
    categories: ["Sightseeing", "Culture", "Food & Drink", "Nature"],
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXJjZWxvbmElMjBzYWdyYWRhJTIwZmFtaWxpYXxlbnwxfHx8fDE3NjQwNTU2NTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Barcelona",
    location: "Spain",
    attractions: ["Sagrada Familia", "Park Güell", "La Rambla"],
  },
  {
    categories: ["Culture", "Sightseeing", "Food & Drink", "Nature"],
    image: "https://images.unsplash.com/photo-1431274172761-fca41d930114?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGVpZmZlbCUyMHRvd2VyfGVufDF8fHx8MTc2NDA3NTkwMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Paris",
    location: "France",
    attractions: ["Eiffel Tower", "Louvre", "Notre-Dame"],
  },
  {
    categories: ["Culture", "Nature", "Sightseeing"],
    image: "https://images.unsplash.com/photo-1704471504038-5443d863e3a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZXJsaW4lMjBicmFuZGVuYnVyZyUyMGdhdGV8ZW58MXx8fHwxNzY0MDQ5MDk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Berlin",
    location: "Germany",
    attractions: ["Brandenburg Gate", "Museum Island", "Berlin Wall"],
  },
  {
    categories: ["Sightseeing", "Culture", "Food & Drink"],
    image: "https://images.unsplash.com/photo-1552432552-06c0b0a94dda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21lJTIwY29sb3NzZXVtJTIwdmF0aWNhbnxlbnwxfHx8fDE3NjQxMDc4MDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Rome",
    location: "Italy",
    attractions: ["Colosseum", "Vatican", "Trevi Fountain"],
  },
];

function CityCard({ city }: { city: typeof cities[0] }) {
  const [isHovered, setIsHovered] = useState(false);
  const primaryCategory = city.categories[0];
  const primaryCategoryColors = getCategoryColor(primaryCategory);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group relative flex flex-col h-full cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={city.image}
          alt={city.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-5 flex flex-col">
        <h3 
          className="text-2xl font-bold mb-2 transition-colors duration-300"
          style={{ 
            fontFamily: "'Patrick Hand', cursive",
            color: isHovered ? primaryCategoryColors.hoverColor : 'inherit'
          }}
        >
          {city.title}
        </h3>
        <div className="flex items-start gap-2 text-muted-foreground text-sm mb-3">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="line-clamp-2">
            {city.attractions.join(', ')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {city.categories.map((category) => {
            const categoryColors = getCategoryColor(category);
            return (
              <div
                key={category}
                className={`${categoryColors.bg} ${categoryColors.text} px-3 py-1 rounded-full`}
              >
                <span className="font-mono text-xs font-semibold">{category}</span>
              </div>
            );
          })}
        </div>
      </div>
      {/* Hover border effect */}
      <div className={`absolute inset-0 border-2 ${primaryCategoryColors.border} opacity-0 group-hover:opacity-100 rounded-2xl pointer-events-none transition-opacity duration-300`} />
    </div>
  );
}

export function NewExperiencesSection() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const handleViewAll = () => {
    if (isSignedIn) {
      router.push("/trips");
    } else {
      router.push("/sign-in");
    }
  };

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 
            className="text-4xl md:text-5xl mb-4"
            style={{ fontFamily: "'Patrick Hand', cursive" }}
          >
            Unique Experiences
          </h2>
          <p className="text-muted-foreground">
            Handpicked activities that make your trip unforgettable
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <CityCard 
              key={city.title}
              city={city}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            onClick={handleViewAll}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 shadow-lg transform hover:scale-105 transition-transform font-mono text-xs tracking-wider uppercase"
          >
            View All Destinations
          </Button>
        </div>
      </div>
    </section>
  );
}

