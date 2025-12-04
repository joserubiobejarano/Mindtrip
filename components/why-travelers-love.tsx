"use client";

import { motion } from "framer-motion";
import { BookOpen, Share2, CheckSquare, Lightbulb, Plane, Calendar } from "lucide-react";

export function WhyTravelersLove() {
  const features = [
    {
      icon: BookOpen,
      title: "Add places from guides with 1 click",
      description: "We crawled the web so you don't have to. Easily add mentioned places to your plan.",
      iconBgColor: "bg-yellow-200",
      iconColor: "text-yellow-700"
    },
    {
      icon: Share2,
      title: "Expense tracking and splitting",
      description: "Keep track of your budget and split the cost between your tripmates.",
      iconBgColor: "bg-red-200",
      iconColor: "text-red-700"
    },
    {
      icon: CheckSquare,
      title: "Collaborate with friends in real time",
      description: "Plan along with your friends with live syncing and collaborative editing.",
      iconBgColor: "bg-green-200",
      iconColor: "text-green-700"
    },
    {
      icon: Calendar,
      title: "Checklists for anything",
      description: "Stay organized with a packing list, to-do list, shopping list, any kind of list.",
      iconBgColor: "bg-blue-200",
      iconColor: "text-blue-700"
    },
    {
      icon: Lightbulb,
      title: "Get personalized recommendations",
      description: "Find the best places to visit with smart recommendations based on your itinerary.",
      iconBgColor: "bg-yellow-200",
      iconColor: "text-yellow-700"
    },
    {
      icon: Plane,
      title: "Import flight and hotel reservations",
      description: "Connect or forward your emails to get it magically added into your trip plan.",
      iconBgColor: "bg-teal-200",
      iconColor: "text-teal-700"
    }
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{ backgroundColor: '#f5f0e8' }}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="doodle-pattern-features" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="25" cy="25" r="2" fill="currentColor" />
              <circle cx="75" cy="75" r="2" fill="currentColor" />
              <path d="M40,10 Q50,20 60,10" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M10,60 Q20,50 30,60" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#doodle-pattern-features)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl mb-4 inline-block relative" style={{ fontFamily: "'Caveat', cursive" }}>
            Why travelers love MindTrip
            <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 300 8" preserveAspectRatio="none">
              <path d="M0,4 Q75,7 150,4 T300,4" fill="none" stroke="#ffd93d" strokeWidth="2" />
            </svg>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <motion.div
                className="flex flex-col items-center text-center space-y-4 p-6 bg-white rounded-3xl border-2 border-black transition-all duration-300 cursor-pointer min-h-[280px]"
                whileHover={{ 
                  rotate: -2,
                  borderColor: "#ff6b6b",
                  scale: 1.02
                }}
              >
                {/* Icon in colored circle */}
                <div className="relative flex-shrink-0">
                  <div className={`w-20 h-20 ${feature.iconBgColor} rounded-full flex items-center justify-center`}>
                    <feature.icon className={`${feature.iconColor} w-10 h-10`} strokeWidth={2} />
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <h3 
                    className="text-xl mb-2 font-semibold" 
                    style={{ fontFamily: "'Caveat', cursive", fontStyle: 'italic' }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

