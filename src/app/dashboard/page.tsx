"use client";

import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { session, status } = useAuth();
  const [timeProgress, setTimeProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("");

  // Calculer la progression de la journée
  useEffect(() => {
    const updateProgress = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const totalMinutes = hours * 60 + minutes;
      const progress = (totalMinutes / (24 * 60)) * 100;

      setTimeProgress(progress);
      setCurrentTime(
        now.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };

    updateProgress();
    const interval = setInterval(updateProgress, 60000); // Mise à jour chaque minute
    return () => clearInterval(interval);
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage-50 p-8">
      {/* En-tête */}
      <header className="mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold text-sage-800">
              Bonjour, {session?.user?.name}
            </h1>
            <p className="text-sage-600 mt-2">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <div className="text-3xl font-mono text-sage-700">{currentTime}</div>
        </motion.div>
      </header>

      {/* Barre de progression de la journée */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        className="mb-12 bg-sage-200 rounded-full h-4 overflow-hidden"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${timeProgress}%` }}
          transition={{ duration: 1 }}
          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
        />
      </motion.div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tâche du jour */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-semibold text-sage-800 mb-6">
            Tâche du jour
          </h2>
          {/* Placeholder pour la tâche du jour */}
          <div className="flex items-center justify-center h-40 border-2 border-dashed border-sage-300 rounded-xl">
            <button className="px-6 py-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors">
              + Ajouter une tâche
            </button>
          </div>
        </motion.div>

        {/* Actions rapides */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-semibold text-sage-800 mb-6">
            Actions rapides
          </h2>
          <div className="space-y-4">
            <button className="w-full p-4 text-left bg-sage-50 hover:bg-sage-100 rounded-xl transition-colors flex items-center gap-4">
              <span className="p-2 bg-emerald-100 rounded-lg">📅</span>
              Voir l&apos;historique
            </button>
            <button className="w-full p-4 text-left bg-sage-50 hover:bg-sage-100 rounded-xl transition-colors flex items-center gap-4">
              <span className="p-2 bg-emerald-100 rounded-lg">🎯</span>
              Programmer une tâche
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
