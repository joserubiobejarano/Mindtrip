"use client";

import { Zap, Calendar, Users, MapPin } from "lucide-react";

const reasons = [
  {
    icon: Zap,
    title: "Smart Itinerary",
    description: "AI-powered trip planning that creates the perfect itinerary.",
    bgColor: "#DBEAFE", // blue-100
    iconColor: "#1E40AF", // blue-700
  },
  {
    icon: Calendar,
    title: "Flexible Booking",
    description: "Book with confidence with free cancellation options.",
    bgColor: "#D1FAE5", // green-100
    iconColor: "#15803D", // green-700
  },
  {
    icon: Users,
    title: "Group Travel",
    description: "Coordinate trips with friends and family all in one place.",
    bgColor: "#FFEDD5", // orange-100
    iconColor: "#C2410C", // orange-700
  },
  {
    icon: MapPin,
    title: "Local Experiences",
    description: "Discover hidden gems recommended by locals.",
    bgColor: "#FCE7F3", // pink-100
    iconColor: "#BE185D", // pink-700
  },
];

export function WhyChooseSection() {
  return (
    <section className="py-20 px-6" style={{ backgroundColor: 'hsl(var(--cream))' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 
            className="text-4xl md:text-5xl mb-4" 
            style={{ fontFamily: "'Patrick Hand', cursive" }}
          >
            Why Choose <span className="solid-underline inline-block relative">Kruno</span>?
          </h2>
          <p className="text-muted-foreground mt-6">Everything you need for the perfect journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason) => (
            <div 
              key={reason.title} 
              className="bg-white rounded-xl shadow-sm p-6 flex flex-col h-full transition-all duration-300 hover:border-b-4 hover:border-foreground cursor-pointer"
            >
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4 border-2"
                style={{ 
                  backgroundColor: reason.bgColor,
                  borderColor: reason.iconColor
                }}
              >
                <reason.icon 
                  className="w-7 h-7" 
                  style={{ color: reason.iconColor }}
                  strokeWidth={2}
                />
              </div>
              <h3 
                className="text-xl font-bold mb-2 text-left"
                style={{ fontFamily: "'Patrick Hand', cursive" }}
              >
                {reason.title}
              </h3>
              <p className="text-muted-foreground text-sm text-left">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

