"use client";

import { useAuth } from "../hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import TaskModal from "../components/TaskModal";
import TaskCard from "../components/TaskCard";
import Loader from "../components/Loader";
import Celebration from "../components/Celebration";
import MonthlyProgress from "../components/MonthlyProgress";
import { MonthlyResponseData } from "../interfaces/monthData.interface";
import StatsCard from "../components/StatsCard";
import ChallengeModal from "../components/ChallengeModal";
import { Challenge } from "../interfaces/challenges.interface";

function calculateTimeRemaining(): string {
  const now = new Date();
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59
  );

  const diffInMilliseconds = endOfDay.getTime() - now.getTime();
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));

  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;

  if (hours === 0) {
    return `Il vous reste ${minutes} minutes pour terminer la tâche du jour`;
  } else if (minutes === 0) {
    return `Il vous reste ${hours} heures pour terminer la tâche du jour`;
  } else {
    return `Il vous reste ${hours} heures et ${minutes} minutes pour terminer la tâche du jour`;
  }
}

export default function DashboardPage() {
  const { session, status } = useAuth();
  const [timeProgress, setTimeProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [showTimeTooltip, setShowTimeTooltip] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentTask, setCurrentTask] = useState<{
    id: string;
    title: string;
    description?: string;
    type: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isMonthlyProgressLoading, setIsMonthlyProgressLoading] =
    useState(false);

  const [monthlyData, setMonthlyData] = useState<MonthlyResponseData | null>(
    null
  );

  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(
    null
  );
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fonction pour récupérer les statistiques
  const fetchStats = useCallback(async () => {
    setIsLoadingStatus(true);
    try {
      const response = await fetch("/api/habits/stats");
      if (!response.ok) throw new Error("Erreur lors du chargement des stats");
      // Aucune action nécessaire ici car StatsCard fait son propre appel API
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    // Mettre à jour le temps restant seulement si la tâche n'est pas complétée
    if (!isLoading && !isCompleted) {
      setTimeRemaining(calculateTimeRemaining());

      // Mettre à jour toutes les minutes
      const interval = setInterval(() => {
        setTimeRemaining(calculateTimeRemaining());
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [isCompleted, isLoading]);

  const fetchTodayTask = useCallback(async () => {
    try {
      const response = await fetch("/api/habits/today");
      if (!response.ok) throw new Error("Erreur lors du chargement");

      const data = await response.json();
      setCurrentTask(
        data.habit
          ? {
              id: data.habit.id,
              title: data.habit.name,
              description: data.habit.description,
              type: data.habit.type,
            }
          : null
      );
      setIsCompleted(data.completed);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayTask();
  }, [fetchTodayTask]);

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

  const handleCompleteTask = async () => {
    if (!currentTask?.id) return;

    setIsLoading(true);
    setIsLoadingStatus(true);
    setIsMonthlyProgressLoading(true);

    try {
      const response = await fetch(`/api/habits/${currentTask.id}/complete`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la complétion de la tâche");
      }

      setIsCompleted(true);
      setShowCelebration(true);
      await fetchTodayTask();
      await fetchMonthlyHabits();
      await fetchStats();
      await fetchCurrentChallenge();

      // Force le rafraîchissement de StatsCard en incrémentant le trigger
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingStatus(false);
      setIsMonthlyProgressLoading(false);
    }
  };

  // On récupère les habitudes du mois en cours pour les afficher dans le graphique
  const fetchMonthlyHabits = useCallback(async () => {
    try {
      const response = await fetch("/api/habits/monthly");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            "Erreur lors du chargement des habitudes du mois en cours"
        );
      }
      const data = await response.json();
      setMonthlyData(data || null);
    } catch (error) {
      console.error("Erreur détaillée:", error);
      // Initialiser avec un tableau vide en cas d'erreur
      setMonthlyData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonthlyHabits();
  }, [fetchMonthlyHabits]);

  const handleMonthlySuccess = useCallback(async () => {
    setIsMonthlyProgressLoading(true);
    try {
      await fetchMonthlyHabits();
      await fetchTodayTask();
    } finally {
      setIsMonthlyProgressLoading(false);
    }
  }, [fetchMonthlyHabits, fetchTodayTask]);

  // Fonction pour récupérer le challenge du mois en cours
  const fetchCurrentChallenge = useCallback(async () => {
    setIsLoadingChallenge(true);
    try {
      const response = await fetch("/api/challenges/current");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement du challenge actuel");
      }
      const data = await response.json();
      setCurrentChallenge(data.challenge || null);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoadingChallenge(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentChallenge();
  }, [fetchCurrentChallenge]);

  const handleChallengeSuccess = useCallback(async () => {
    // Mettre à jour le challenge
    await fetchCurrentChallenge();
    // Forcer le rafraîchissement des stats
    setRefreshTrigger((prev) => prev + 1);
    // Mettre à jour les autres données qui pourraient être affectées
    await fetchStats();
    await fetchMonthlyHabits();
  }, [fetchCurrentChallenge, fetchStats, fetchMonthlyHabits]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };

  return (
    <div className="min-h-screen pb-48 bg-sage-50 p-8 lg:pb-16">
      <Celebration
        isVisible={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />
      {/* En-tête */}
      <header className="mb-4 mt-12 lg:ml-16 lg:mb-6 lg:mt-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div className="flex flex-col items-center w-full lg:flex-row lg:justify-between lg:items-center">
            <h1 className="text-2xl font-bold text-sage-800 lg:text-4xl">
              Bonjour{" "}
              <span className="text-emerald-600">{session?.user?.name}</span>
            </h1>
            <p className="text-xl font-mono text-sage-700 mt-2 lg:mt-0 lg:text-3xl">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
        </motion.div>
      </header>

      {/* Barre de progression de la journée */}
      <div className="relative">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            className="mb-6 bg-sage-200 rounded-full h-4 overflow-hidden cursor-pointer"
            onMouseEnter={() => setShowTimeTooltip(true)}
            onMouseLeave={() => setShowTimeTooltip(false)}
            onMouseMove={handleMouseMove}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${timeProgress}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
            />
            {showTimeTooltip && (
              <div
                className="fixed bg-white px-4 py-2 rounded-lg shadow-lg text-sage-700 font-mono z-10 pointer-events-none"
                style={{
                  left: `${mousePosition.x}px`,
                  top: `${mousePosition.y}px + 300px`,
                }}
              >
                {currentTime}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-4 shadow-lg mb-8 text-center lg:text-left"
      >
        <div className="text-sm font-mono text-sage-700 lg:text-lg">
          {isLoadingStatus || isLoading ? (
            <Loader size="sm" />
          ) : isCompleted ? (
            <>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 font-bold">
                ✨ Félicitations ✨
              </span>
              , vous avez accompli votre objectif du jour !
            </>
          ) : (
            timeRemaining
          )}
        </div>
      </motion.div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8 lg:h-full">
          {/* Tâche du jour */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg relative"
          >
            <h2 className="text-2xl font-semibold text-sage-800 mb-6">
              Tâche du jour
            </h2>

            {isLoading ? (
              <div className="h-60 flex items-center justify-center">
                <Loader size="md" />
              </div>
            ) : currentTask ? (
              <TaskCard
                task={{
                  id: currentTask.id,
                  title: currentTask.title,
                  description: currentTask.description,
                  type: currentTask.type,
                }}
                isCompleted={isCompleted}
                isLoading={isLoading}
                onComplete={handleCompleteTask}
              />
            ) : (
              <div className="flex items-center justify-center h-40 border-2 border-dashed border-sage-300 rounded-xl">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors"
                  onClick={() => setIsModalOpen(true)}
                >
                  + Ajouter une tâche
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* Remplacer le bloc infos par le nouveau composant */}
          <StatsCard
            onNewChallenge={() => setIsChallengeModalOpen(true)}
            isLoadingChallenge={isLoadingChallenge}
            refreshTrigger={refreshTrigger}
            currentChallenge={currentChallenge}
          />
        </div>

        {/* Historique des habitudes */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="h-full"
        >
          <div className="h-full">
            {isMonthlyProgressLoading ? (
              <div className="bg-white rounded-2xl p-6 shadow-lg h-full flex items-center justify-center">
                <div className="text-center">
                  <Loader size="lg" />
                  <p className="mt-4 text-sage-600">
                    Mise à jour du calendrier...
                  </p>
                </div>
              </div>
            ) : monthlyData ? (
              <MonthlyProgress
                month={monthlyData.month}
                year={monthlyData.year}
                daysInMonth={monthlyData.daysInMonth}
                habits={monthlyData.habits}
                onSuccess={handleMonthlySuccess}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-white">
                <Loader size="lg" />
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleMonthlySuccess}
      />

      <ChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        onSuccess={handleChallengeSuccess}
      />
    </div>
  );
}
