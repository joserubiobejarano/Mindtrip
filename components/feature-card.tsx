"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  index: number;
}

export function FeatureCard({ icon: Icon, title, description, gradient, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      className="relative group"
    >
      <div 
        className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow h-full border-4 border-black"
        style={{
          boxShadow: '6px 6px 0px rgba(0, 0, 0, 1)',
          transform: `rotate(${index % 2 === 0 ? -1 : 1}deg)`
        }}
      >        
        {/* Content */}
        <div className="relative z-10">
          <div className={`${gradient} w-16 h-16 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 border-2 border-black`}>
            <Icon className="size-8 text-white" />
          </div>
          <h3 className="text-gray-800 mb-3">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>

        {/* Decorative corner dots */}
        <div className="absolute top-3 right-3 w-2 h-2 bg-black rounded-full"></div>
        <div className="absolute bottom-3 left-3 w-2 h-2 bg-black rounded-full"></div>
      </div>
    </motion.div>
  );
}

