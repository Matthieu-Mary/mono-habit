"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import { TaskType } from "../types/enums";
import { getTaskTypeColor } from "../utils/taskTypeUtils";

interface MonthStats {
  month: number;
  year: number;
  completedTasks: number;
  totalDays: number;
  bestStreak: number;
  isPerfect: boolean;
  favoriteTypes: TaskType[] | null;
  challenge?: {
    title: string;
    status: string;
  } | null;
}

export default function Historic() {
  const [yearStats, setYearStats] = useState<MonthStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchYearStats = async () => {
      try {
        const response = await fetch(`/api/habits/yearly/${selectedYear}`);
        if (!response.ok)
          throw new Error("Erreur lors du chargement des statistiques");
        const data = await response.json();
        setYearStats(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchYearStats();
  }, [selectedYear]);

  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  const renderFavoriteTypes = (types: TaskType[] | null) => {
    if (!types) return "Aucune tâche";

    return types.map((type, index) => (
      <span
        key={type}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
          getTaskTypeColor(type).bg
        } ${getTaskTypeColor(type).text}`}
      >
        <span>{getTaskTypeColor(type).icon}</span>
        <span>{type}</span>
        {index < types.length - 1 && (
          <span className="mx-1 text-sage-400">•</span>
        )}
      </span>
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-48 bg-sage-50 p-8 lg:pb-16">
      {/* En-tête */}
      <header className="mb-4 mt-12 lg:ml-16 lg:mb-6 lg:mt-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center items-center lg:justify-start"
        >
          <h1 className="text-2xl font-bold text-sage-800 lg:text-4xl ">
            Historique {selectedYear}
          </h1>
        </motion.div>
      </header>

      {/* Grille des mois */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {monthNames.map((monthName, index) => {
          const monthStats = yearStats.find(
            (stat) => stat.month === index + 1
          ) || {
            month: index + 1,
            year: selectedYear,
            completedTasks: 0,
            totalDays: new Date(selectedYear, index + 1, 0).getDate(),
            bestStreak: 0,
            isPerfect: false,
            favoriteTypes: null,
            challenge: null,
          };

          const isCurrentMonth = new Date().getMonth() === index;
          const isFutureMonth = new Date(selectedYear, index) > new Date();

          return (
            <motion.div
              key={monthName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-2xl p-6 shadow-lg relative overflow-hidden min-h-[245px]
                ${
                  monthStats.isPerfect
                    ? "bg-gradient-to-br from-yellow-100 to-amber-100"
                    : ""
                }
              `}
            >
              {/* Effet de brillance pour les mois parfaits */}
              {monthStats.isPerfect && (
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-shine" />
                </div>
              )}

              <h3 className="text-xl font-semibold text-sage-800">
                {monthName}
              </h3>

              {!isFutureMonth ? (
                <div className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sage-600">Tâches complétées</span>
                    <span
                      className={`font-mono font-bold ${
                        monthStats.isPerfect
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {monthStats.completedTasks}/{monthStats.totalDays}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sage-600">Meilleure série</span>
                    <span
                      className={`font-mono font-bold ${
                        monthStats.isPerfect
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {monthStats.bestStreak} jours
                    </span>
                  </div>
                  <div className="pt-2 border-sage-200 flex items-center justify-between">
                    <span className="text-sm text-sage-600 block mb-2">
                      Type de tâche favori
                    </span>
                    {/* On applique un style dynamique en fonction du nombre de tâches (ici si il n'ya aucune tâche, on applique un style différent) */}
                    {(() => {
                      const favoriteTypesResult = renderFavoriteTypes(
                        monthStats.favoriteTypes
                      );
                      const isNoTask = favoriteTypesResult === "Aucune tâche";

                      return (
                        <div
                          className={`flex flex-wrap gap-2 ${
                            isNoTask ? "text-sm text-sage-500 italic" : ""
                          }`}
                        >
                          {favoriteTypesResult}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Nouvelle section pour les challenges - sans séparateur */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-sm text-sage-600 block mb-2">
                      Challenge
                    </span>
                    {monthStats.challenge ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-sage-800">
                          {monthStats.challenge.title}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            monthStats.challenge.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : monthStats.challenge.status === "FAILED"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {monthStats.challenge.status === "COMPLETED"
                            ? "Réussi"
                            : monthStats.challenge.status === "FAILED"
                            ? "Échoué"
                            : "En cours"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-sage-500 italic">
                        Aucun challenge
                      </span>
                    )}
                  </div>

                  {isCurrentMonth && (
                    <div className="mt-2 text-xs text-sage-500 text-center">
                      Mois en cours
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-sage-400 flex justify-center items-center h-full">
                  Mois à venir
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
