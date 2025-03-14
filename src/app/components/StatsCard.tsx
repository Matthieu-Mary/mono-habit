"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TaskType } from "../types/enums";
import { getTaskTypeColor } from "../utils/taskTypeUtils";
import { ChallengeStatus, ChallengeType } from "../types/enums";
import { PlusIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { challengeTypeInfo } from "../utils/challengeTypeUtils";

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
  description: string | null;
  type: ChallengeType;
  goal: number;
  reward: string;
  penalty: string;
  month: number;
  status: ChallengeStatus;
  taskType?: TaskType | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface ChallengeProgress {
  challenge: Challenge;
  progress: number;
  total: number;
  percentage: number;
}

interface StatsCardProps {
  onNewChallenge: () => void;
  currentChallenge: Challenge | null;
  isLoadingChallenge: boolean;
}

export default function StatsCard({
  onNewChallenge,
  currentChallenge,
  isLoadingChallenge,
}: StatsCardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [challengeProgress, setChallengeProgress] =
    useState<ChallengeProgress | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

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

  // Récupérer la progression du challenge lorsque currentChallenge change
  useEffect(() => {
    const fetchChallengeProgress = async () => {
      if (!currentChallenge) {
        setChallengeProgress(null);
        return;
      }

      setIsLoadingProgress(true);
      try {
        const response = await fetch("/api/challenges/current/progress");
        if (!response.ok) {
          throw new Error("Erreur lors du chargement de la progression");
        }

        const data = await response.json();
        setChallengeProgress(data);
      } catch (error) {
        console.error("Erreur:", error);
        setChallengeProgress(null);
      } finally {
        setIsLoadingProgress(false);
      }
    };

    fetchChallengeProgress();
  }, [currentChallenge]);

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
            {currentChallenge && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                En cours
              </span>
            )}
          </h3>

          {isLoadingChallenge ? (
            <div className="flex justify-center py-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
            </div>
          ) : currentChallenge ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="text-emerald-600 flex-shrink-0 bg-emerald-100 p-2 rounded-full">
                  {currentChallenge.type &&
                    challengeTypeInfo[currentChallenge.type].icon}
                </div>
                <div>
                  <h4 className="font-medium text-sage-800">
                    {currentChallenge.type &&
                      challengeTypeInfo[currentChallenge.type].title}
                  </h4>
                  {currentChallenge.description && (
                    <p className="text-sm text-sage-600">
                      {currentChallenge.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Barre de progression réelle */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      isLoadingProgress ? 0 : challengeProgress?.percentage || 0
                    }%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-sage-500 text-right">
                {isLoadingProgress ? (
                  <span className="inline-block w-4 h-4">
                    <span className="animate-pulse">...</span>
                  </span>
                ) : (
                  `Progression: ${challengeProgress?.progress || 0}/${
                    challengeProgress?.total || currentChallenge.goal
                  }`
                )}
              </p>

              <div className="bg-white/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-sage-600 flex items-center">
                    <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1"></span>
                    Objectif
                  </span>
                  <span className="text-sm font-medium text-sage-800">
                    {currentChallenge.goal}{" "}
                    {currentChallenge.type === ChallengeType.MONTHLY_TASKS
                      ? "tâches"
                      : currentChallenge.type === ChallengeType.STREAK_DAYS
                      ? "jours"
                      : ""}
                  </span>
                </div>

                {currentChallenge.taskType && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-sage-600 flex items-center">
                      <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1"></span>
                      Type de tâche
                    </span>
                    <span
                      className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                        getTaskTypeColor(currentChallenge.taskType).bg
                      } ${getTaskTypeColor(currentChallenge.taskType).text}`}
                    >
                      {currentChallenge.taskType}
                    </span>
                  </div>
                )}

                {currentChallenge.reward && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-sage-600 flex items-center">
                      <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1"></span>
                      Récompense
                    </span>
                    <span className="text-sm font-medium text-emerald-600">
                      {currentChallenge.reward}
                    </span>
                  </div>
                )}

                {currentChallenge.penalty && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-sage-600 flex items-center">
                      <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></span>
                      Pénalité
                    </span>
                    <span className="text-sm font-medium text-red-600">
                      {currentChallenge.penalty}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-3">
              <TrophyIcon className="h-8 w-8 text-sage-400 mb-2" />
              <p className="text-sm text-sage-600 mb-3">
                Aucun challenge en cours
              </p>
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
