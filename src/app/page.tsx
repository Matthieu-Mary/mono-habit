"use client";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const mainRef = useRef(null);
  const heroRef = useRef(null);
  const headingRef = useRef(null);
  const subHeadingRef = useRef(null);
  const ctaRef = useRef(null);
  const benefitsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const bookRef = useRef(null);
  const statsRef = useRef(null);

  const [isLoaded, setIsLoaded] = useState(false);

  useLayoutEffect(() => {
    // Enregistrement de ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // On attend que tout soit chargé
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    // Animation d'entrée principale
    const ctx = gsap.context(() => {
      // Animation du titre
      gsap.from(headingRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      // Animation du sous-titre
      gsap.from(subHeadingRef.current, {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: "power3.out",
      });

      // Animation du bouton CTA
      gsap.from(ctaRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.6,
        ease: "back.out(1.7)",
      });

      // Animation des sections au scroll
      gsap.from(benefitsRef.current, {
        y: 100,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: benefitsRef.current,
          start: "top 80%",
          end: "top 50%",
          scrub: 1,
        },
      });

      gsap.from(testimonialsRef.current, {
        y: 100,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: testimonialsRef.current,
          start: "top 80%",
          end: "top 50%",
          scrub: 1,
        },
      });

      gsap.from(bookRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: bookRef.current,
          start: "top 80%",
          end: "top 50%",
          scrub: 1,
        },
      });

      gsap.from(statsRef.current, {
        x: -50,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 80%",
          end: "top 50%",
          scrub: 1,
        },
      });

      // Animation des cartes de témoignages
      gsap.utils.toArray(".testimonial-card").forEach((card, i) => {
        gsap.from(card, {
          y: 50,
          opacity: 0,
          duration: 0.8,
          delay: 0.2 * i,
          scrollTrigger: {
            trigger: testimonialsRef.current,
            start: "top 70%",
          },
        });
      });
    }, mainRef);

    return () => ctx.revert(); // Nettoyage des animations
  }, [isLoaded]);

  const handleStartJourney = () => {
    router.push("/auth/login");
  };

  return (
    <main
      ref={mainRef}
      className="min-h-screen bg-gradient-to-b from-sage-50 to-sage-100 overflow-x-hidden"
    >
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="min-h-screen flex flex-col items-center justify-center p-8 relative"
      >
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>

        <div className="max-w-4xl text-center space-y-8 z-10">
          <h1
            ref={headingRef}
            className="text-5xl md:text-7xl font-bold text-sage-800 mb-4 tracking-tight"
          >
            <span className="block">Une habitude à la fois.</span>
            <span className="text-emerald-600">Un potentiel infini.</span>
          </h1>

          <p
            ref={subHeadingRef}
            className="text-xl md:text-2xl text-sage-700 leading-relaxed max-w-3xl mx-auto"
          >
            MonoHabit vous aide à développer des habitudes qui transforment
            votre vie,
            <span className="italic font-medium">
              {" "}
              un petit pas après l&apos;autre
            </span>
            . La science prouve qu&apos;une seule habitude bien ancrée peut
            déclencher un effet domino positif.
          </p>

          <div
            ref={statsRef}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg transform transition-all hover:shadow-xl"
          >
            <div className="flex flex-col md:flex-row items-center justify-center md:space-x-12 space-y-6 md:space-y-0">
              <div className="text-center">
                <div className="text-emerald-600 text-5xl font-bold mb-1">
                  1%
                </div>
                <div className="text-sage-700">d&apos;amélioration par jour</div>
              </div>
              <div className="hidden md:block h-16 w-px bg-sage-200"></div>
              <div className="text-center">
                <div className="text-emerald-600 text-5xl font-bold mb-1">
                  37×
                </div>
                <div className="text-sage-700">meilleur en un an</div>
              </div>
              <div className="hidden md:block h-16 w-px bg-sage-200"></div>
              <div className="text-center">
                <div className="text-emerald-600 text-5xl font-bold mb-1">
                  88%
                </div>
                <div className="text-sage-700">taux de réussite</div>
              </div>
            </div>
          </div>

          <button
            ref={ctaRef}
            onClick={handleStartJourney}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-10 rounded-full text-xl transition-all transform hover:scale-105 hover:shadow-lg"
          >
            Commencer votre transformation
          </button>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={benefitsRef} className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-sage-800 mb-16">
            Pourquoi se concentrer sur{" "}
            <span className="text-emerald-600">une seule habitude</span> ?
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-sage-800 mb-3">
                Fini la dispersion
              </h3>
              <p className="text-sage-700">
                Notre cerveau n&apos;est pas conçu pour développer plusieurs
                habitudes simultanément. MonoHabit canalise votre énergie sur un
                seul objectif à la fois.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-sage-800 mb-3">
                Effet domino prouvé
              </h3>
              <p className="text-sage-700">
                Une habitude bien ancrée déclenche naturellement d&apos;autres
                changements positifs. C&apos;est l&apos;effet domino des
                habitudes, scientifiquement prouvé.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-sage-800 mb-3">
                Résultats mesurables
              </h3>
              <p className="text-sage-700">
                Visualisez vos progrès quotidiens et profitez d&apos;une
                motivation constante. Chaque petit pas compte et s&apos;additionne
                exponentiellement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="py-20 px-8 bg-sage-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-sage-800 mb-16">
            Ils ont transformé leur vie avec{" "}
            <span className="text-emerald-600">MonoHabit</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="testimonial-card bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
                  <span className="text-lg font-bold text-emerald-600">S</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-sage-800">
                    Sophie, 34 ans
                  </h4>
                  <p className="text-sage-600">Designer</p>
                </div>
              </div>
              <p className="text-sage-700 italic">
                &quot;En me concentrant uniquement sur l&apos;habitude de
                méditer 5 minutes chaque matin, j&apos;ai non seulement réduit
                mon anxiété mais aussi naturellement amélioré mon alimentation
                et mon sommeil. MonoHabit m&apos;a appris la puissance de la
                simplicité.&quot;
              </p>
            </div>

            <div className="testimonial-card bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
                  <span className="text-lg font-bold text-emerald-600">T</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-sage-800">
                    Thomas, 42 ans
                  </h4>
                  <p className="text-sage-600">Chef d&apos;entreprise</p>
                </div>
              </div>
              <p className="text-sage-700 italic">
                &quot;Avant MonoHabit, j&apos;essayais de tout changer en même
                temps et j&apos;échouais systématiquement. Aujourd&apos;hui,
                après 6 mois à développer une habitude à la fois, ma productivité
                a augmenté de 40% et mon niveau de stress a diminué
                considérablement.&quot;
              </p>
            </div>

            <div className="testimonial-card bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
                  <span className="text-lg font-bold text-emerald-600">M</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-sage-800">
                    Marie, 28 ans
                  </h4>
                  <p className="text-sage-600">Infirmière</p>
                </div>
              </div>
              <p className="text-sage-700 italic">
                &quot;Avec mon emploi du temps chargé, je n&apos;arrivais pas à
                maintenir une routine sportive. MonoHabit m&apos;a aidée à
                intégrer 10 minutes d&apos;exercice quotidien, et maintenant je
                cours un semi-marathon ! L&apos;effet cumulatif est
                incroyable.&quot;
              </p>
            </div>

            <div className="testimonial-card bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
                  <span className="text-lg font-bold text-emerald-600">L</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-sage-800">
                    Lucas, 39 ans
                  </h4>
                  <p className="text-sage-600">Développeur</p>
                </div>
              </div>
              <p className="text-sage-700 italic">
                &quot;J&apos;étais sceptique au début, mais après avoir suivi la
                méthode MonoHabit pour développer l&apos;habitude de lire 20
                pages par jour, j&apos;ai lu 24 livres cette année et ma
                créativité au travail a explosé. Simple mais
                révolutionnaire.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Book Section */}
      <section ref={bookRef} className="py-20 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <h2 className="text-4xl font-bold text-sage-800 mb-6">
              Inspiré par{" "}
              <span className="text-emerald-600">Atomic Habits</span>
            </h2>
            <p className="text-xl text-sage-700 leading-relaxed mb-8">
              MonoHabit s&apos;appuie sur les principes scientifiques développés
              par James Clear dans son best-seller &quot;Atomic Habits&quot;.
              Notre approche applique sa philosophie des petites améliorations
              quotidiennes de 1% qui mènent à des résultats extraordinaires.
            </p>
            <blockquote className="border-l-4 border-emerald-500 pl-6 italic text-sage-700 mb-8">
              &quot;Les habitudes sont les intérêts composés de
              l&apos;amélioration personnelle. Le même moyen qui transforme 1€
              en 2€ peut transformer vos habitudes pour créer des millions de
              moments de succès.&quot;
              <footer className="text-sage-600 mt-2">
                — James Clear, Atomic Habits
              </footer>
            </blockquote>
            <button
              onClick={handleStartJourney}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-full transition-all transform hover:scale-105"
            >
              Commencez aujourd&apos;hui
            </button>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-64 h-96 md:w-80 md:h-[30rem] shadow-2xl transform rotate-3 transition-all hover:rotate-0">
              <div className="absolute inset-0 bg-emerald-600 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-700 opacity-80"></div>
                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                  <div>
                    <h3 className="text-white text-3xl font-bold mb-2">
                      ATOMIC HABITS
                    </h3>
                    <p className="text-white/90 text-lg">
                      An Easy & Proven Way to Build Good Habits & Break Bad Ones
                    </p>
                  </div>
                  <div>
                    <p className="text-white/90 text-right text-xl font-semibold">
                      James Clear
                    </p>
                    <p className="text-white/70 text-right">
                      #1 New York Times Bestseller
                    </p>
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4 border-white/30"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-4 border-white/50"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-4 border-white/70"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-8 bg-emerald-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">
            Prêt à transformer votre vie, une habitude à la fois ?
          </h2>
          <p className="text-xl mb-12 opacity-90">
            Rejoignez des milliers de personnes qui ont changé leur vie grâce à
            la puissance d&apos;une seule habitude bien ancrée.
          </p>
          <button
            onClick={handleStartJourney}
            className="bg-white text-emerald-600 hover:bg-emerald-50 font-bold py-4 px-10 rounded-full text-xl transition-all transform hover:scale-105 hover:shadow-lg"
          >
            Commencer gratuitement
          </button>
          <p className="mt-4 opacity-80">Aucune carte de crédit requise</p>
        </div>
      </section>
    </main>
  );
}
