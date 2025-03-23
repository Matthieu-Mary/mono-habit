"use client";

import { motion } from "framer-motion";
import Loader from "./Loader";
import { TaskType } from "../types/enums";
import { getTaskTypeColor } from "../utils/taskTypeUtils";

interface Task {
  id?: string;
  title: string;
  description?: string;
  type?: string;
}

export default function TaskCard({
  task,
  isCompleted,
  isLoading,
  onComplete,
}: {
  readonly task: Task;
  readonly isCompleted: boolean;
  readonly isLoading: boolean;
  readonly onComplete: () => Promise<void>;
}) {
  // Convertir le type de string à TaskType enum pour l'utiliser avec getTaskTypeColor
  const getTaskType = (type?: string): TaskType => {
    if (!type) return TaskType.TRAVAIL; // Valeur par défaut

    switch (type.toUpperCase()) {
      case TaskType.SPORT:
        return TaskType.SPORT;
      case TaskType.SANTE:
        return TaskType.SANTE;
      case TaskType.TRAVAIL:
        return TaskType.TRAVAIL;
      case TaskType.LOISIRS:
        return TaskType.LOISIRS;
      default:
        return TaskType.TRAVAIL;
    }
  };

  // Formater le nom du type de tâche (première lettre majuscule, reste en minuscule)
  const formatTaskType = (type?: string): string => {
    if (!type) return "";

    const formattedType = type.toLowerCase();
    return formattedType.charAt(0).toUpperCase() + formattedType.slice(1);
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl z-30 flex items-center justify-center">
          <Loader size="md" />
        </div>
      )}

      {/* Overlay qui apparaît quand la tâche est complétée */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-20 group"
        >
          <div className="relative h-full">
            {/* Fond opaque avec effet de flou */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl group-hover:opacity-0 transition-opacity duration-300" />

            {/* Contenu de l'overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 group-hover:opacity-0 transition-opacity duration-300">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-emerald-100 rounded-full p-4"
              >
                <span className="text-4xl">🎉</span>
              </motion.div>
              <p className="text-emerald-600 font-semibold text-lg">
                Tâche accomplie !
              </p>
              <p className="text-sage-600 text-sm">
                Survolez pour voir les détails
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Carte originale */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-60 bg-gradient-to-br from-emerald-50 to-sage-50 rounded-xl p-6 relative overflow-hidden"
      >
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

            {task.type && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 mb-3 ${
                  getTaskTypeColor(getTaskType(task.type)).bg
                } ${getTaskTypeColor(getTaskType(task.type)).text}`}
              >
                <span className="mr-1">
                  {getTaskTypeColor(getTaskType(task.type)).icon}
                </span>
                <span>{formatTaskType(task.type)}</span>
              </motion.div>
            )}

            {task.description && (
              <p className="text-sage-600 text-sm line-clamp-3 mb-2 mt-2">
                {task.description}
              </p>
            )}
          </div>

          <motion.button
            onClick={onComplete}
            disabled={isCompleted || isLoading}
            className={`group relative w-[180px] px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 overflow-hidden mx-auto
              ${
                isCompleted
                  ? "bg-emerald-100 text-emerald-700 cursor-not-allowed"
                  : "bg-white text-emerald-600 border-2 border-emerald-500 hover:text-white"
              }`}
          >
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
    </div>
  );
}
