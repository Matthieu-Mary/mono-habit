"use client";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useEffect, useState } from "react";
import gsap from "gsap";
import Header from "./components/Header";

export default function NotFound() {
  const router = useRouter();
  const mainRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const imageRef = useRef(null);
  const ctaRef = useRef(null);

  const [isMounted, setIsMounted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Résoudre le problème d'hydratation en ne rendant le composant que côté client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (isMounted) {
      setIsLoaded(true);
    }
  }, [isMounted]);

  useEffect(() => {
    if (!isLoaded || !isMounted) return;

    const ctx = gsap.context(() => {
      // Animation du titre
      gsap.from(titleRef.current, {
        y: -50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      // Animation du sous-titre
      gsap.from(subtitleRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
      });

      // Animation de l'image
      gsap.from(imageRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        delay: 0.4,
        ease: "back.out(1.7)",
      });

      // Animation du bouton CTA
      gsap.from(ctaRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.6,
        ease: "back.out(1.7)",
      });
    }, mainRef);

    return () => ctx.revert(); // Nettoyage des animations
  }, [isLoaded, isMounted]);

  const handleGoHome = () => {
    router.push("/");
  };

  // Ne rien rendre pendant l'hydratation pour éviter les erreurs
  if (!isMounted) {
    return null;
  }

  return (
    <main
      ref={mainRef}
      className="min-h-screen bg-gradient-to-b from-sage-50 to-sage-100 overflow-x-hidden"
    >
      <Header />

      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h1
            ref={titleRef}
            className="text-6xl md:text-8xl font-bold text-sage-800 mb-6"
          >
            <span className="text-emerald-600">404</span> - Page introuvable
          </h1>
          
          <p
            ref={subtitleRef}
            className="text-xl md:text-2xl text-sage-700 mb-12"
          >
            Oups ! Il semble que vous ayez perdu votre habitude de navigation.
            <br />
            La page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>

          <div 
            ref={imageRef}
            className="mb-12 relative w-64 h-64 mx-auto"
          >
            <div className="absolute inset-0 bg-emerald-100 rounded-full opacity-30"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-32 w-32 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <div ref={ctaRef} className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGoHome}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 hover:shadow-lg"
            >
              Retourner à l&apos;accueil
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 