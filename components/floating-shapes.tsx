"use client";

import { motion } from "framer-motion";

export function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating circle 1 */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-br from-purple-400/30 to-pink-400/30 blur-2xl"
      />

      {/* Floating circle 2 */}
      <motion.div
        animate={{
          y: [0, 40, 0],
          x: [0, -25, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-40 right-20 w-40 h-40 rounded-full bg-gradient-to-br from-blue-400/30 to-cyan-400/30 blur-2xl"
      />

      {/* Floating circle 3 */}
      <motion.div
        animate={{
          y: [0, -35, 0],
          x: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-40 left-1/4 w-36 h-36 rounded-full bg-gradient-to-br from-orange-400/30 to-yellow-400/30 blur-2xl"
      />

      {/* Floating circle 4 */}
      <motion.div
        animate={{
          y: [0, 30, 0],
          x: [0, -20, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-20 right-1/3 w-44 h-44 rounded-full bg-gradient-to-br from-green-400/30 to-emerald-400/30 blur-2xl"
      />
    </div>
  );
}

