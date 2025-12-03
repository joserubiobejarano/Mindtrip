"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: string;
  index: number;
}

export function FeatureCard({ icon: Icon, title, description, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group h-full"
    >
      <div className="flex flex-col items-center text-center space-y-4 p-8 bg-card rounded-3xl border-2 border-border hover:border-primary transition-all transform hover:scale-105 hover:-rotate-2 shadow-lg group-hover:shadow-xl h-full">
        
        {/* Icon with sketch effect */}
        <div className="relative mb-4">
          <div className="p-6 bg-muted/50 rounded-full transform group-hover:rotate-12 transition-transform">
            <Icon className="size-10 text-primary" strokeWidth={2} />
          </div>
          <svg className="absolute inset-0 -z-10 w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" className="text-border opacity-50 transform rotate-6" />
          </svg>
        </div>

        <div>
          <h3 className="text-2xl mb-3 font-bold">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
