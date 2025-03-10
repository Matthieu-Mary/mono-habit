"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TaskType } from "../types/enums";
import { getTaskTypeColor } from "../utils/taskTypeUtils";
import { ChallengeStatus, ChallengeType } from "../types/enums";
import { PlusIcon, TrophyIcon } from "@heroicons/react/24/outline";

interface Stats {
  successRate: number;
  currentStreak: number;
  bestStreak: number;
  favoriteTypes: string[] | null;
  month: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  goal: number;
  reward: string;
  penalty: string;
  startDate: string;
  endDate: string;
  status: ChallengeStatus;
}

interface StatsCardProps {
  onNewChallenge: () => void;
}

export default function StatsCard({ onNewChallenge }: StatsCardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(true);

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

  useEffect(() => {
    const fetchActiveChallenge = async () => {
      try {
        const response = await fetch("/api/challenges/active");
        if (!response.ok)
          throw new Error("Erreur lors du chargement du challenge actif");

        const data = await response.json();
        setActiveChallenge(data.challenge || null);
      } catch (error) {
        console.error("Erreur:", error);
        setActiveChallenge(null);
      } finally {
        setIsLoadingChallenge(false);
      }
    };

    fetchActiveChallenge();
  }, []);

  const renderFavoriteTypes = () => {
    if (!stats?.favoriteTypes) return "Aucune tâche ce mois-ci";

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    });
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
          <div className="bg-sage-50 py-3 px-5 rounded-xl text-center sm:text-left h-full">
            <h3 className="text-sm text-sage-600">Taux de réussite</h3>
            <p className="text-2xl font-bold text-emerald-600">
              {isLoading ? "-" : `${stats?.successRate}%`}
            </p>
            <p className="text-xs text-sage-500">Ce mois-ci</p>
          </div>

          <div className="bg-sage-50 py-3 px-5 rounded-xl text-center sm:text-left h-full">
            <h3 className="text-sm text-sage-600">Série actuelle</h3>
            <p className="text-2xl font-bold text-emerald-600">
              {isLoading ? "-" : `${stats?.currentStreak} jours`}
            </p>
            <p className="text-xs text-sage-500">
              Record : {isLoading ? "-" : `${stats?.bestStreak} jours`}
            </p>
          </div>

          <div className="bg-sage-50 py-3 px-5 rounded-xl col-span-1 md:col-span-2 text-center h-full">
            <h3 className="text-sm text-sage-600 mb-2">Type de tâche favori</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {isLoading ? "-" : renderFavoriteTypes()}
            </div>
          </div>
        </div>

        {/* Section Challenge */}
        <div className="bg-sage-50 py-4 px-5 rounded-xl">
          <h3 className="text-sm text-sage-600 mb-3 flex items-center justify-between">
            <span>Challenge du mois</span>
            {activeChallenge && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                En cours
              </span>
            )}
          </h3>
          
          {isLoadingChallenge ? (
            <div className="flex justify-center py-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
            </div>
          ) : activeChallenge ? (
            <div className="space-y-2">
              <h4 className="font-medium text-sage-800">{activeChallenge.title}</h4>
              <p className="text-sm text-sage-600">{activeChallenge.description}</p>
              <div className="text-xs text-sage-500 space-y-1">
                <p>Objectif : {activeChallenge.goal}</p>
                <p>Du {formatDate(activeChallenge.startDate)} au {formatDate(activeChallenge.endDate)}</p>
                <p>Récompense : <span className="text-emerald-600">{activeChallenge.reward}</span></p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-3">
              <TrophyIcon className="h-8 w-8 text-sage-400 mb-2" />
              <p className="text-sm text-sage-600 mb-3">Aucun challenge en cours</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNewChallenge}
                className="px-4 py-2 bg-emerald-500 text-white text-sm rounded-full hover:bg-emerald-600 transition-colors flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Nouveau Challenge
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
