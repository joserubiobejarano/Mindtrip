"use client";

import { motion } from "framer-motion";
import { BookOpen, Share2, CheckSquare, Lightbulb, Plane, Calendar } from "lucide-react";

export function WhyTravelersLove() {
  const features = [
    {
      icon: BookOpen,
      title: "Add places from guides with 1 click",
      description: "We crawled the web so you don't have to. Easily add mentioned places to your plan.",
      color: "bg-accent/20",
      iconColor: "text-accent"
    },
    {
      icon: Share2,
      title: "Expense tracking and splitting",
      description: "Keep track of your budget and split the cost between your tripmates.",
      color: "bg-chart-3/20",
      iconColor: "text-chart-3"
    },
    {
      icon: CheckSquare,
      title: "Collaborate with friends in real time",
      description: "Plan along with your friends with live syncing and collaborative editing.",
      color: "bg-chart-5/20",
      iconColor: "text-chart-5"
    },
    {
      icon: Calendar,
      title: "Checklists for anything",
      description: "Stay organized with a packing list, to-do list, shopping list, any kind of list.",
      color: "bg-secondary/20",
      iconColor: "text-secondary"
    },
    {
      icon: Lightbulb,
      title: "Get personalized recommendations",
      description: "Find the best places to visit with smart recommendations based on your itinerary.",
      color: "bg-primary/20",
      iconColor: "text-primary"
    },
    {
      icon: Plane,
      title: "Import flight and hotel reservations",
      description: "Connect or forward your emails to get it magically added into your trip plan.",
      color: "bg-chart-4/20",
      iconColor: "text-chart-4"
    }
  ];

  return (
    <section className="py-20 px-4 bg-muted/30 relative overflow-hidden">
      {/* Background pattern - same as How It Works */}
      <div className="absolute inset-0 opacity-10">
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
              <div className="flex flex-col items-center text-center space-y-4 p-6 bg-card rounded-3xl border-2 border-border hover:border-primary transition-all transform hover:scale-105 hover:-rotate-2 shadow-lg group-hover:shadow-xl">
                {/* Icon with sketch effect */}
                <div className="relative">
                  <div className={`p-6 ${feature.color} rounded-full transform group-hover:rotate-12 transition-transform`}>
                    <feature.icon className={`${feature.iconColor} w-12 h-12`} strokeWidth={2} />
                  </div>
                  <svg className="absolute inset-0 -z-10 w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" className="text-border opacity-50 transform rotate-6" />
                  </svg>
                </div>

                <div>
                  <h3 className="text-2xl mb-2 font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Decorative elements */}
        <div className="flex justify-center gap-4 mt-12">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </section>
  );
}

