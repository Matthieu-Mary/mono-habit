"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TaskType, ChallengeType } from "../types/enums";
import { getTaskTypeColor } from "../utils/taskTypeUtils";
import { PlusIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { challengeTypeInfo } from "../utils/challengeTypeUtils";
import {
  StatsCardProps,
  ChallengeProgress,
} from "../interfaces/challenges.interface";
import { CurrentMonthStats } from "../interfaces/currentMonthStats.interface";

export default function StatsCard({
  onNewChallenge,
  isLoadingChallenge,
  refreshTrigger = 0,
}: Readonly<Omit<StatsCardProps, "currentChallenge">>) {
  const [stats, setStats] = useState<CurrentMonthStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [challengeProgress, setChallengeProgress] =
    useState<ChallengeProgress | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
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
  }, [refreshTrigger]);

  // Récupérer la progression du challenge lorsque stats.challenge change ou refreshTrigger change
  useEffect(() => {
    const fetchChallengeProgress = async () => {
      if (!stats?.challenge) {
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
  }, [stats?.challenge, refreshTrigger]);

  const renderFavoriteTypes = () => {
    if (!stats?.favoriteTypes) return "Aucune tâche ce mois-ci";

    return stats.favoriteTypes.map((type) => (
      <span
        key={type}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
          getTaskTypeColor(type as TaskType).bg
        } ${getTaskTypeColor(type as TaskType).text}`}
      >
        <span>{getTaskTypeColor(type as TaskType).icon}</span>
        <span>{type}</span>
      </span>
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl p-8 shadow-lg relative"
    >
      <h2 className="text-2xl font-semibold text-sage-800 mb-6">
        Infos mois en cours
      </h2>
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
            <div className="flex flex-wrap gap-2 text-sage-800 justify-center">
              {isLoading ? "-" : renderFavoriteTypes()}
            </div>
          </div>
        </div>

        {/* Section Challenge */}
        <div className="bg-sage-50 py-4 px-5 rounded-xl">
          <h3 className="text-sm text-sage-600 mb-3 flex items-center justify-between">
            <span>Challenge du mois</span>
            {stats?.challenge && (
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  stats.challenge.status === "COMPLETED"
                    ? "bg-emerald-200 text-emerald-800"
                    : stats.challenge.status === "FAILED"
                    ? "bg-red-200 text-red-800"
                    : "bg-blue-400 text-white"
                }`}
              >
                {stats.challenge.status === "COMPLETED"
                  ? "Réussi"
                  : stats.challenge.status === "FAILED"
                  ? "Manqué"
                  : "En cours"}
              </span>
            )}
          </h3>

          {isLoadingChallenge ? (
            <div className="flex justify-center py-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
            </div>
          ) : stats?.challenge ? (
            <div className="space-y-3">
              <div
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  stats.challenge.status === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-800"
                    : stats.challenge.status === "FAILED"
                    ? "bg-red-100 text-red-800"
                    : stats.challenge.type &&
                      challengeTypeInfo[stats.challenge.type].bgColor
                } ${
                  stats.challenge.status === "ACTIVE" &&
                  stats.challenge.type &&
                  challengeTypeInfo[stats.challenge.type].textColor
                } ${
                  stats.challenge.type === ChallengeType.PERFECT_MONTH &&
                  stats.challenge.status === "ACTIVE"
                    ? "bg-gradient-to-br from-amber-50 via-amber-100 to-yellow-100 border border-amber-200 shadow-sm relative overflow-hidden"
                    : ""
                }`}
              >
                {stats.challenge.type === ChallengeType.PERFECT_MONTH && (
                  <>
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_rgba(251,191,36,0.15),transparent_70%)]"></div>
                    <div className="absolute -top-6 -right-6 w-12 h-12 bg-yellow-300 opacity-10 rounded-full blur-xl"></div>
                  </>
                )}
                <div
                  className={`flex-shrink-0 p-2 rounded-full ${
                    stats.challenge.status === "COMPLETED"
                      ? "bg-emerald-200 text-emerald-600"
                      : stats.challenge.status === "FAILED"
                      ? "bg-red-200 text-red-600"
                      : stats.challenge.type &&
                        `${challengeTypeInfo[stats.challenge.type].iconColor} ${
                          stats.challenge.type === ChallengeType.PERFECT_MONTH
                            ? "bg-gradient-to-r from-amber-200 to-yellow-300 shadow-md relative"
                            : "bg-white/80"
                        }`
                  }`}
                >
                  {stats.challenge.type &&
                    challengeTypeInfo[stats.challenge.type].icon}
                  {stats.challenge.type === ChallengeType.PERFECT_MONTH && (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                          initial={{
                            x: 0,
                            y: 0,
                            opacity: 0.8,
                          }}
                          animate={{
                            x: [0, ((i % 2 === 0 ? 15 : -15) * (i + 1)) / 3],
                            y: [-5, (-20 * (i + 1)) / 3],
                            opacity: [0.8, 0],
                          }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            delay: i * 0.1,
                            ease: "easeOut",
                          }}
                        />
                      ))}
                    </>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4
                      className={`font-medium ${
                        stats.challenge.status === "COMPLETED"
                          ? "text-emerald-800"
                          : stats.challenge.status === "FAILED"
                          ? "text-red-800"
                          : stats.challenge.type &&
                            challengeTypeInfo[stats.challenge.type].textColor
                      }`}
                    >
                      {stats.challenge.type &&
                        challengeTypeInfo[stats.challenge.type].title}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    stats.challenge.status === "COMPLETED"
                      ? "bg-emerald-500"
                      : stats.challenge.status === "FAILED"
                      ? "bg-red-500"
                      : stats.challenge.type === ChallengeType.MONTHLY_TASKS
                      ? "bg-purple-500"
                      : stats.challenge.type === ChallengeType.STREAK_DAYS
                      ? "bg-orange-500"
                      : stats.challenge.type === ChallengeType.PERFECT_MONTH
                      ? "bg-gradient-to-r from-amber-400 to-yellow-500 relative"
                      : "bg-blue-500"
                  }`}
                  style={{
                    width: `${
                      isLoadingProgress ? 0 : challengeProgress?.percentage || 0
                    }%`,
                  }}
                >
                  {stats.challenge.type === ChallengeType.PERFECT_MONTH && (
                    <motion.div
                      className="absolute inset-0 w-full h-full"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                        backgroundSize: "200% 100%",
                      }}
                      animate={{
                        backgroundPosition: ["100% 0%", "-100% 0%"],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  )}
                </div>
              </div>
              <p className="text-xs text-sage-500 text-right">
                {isLoadingProgress ? (
                  <span className="inline-block w-4 h-4">
                    <span className="animate-pulse">...</span>
                  </span>
                ) : (
                  `Progression: ${challengeProgress?.progress || 0}/${
                    challengeProgress?.total || stats.challenge.goal
                  }`
                )}
              </p>

              <div
                className={`rounded-lg p-3 space-y-2 ${
                  stats.challenge.type === ChallengeType.PERFECT_MONTH
                    ? "bg-gradient-to-br from-amber-50 to-yellow-100 border border-amber-200"
                    : "bg-white/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs flex items-center ${
                      stats.challenge.type &&
                      challengeTypeInfo[stats.challenge.type].textColor
                    }`}
                  >
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${
                        stats.challenge.type === ChallengeType.MONTHLY_TASKS
                          ? "bg-emerald-500"
                          : stats.challenge.type === ChallengeType.STREAK_DAYS
                          ? "bg-orange-500"
                          : stats.challenge.type === ChallengeType.PERFECT_MONTH
                          ? "bg-amber-500"
                          : "bg-blue-500"
                      }`}
                    ></span>
                    Objectif
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      stats.challenge.type &&
                      challengeTypeInfo[stats.challenge.type].textColor
                    }`}
                  >
                    {stats.challenge.goal}{" "}
                    {stats.challenge.type === ChallengeType.MONTHLY_TASKS
                      ? "tâches"
                      : stats.challenge.type === ChallengeType.STREAK_DAYS
                      ? "jours"
                      : stats.challenge.type === ChallengeType.PERFECT_MONTH
                      ? "jours parfaits"
                      : ""}
                  </span>
                </div>

                {stats.challenge.taskType && (
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs flex items-center ${
                        stats.challenge.type &&
                        challengeTypeInfo[stats.challenge.type].textColor
                      }`}
                    >
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${
                          stats.challenge.type === ChallengeType.TASK_TYPE_GOAL
                            ? "bg-yellow-500"
                            : stats.challenge.type &&
                              challengeTypeInfo[stats.challenge.type].iconColor
                        }`}
                      ></span>
                      Type de tâche
                    </span>
                    <span
                      className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                        getTaskTypeColor(stats.challenge.taskType).bg
                      } ${getTaskTypeColor(stats.challenge.taskType).text}`}
                    >
                      {stats.challenge.taskType}
                    </span>
                  </div>
                )}

                {stats.challenge.reward && (
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs flex items-center ${
                        stats.challenge.type &&
                        challengeTypeInfo[stats.challenge.type].textColor
                      }`}
                    >
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${
                          stats.challenge.type === ChallengeType.PERFECT_MONTH
                            ? "bg-yellow-500"
                            : "bg-emerald-500"
                        }`}
                      ></span>
                      Récompense
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        stats.challenge.type === ChallengeType.PERFECT_MONTH
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {stats.challenge.reward}
                    </span>
                  </div>
                )}

                {stats.challenge.penalty && (
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs flex items-center ${
                        stats.challenge.type &&
                        challengeTypeInfo[stats.challenge.type].textColor
                      }`}
                    >
                      <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></span>
                      Pénalité
                    </span>
                    <span className="text-sm font-medium text-red-600">
                      {stats.challenge.penalty}
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
