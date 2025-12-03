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
    <section className="py-20 px-4 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl mb-4 text-foreground font-caveat">
            Why travelers love MindTrip
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
              whileHover={{ 
                scale: 1.05, 
                transition: { duration: 0.3 }
              }}
              className="bg-card rounded-3xl p-6 border-2 border-border hover:border-primary transition-all cursor-pointer shadow-lg relative"
            >
              {/* Decorative corner dots */}
              <div className="absolute top-3 right-3 w-2 h-2 bg-border rounded-full"></div>
              <div className="absolute bottom-3 left-3 w-2 h-2 bg-border rounded-full"></div>

              {/* Icon circle */}
              <div className={`${feature.color} w-20 h-20 rounded-full flex items-center justify-center mb-5 mx-auto transform hover:rotate-12 transition-transform`}>
                <feature.icon className={`${feature.iconColor} size-10`} strokeWidth={2} />
              </div>

              <h3 className="text-foreground mb-3 text-center font-bold text-lg">{feature.title}</h3>
              <p className="text-muted-foreground text-center leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

