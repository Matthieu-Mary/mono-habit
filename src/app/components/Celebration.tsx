"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

interface CelebrationProps {
  isVisible: boolean;
  onComplete: () => void;
}

export default function Celebration({
  isVisible,
  onComplete,
}: CelebrationProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const particlesInit = useCallback(async (engine: any) => {
    await loadSlim(engine);
  }, []);

  useEffect(() => {
    if (isVisible) {
      const audio = new Audio("/success.mp3");
      audio.volume = 0.5; // Volume à 50%
      audio.play().catch((error) => console.log("Erreur audio:", error));

      // Programmer la fin de la célébration
      const timer = setTimeout(() => {
        onComplete();
      }, 4000); // Durée totale de 4 secondes

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay sombre */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Overlay avec particules */}
          <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center">
            <Particles
              id="confetti"
              init={particlesInit}
              options={{
                particles: {
                  color: {
                    value: [
                      "#10B981",
                      "#34D399",
                      "#6EE7B7",
                      "#A7F3D0",
                      "#FFD700",
                      "#FFA500",
                    ],
                  },
                  move: {
                    direction: "top",
                    enable: true,
                    speed: 12,
                    outModes: "destroy",
                  },
                  number: {
                    value: 60, // Plus de particules
                    density: {
                      enable: false,
                    },
                  },
                  shape: {
                    type: ["circle", "square", "star"],
                  },
                  size: {
                    value: { min: 5, max: 15 },
                  },
                  life: {
                    duration: {
                      sync: true,
                      value: 4, // Durée de vie plus longue
                    },
                  },
                  opacity: {
                    value: 1,
                  },
                },
              }}
            />

            {/* Container pour l'emoji et le message */}
            <div className="flex flex-col items-center gap-8">
              {/* Emoji qui célèbre */}
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{
                  type: "spring",
                  damping: 12,
                  duration: 1.2,
                }}
              >
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                    y: [0, -20, 0, -20, 0],
                    scale: [1, 1.2, 1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: 1,
                    ease: "easeInOut",
                  }}
                  className="text-9xl"
                >
                  🎉
                </motion.div>
              </motion.div>

              {/* Message de félicitations */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <motion.h2
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: 1,
                    ease: "easeInOut",
                  }}
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-emerald-500 bg-white/95 px-4 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-4 md:py-5 lg:py-6 rounded-full shadow-2xl whitespace-nowrap"
                >
                  Objectif atteint ! 🌟
                </motion.h2>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
