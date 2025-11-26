"use client";

import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Newsletter() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Diagonal separator - matching the style from GetTheApp section */}
      <div className="absolute inset-0 bg-cyan-400" style={{
        clipPath: 'polygon(0 10%, 100% 0, 100% 90%, 0 100%)'
      }}></div>
      
      <div className="relative max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl p-8 md:p-12 border-4 border-black"
          style={{ boxShadow: '8px 8px 0px rgba(0, 0, 0, 1)' }}
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-orange-500 p-3 rounded-2xl border-2 border-black flex-shrink-0">
              <Mail className="size-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl mb-3 text-gray-900">
                Plan smarter, travel better.
              </h2>
              <p className="text-gray-600 text-sm md:text-base">
                Get AI-built itineraries, destination ideas and hotel deals straight to your inbox. No spam, just travel inspo.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-gray-300 focus:border-purple-600 focus:bg-white transition-all outline-none"
              />
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl border-2 border-black h-auto">
              Subscribe
              <ArrowRight className="ml-2 size-5" />
            </Button>
          </div>

          {/* Decorative corner dots */}
          <div className="absolute top-6 right-6 w-3 h-3 bg-black rounded-full"></div>
          <div className="absolute bottom-6 left-6 w-3 h-3 bg-black rounded-full"></div>
        </motion.div>
      </div>
    </section>
  );
}

