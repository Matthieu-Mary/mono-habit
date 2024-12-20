"use client";

import { motion } from "framer-motion";

interface Task {
  id?: string;
  title: string;
  description?: string;
}

export default function TaskCard({
  task,
  isCompleted,
}: {
  readonly task: Task;
  readonly isCompleted: boolean;
}) {
 

  const handleComplete = async () => {
    if (!task.id) return;

    try {
      await fetch(`/api/habits/${task.id}/complete`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Erreur lors de la complétion de la tâche:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-60 bg-gradient-to-br from-emerald-50 to-sage-50 rounded-xl p-6 relative overflow-hidden"
    >
      {/* Cercle décoratif */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-100 rounded-full opacity-50" />
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-sage-200 rounded-full opacity-30" />
      <div className="absolute right-1 top-1 bg-emerald-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
        {isCompleted ? "✓" : "🕐"}
      </div>

      <div className="relative z-10 h-full flex flex-col">
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className="text-2xl font-semibold text-sage-800 mb-2">
              {task.title}
            </h3>
          </div>

          {task.description && (
            <p className="text-sage-600 text-sm line-clamp-2 mb-2 mt-4">
              {task.description}
            </p>
          )}
        </div>

        <motion.button
          onClick={handleComplete}
          disabled={isCompleted}
          className={`group relative w-[180px] px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 overflow-hidden mx-auto
    ${
      isCompleted
        ? "bg-emerald-100 text-emerald-700 cursor-not-allowed"
        : "bg-white text-emerald-600 border-2 border-emerald-500 hover:text-white"
    }`}
        >
          {/* Span "effet vague" affiché seulement si non complétée */}
          {!isCompleted && (
            <span
              className="absolute bottom-0 left-0 mb-9 ml-9 h-48 w-48
                 -translate-x-full translate-y-full rotate-[-40deg]
                 rounded bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600
                 transition-all duration-500 ease-out
                 group-hover:mb-32 group-hover:ml-0 group-hover:translate-x-0"
            />
          )}

          <span className="relative z-10">✓</span>
          <span className="relative z-10">
            {isCompleted ? "Tâche complétée" : "Valider la tâche"}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}
