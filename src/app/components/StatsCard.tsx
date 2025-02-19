"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Stats {
  successRate: number;
  currentStreak: number;
  bestStreak: number;
}

export default function StatsCard() {
  const [stats, setStats] = useState<Stats>({
    successRate: 0,
    currentStreak: 0,
    bestStreak: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/habits/stats");
        if (!response.ok)
          throw new Error("Erreur lors du chargement des stats");

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl p-8 shadow-lg relative"
    >
      <h2 className="text-2xl font-semibold text-sage-800 mb-6">Infos</h2>
      <div className="space-y-3 h-full flex flex-col">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-sage-50 py-3 px-5 rounded-xl text-center sm:text-left">
            <h3 className="text-sm text-sage-600">Taux de réussite</h3>
            <p className="text-2xl font-bold text-emerald-600">
              {isLoading ? "-" : `${stats.successRate}%`}
            </p>
            <p className="text-xs text-sage-500">Ce mois-ci</p>
          </div>
          <div className="bg-sage-50 py-3 px-5 rounded-xl text-center sm:text-left">
            <h3 className="text-sm text-sage-600">Série actuelle</h3>
            <p className="text-2xl font-bold text-emerald-600">
              {isLoading ? "-" : `${stats.currentStreak} jours`}
            </p>
            <p className="text-xs text-sage-500">
              Record : {isLoading ? "-" : `${stats.bestStreak} jours`}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
