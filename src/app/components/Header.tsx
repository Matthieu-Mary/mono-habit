"use client";
import { useLayoutEffect, useRef, useEffect, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<HTMLDivElement>(null);
  const wave2Ref = useRef<HTMLDivElement>(null);
  const wave3Ref = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);

  const pathname = usePathname();
  const isAuthPage = pathname?.includes("/auth/");

  // Initialisation des particules
  useEffect(() => {
    const initParticles = () => {
      const newParticles: Particle[] = [];
      const count = window.innerWidth < 768 ? 30 : 60;

      for (let i = 0; i < count; i++) {
        newParticles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * 80,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.2,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }

      particlesRef.current = newParticles;
    };

    initParticles();
    window.addEventListener("resize", initParticles);

    return () => {
      window.removeEventListener("resize", initParticles);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Animation des particules
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = 80;

    const updateCanvas = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fond dégradé pour le canvas
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "rgba(5, 150, 105, 0.4)");
      gradient.addColorStop(1, "rgba(5, 150, 105, 0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dessiner les particules
      particlesRef.current.forEach((particle) => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Mise à jour de la position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Rebond sur les bords
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.speedX *= -1;
        }

        if (particle.y < 0 || particle.y > canvas.height) {
          particle.speedY *= -1;
        }
      });

      animationRef.current = requestAnimationFrame(updateCanvas);
    };

    updateCanvas();

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = 80;
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Effet de scroll pour le header
  useEffect(() => {
    const checkScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", checkScroll);
    return () => {
      window.removeEventListener("scroll", checkScroll);
    };
  }, []);

  // Animation du header avec GSAP
  useLayoutEffect(() => {
    // Animation initiale du logo
    gsap.fromTo(
      logoRef.current,
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "elastic.out(1, 0.5)" }
    );

    // Animation des éléments de navigation
    gsap.fromTo(
      navRef.current?.childNodes || [],
      { y: -20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      }
    );

    // Animation des vagues
    gsap.to(waveRef.current, {
      x: "-10%",
      repeat: -1,
      duration: 15,
      ease: "linear",
      yoyo: true,
    });

    gsap.to(wave2Ref.current, {
      x: "15%",
      repeat: -1,
      duration: 20,
      ease: "linear",
      yoyo: true,
    });

    gsap.to(wave3Ref.current, {
      x: "-15%",
      repeat: -1,
      duration: 25,
      ease: "linear",
      yoyo: true,
    });
  }, []);

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "py-2 bg-sage-800/90 backdrop-blur-md shadow-md"
          : "py-4 bg-sage-800/40 backdrop-blur-sm"
      }`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          ref={waveRef}
          className="absolute w-[200%] h-full opacity-30"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z' fill='%23ffffff' fill-opacity='0.3'%3E%3C/path%3E%3C/svg%3E\")",
            backgroundSize: "1200px 100%",
            backgroundRepeat: "repeat-x",
            transform: "rotate(180deg)",
          }}
        />
        <div
          ref={wave2Ref}
          className="absolute w-[200%] h-full opacity-20"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z' fill='%23ffffff' fill-opacity='0.3'%3E%3C/path%3E%3C/svg%3E\")",
            backgroundSize: "1200px 100%",
            backgroundRepeat: "repeat-x",
          }}
        />
        <div
          ref={wave3Ref}
          className="absolute w-[200%] h-full opacity-10 top-1"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' fill='%23ffffff' fill-opacity='0.3'%3E%3C/path%3E%3C/svg%3E\")",
            backgroundSize: "1200px 100%",
            backgroundRepeat: "repeat-x",
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
        />
      </div>

      <div className="container mx-auto px-4 flex justify-between items-center relative z-10">
        <Link href="/" className="flex items-center">
          <div ref={logoRef} className="font-bold text-2xl tracking-tight">
            <span className="text-white">mono</span>
            <span className="text-emerald-400">Habit</span>
          </div>
        </Link>

        <div ref={navRef} className="flex items-center space-x-6">
          {!isAuthPage && (
            <Link
              href="/auth/login"
              className={`relative overflow-hidden rounded-full px-6 py-2 text-white font-semibold group transition-all duration-300 ${
                isScrolled ? "bg-emerald-500" : "bg-emerald-600"
              }`}
            >
              <span className="relative z-10">Commencer</span>
              <span className="absolute inset-0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out">
                <svg
                  className="h-full w-full"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <path
                    className="fill-emerald-400"
                    d="M0,0 L0,100 L100,100 L100,0 Q60,45 30,20 Q15,5 0,20 Z"
                  >
                    <animate
                      attributeName="d"
                      dur="0.7s"
                      fill="freeze"
                      values="
                        M0,0 L0,100 L100,100 L100,0 Q60,45 30,20 Q15,5 0,20 Z;
                        M0,0 L0,100 L100,100 L100,0 Q60,15 30,40 Q15,65 0,40 Z;
                        M0,0 L0,100 L100,100 L100,0 L0,0 Z
                      "
                    />
                  </path>
                </svg>
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
