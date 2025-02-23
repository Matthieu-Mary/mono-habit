"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TaskType } from "../types/enums";
import { getTaskTypeColor } from "../utils/taskTypeUtils";

interface Stats {
  successRate: number;
  currentStreak: number;
  bestStreak: number;
  favoriteTypes: string[] | null;
  month: string;
}

export default function StatsCard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/habits/stats");
        if (!response.ok)
          throw new Error("Erreur lors du chargement des stats");

        const data = await response.json();
        setStats(data.currentMonth);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (!stats) {
    return <div>Loading...</div>;
  }

  const renderFavoriteTypes = () => {
    if (!stats.favoriteTypes) return "Aucune tâche ce mois-ci";

    return stats.favoriteTypes.map((type, index) => (
      <span
        key={type}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
          getTaskTypeColor(type as TaskType).bg
        } ${getTaskTypeColor(type as TaskType).text}`}
      >
        <span>{getTaskTypeColor(type as TaskType).icon}</span>
        <span>{type}</span>
        {index < stats.favoriteTypes!.length - 1 && (
          <span className="mx-1 text-sage-400">•</span>
        )}
      </span>
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl p-8 shadow-lg relative"
    >
      <h2 className="text-2xl font-semibold text-sage-800 mb-6">Infos</h2>
      <div className="space-y-6 h-full flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="bg-sage-50 py-3 px-5 rounded-xl col-span-1 md:col-span-2 text-center">
            <h3 className="text-sm text-sage-600 mb-2">Type de tâche favori</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {isLoading ? "-" : renderFavoriteTypes()}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
