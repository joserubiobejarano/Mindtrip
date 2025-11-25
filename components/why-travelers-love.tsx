"use client";

import { motion } from "framer-motion";
import { BookOpen, Share2, CheckSquare, Lightbulb, Plane, Calendar } from "lucide-react";

export function WhyTravelersLove() {
  const features = [
    {
      icon: BookOpen,
      title: "Add places from guides with 1 click",
      description: "We crawled the web so you don't have to. Easily add mentioned places to your plan.",
      color: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      icon: Share2,
      title: "Expense tracking and splitting",
      description: "Keep track of your budget and split the cost between your tripmates.",
      color: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      icon: CheckSquare,
      title: "Collaborate with friends in real time",
      description: "Plan along with your friends with live syncing and collaborative editing.",
      color: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      icon: Calendar,
      title: "Checklists for anything",
      description: "Stay organized with a packing list, to-do list, shopping list, any kind of list.",
      color: "bg-pink-100",
      iconColor: "text-pink-600"
    },
    {
      icon: Lightbulb,
      title: "Get personalized recommendations",
      description: "Find the best places to visit with smart recommendations based on your itinerary.",
      color: "bg-yellow-100",
      iconColor: "text-yellow-600"
    },
    {
      icon: Plane,
      title: "Import flight and hotel reservations",
      description: "Connect or forward your emails to get it magically added into your trip plan.",
      color: "bg-orange-100",
      iconColor: "text-orange-600"
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl mb-4 text-gray-900">
            Why travelers love MindTrip
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.05, 
                rotate: 0,
                transition: { duration: 0.3 }
              }}
              className="bg-white rounded-2xl p-8 border-4 border-black relative cursor-pointer"
              style={{
                boxShadow: '6px 6px 0px rgba(0, 0, 0, 1)',
                transform: `rotate(${index % 2 === 0 ? -1 : 1}deg)`
              }}
            >
              {/* Illustration circle */}
              <div className={`${feature.color} w-24 h-24 rounded-full flex items-center justify-center mb-6 border-3 border-black mx-auto`}>
                <feature.icon className={`${feature.iconColor} size-12`} />
              </div>

              <h3 className="text-gray-900 mb-3 text-center">{feature.title}</h3>
              <p className="text-gray-600 text-center">{feature.description}</p>

              {/* Decorative dots in corners */}
              <div className="absolute top-3 right-3 w-2 h-2 bg-black rounded-full"></div>
              <div className="absolute bottom-3 left-3 w-2 h-2 bg-black rounded-full"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

