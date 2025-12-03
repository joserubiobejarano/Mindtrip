"use client";

import { motion } from "framer-motion";
import { Smartphone, Apple } from "lucide-react";

export function GetTheApp() {
  return (
    <section className="py-20 px-4 relative overflow-hidden bg-chart-3/10">
      <div className="relative max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* App Icon */}
          <div className="inline-block mb-6">
            <div className="bg-secondary p-6 rounded-3xl border-2 border-border shadow-lg transform hover:rotate-6 transition-transform">
              <Smartphone className="size-12 text-secondary-foreground" />
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl mb-6 text-foreground font-caveat">
            Download the app now.
          </h2>

          {/* App Store Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.a
              href="#"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-foreground text-background px-8 py-4 rounded-full border-2 border-border inline-flex items-center gap-3 hover:bg-foreground/90 transition-colors shadow-lg"
            >
              <Apple className="size-8" />
              <div className="text-left">
                <div className="text-xs">Download on the</div>
                <div className="text-lg font-bold">App Store</div>
              </div>
            </motion.a>

            <motion.a
              href="#"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-foreground text-background px-8 py-4 rounded-full border-2 border-border inline-flex items-center gap-3 hover:bg-foreground/90 transition-colors shadow-lg"
            >
              <svg className="size-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/>
              </svg>
              <div className="text-left">
                <div className="text-xs">GET IT ON</div>
                <div className="text-lg font-bold">Google Play</div>
              </div>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

