"use client";

import { motion } from "framer-motion";
import MonthlyProgress from "../components/MonthlyProgress";
import { useEffect, useState } from "react";

interface Habit {
  date: string;
  completed: boolean;
}

export default function Historic() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const response = await fetch("/api/habits");
        const data = await response.json();
        setHabits(data);
      } catch (error) {
        console.error("Erreur lors du chargement des habitudes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHabits();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-sage-800 mb-8"
      >
        Historique de mes habitudes
      </motion.h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sage-600"></div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MonthlyProgress habits={habits} />
        </motion.div>
      )}
    </div>
  );
}
