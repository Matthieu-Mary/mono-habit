"use client";

import { useAuth } from "../hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import TaskModal from "../components/TaskModal";
import TaskCard from "../components/TaskCard";

export default function DashboardPage() {
  const { session, status } = useAuth();
  const [timeProgress, setTimeProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<{
    id: string;
    title: string;
    description?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
            }
          : null
      );
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
      <header className="mb-4 ml-16 lg:mb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div className="flex flex-col items-center w-full lg:flex-row lg:justify-between lg:items-center">
            <h1 className="text-4xl font-bold text-sage-800">
              Bonjour{" "}
              <span className="text-emerald-600">{session?.user?.name}</span>
            </h1>
            <p className="text-3xl font-mono text-sage-700 mt-2 lg:mt-0">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            {/* <div className="text-3xl font-mono text-sage-700">
              {currentTime}
            </div> */}
          </div>
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

          {currentTask ? (
            <TaskCard task={currentTask} />
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

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTodayTask}
      />
    </div>
  );
}
