"use client";

import { motion } from "framer-motion";
import { Heart, MapPin } from "lucide-react";
import { ImageWithFallback } from "@/components/image-with-fallback";
import { useState } from "react";

interface DestinationCardProps {
  image: string;
  title: string;
  attractions: string[];
  gradient: string;
  index: number;
  onClick?: () => void;
}

export function DestinationCard({ 
  image, 
  title, 
  attractions,
  gradient,
  index,
  onClick
}: DestinationCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow cursor-pointer border-4 border-black"
      style={{
        boxShadow: '6px 6px 0px rgba(0, 0, 0, 1)',
        transform: `rotate(${index % 3 === 0 ? -1 : index % 3 === 1 ? 0 : 1}deg)`
      }}
    >
      {/* Image */}
      <div className="relative h-72 overflow-hidden">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

        {/* Like button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className="absolute top-4 right-4 z-20 bg-white p-2 rounded-full border-2 border-black hover:bg-gray-100 transition-colors"
        >
          <Heart 
            className={`size-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'} transition-colors`}
          />
        </motion.button>

        {/* City name and attractions overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <h3 className="text-white text-3xl mb-3">{title}</h3>
          <div className="flex items-start gap-2">
            <MapPin className="size-4 text-white mt-1 flex-shrink-0" />
            <p className="text-white/90 text-sm">{attractions.join(' · ')}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

