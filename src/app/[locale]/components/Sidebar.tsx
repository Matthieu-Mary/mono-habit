"use client";

import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const handleSignOut = () => {
    // Supprimer les tokens du localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("tokenExpiry");
    
    // Déconnexion via NextAuth
    signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <>
      {/* Bouton pour ouvrir/fermer le sidebar */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-5 left-6 z-30 p-3 bg-white rounded-full shadow-lg text-sage-800"
      >
        <svg
          className={`w-6 h-6 transition-transform ${
            isOpen ? "rotate-90" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </motion.button>

      {/* Overlay sombre quand le sidebar est ouvert */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 text-sage-800"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 20 }}
        className="fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 py-6 px-4 text-sage-800"
      >
        <div className="flex flex-col h-full">
          {/* Logo ou titre */}
          <div className="mb-8 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-sage-800">
              Mono<span className="text-emerald-600">Habit</span>
            </h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full bg-sage-100 hover:bg-sage-200"
            >
              <svg
                className="w-5 h-5 text-sage-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.button>
          </div>

          {/* Navigation */}
          <nav className="flex-1">
            <ul className="space-y-3">
              <li>
                <Link
                  href="/dashboard"
                  className={`flex items-center space-x-3 p-3 rounded-xl transition-colors
                    ${
                      isActive("/dashboard")
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-sage-50 hover:bg-sage-100 text-sage-800"
                    }`}
                >
                  <span className="p-2 bg-emerald-100 rounded-lg">🏠</span>
                  <span>Tableau de bord</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/historic"
                  className={`flex items-center space-x-3 p-3 rounded-xl transition-colors
                    ${
                      isActive("/historic")
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-sage-50 hover:bg-sage-100 text-sage-800"
                    }`}
                >
                  <span className="p-2 bg-emerald-100 rounded-lg">📅</span>
                  <span>Historique</span>
                </Link>
              </li>
              {/* <li>
                <Link
                  href="/challenge"
                  className={`flex items-center space-x-3 p-3 rounded-xl transition-colors
                    ${
                      isActive("/challenge")
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-sage-50 hover:bg-sage-100 text-sage-800"
                    }`}
                >
                  <span className="p-2 bg-emerald-100 rounded-lg">🎯</span>
                  <span>Challenges</span>
                </Link>
              </li> */}
            </ul>
          </nav>

          {/* Bouton de déconnexion */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            className="w-full p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Se déconnecter</span>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
