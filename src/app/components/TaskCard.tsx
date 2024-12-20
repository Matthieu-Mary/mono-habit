"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface Task {
  id?: string;
  title: string;
  description?: string;
}

export default function TaskCard({ task }: { task: Task }) {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = async () => {
    if (!task.id) return;

    try {
      const response = await fetch(`/api/habits/${task.id}/complete`, {
        method: "POST",
      });

      if (response.ok) {
        setIsCompleted(true);
      }
    } catch (error) {
      console.error("Erreur lors de la complétion de la tâche:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-40 bg-gradient-to-br from-emerald-50 to-sage-50 rounded-xl p-6 relative overflow-hidden"
    >
      {/* Cercle décoratif */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-100 rounded-full opacity-50" />
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-sage-200 rounded-full opacity-30" />
      <div className="absolute right-1 top-1 bg-emerald-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
        🕐
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <h3 className="text-2xl font-semibold text-sage-800 mb-2">
            {task.title}
          </h3>
        </div>

        {task.description && (
          <p className="text-sage-600 text-sm line-clamp-2">
            {task.description}
          </p>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleComplete}
        className={`absolute right-4 top-4 p-2 rounded-full ${
          isCompleted
            ? "bg-emerald-500 text-white"
            : "bg-sage-100 text-sage-600 hover:bg-sage-200"
        }`}
      >
        {isCompleted ? "✓" : "○"}
      </motion.button>
    </motion.div>
  );
}
