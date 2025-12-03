"use client";

import { motion } from "framer-motion";
import { Heart, MapPin } from "lucide-react";
import { ImageWithFallback } from "@/components/image-with-fallback";
import { useState } from "react";

interface DestinationCardProps {
  image: string;
  title: string;
  attractions: string[];
  gradient?: string; // Keeping for compatibility but might not use
  index: number;
  onClick?: () => void;
}

export function DestinationCard({ 
  image, 
  title, 
  attractions,
  index,
  onClick
}: DestinationCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onClick={onClick}
      className="group relative overflow-hidden border-2 border-border hover:border-primary transition-all duration-300 transform hover:scale-105 hover:-rotate-1 cursor-pointer bg-card shadow-lg rounded-2xl"
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

        {/* Like button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <Heart 
            className={`size-5 ${isLiked ? 'fill-primary text-primary' : 'text-gray-400'} transition-colors`}
          />
        </motion.button>
      </div>

      <div className="p-5 space-y-3 bg-card">
        <div>
          <h3 className="text-2xl mb-1 font-bold">{title}</h3>
        </div>

        <div className="space-y-2 pt-2 border-t border-dashed border-border">
          <div className="flex items-start gap-2 text-muted-foreground text-sm">
            <MapPin className="size-4 mt-1 flex-shrink-0 text-primary" />
            <p className="line-clamp-2">
              {attractions.join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Sketch border effect on hover */}
      <div className="absolute inset-0 border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl transform rotate-1 -z-10 pointer-events-none"></div>
    </motion.div>
  );
}
