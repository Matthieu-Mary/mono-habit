"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Status } from "@prisma/client";
import { TaskModalProps } from "./TaskModal";

interface TaskDetailsModalProps extends TaskModalProps {
  task: {
    title: string;
    description?: string;
    status: Status;
    date: string;
  } | null;
  isFutureDate: boolean;
}

export default function TaskDetailsModal({
  isOpen,
  onClose,
  onSuccess,
  task,
  isFutureDate,
}: Readonly<TaskDetailsModalProps>) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: task?.title ?? "",
    description: task?.description ?? "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Mettre à jour formData quand task change
  useEffect(() => {
    setFormData({
      title: task?.title ?? "",
      description: task?.description ?? "",
    });
  }, [task]);

  const handleScheduleTask = async () => {
    try {
      setIsLoading(true);

      // Si on est en mode édition, on fait un PATCH
      // Sinon, on crée une nouvelle tâche avec POST
      const method = isEditing ? "PATCH" : "POST";
      const endpoint = isEditing
        ? `/api/habits/${task?.id}` // Il faudra ajouter l'ID dans l'interface TaskDetails
        : "/api/habits";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          date: task?.date,
        }),
      });

      if (!response.ok) {
        throw new Error(
          isEditing
            ? "Erreur lors de la modification de la tâche"
            : "Erreur lors de la programmation de la tâche"
        );
      }

      if (onSuccess) {
        await onSuccess();
      }

      onClose();
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Détermine si on peut éditer la tâche (uniquement si PENDING)
  const canEdit = task?.status === "PENDING";

  // Fonction pour obtenir la couleur de fond en fonction du statut
  const getBackgroundColor = (status?: Status) => {
    const colorMap = {
      COMPLETED: "bg-emerald-100",
      MISSED: "bg-red-100",
      PENDING: "bg-sky-100",
      NOT_SCHEDULED: "bg-gray-100",
    };
    return colorMap[status as keyof typeof colorMap] || "bg-gray-100";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full mx-4 relative text-sage-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`absolute -top-2 -left-2 w-full h-full ${getBackgroundColor(
                task?.status
              )} rounded-3xl -z-10 transform rotate-1`}
            ></div>

            <h2 className="text-2xl font-bold text-sage-800 mb-6">
              {!task?.title
                ? "Programmer une tâche"
                : isEditing
                ? "Modifier la tâche"
                : "Détails de la tâche"}
            </h2>

            {!task?.title || isEditing ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sage-700 mb-2" htmlFor="title">
                    Titre
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-sage-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="Titre de la tâche"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sage-700 mb-2"
                    htmlFor="description"
                  >
                    Description (optionnelle)
                  </label>
                  <motion.textarea
                    whileFocus={{ scale: 1.02 }}
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-sage-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none h-32"
                    placeholder="Description de la tâche"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleScheduleTask}
                    className="flex-1 bg-emerald-500 text-white py-3 rounded-xl hover:bg-emerald-600 transition-colors"
                  >
                    {isEditing ? "Modifier" : "Programmer"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (isEditing) {
                        setIsEditing(false);
                        setFormData({
                          title: task?.title ?? "",
                          description: task?.description ?? "",
                        });
                      } else {
                        onClose();
                      }
                    }}
                    className="flex-1 bg-sage-100 text-sage-700 py-3 rounded-xl hover:bg-sage-200 transition-colors"
                  >
                    Annuler
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sage-700">{task.title}</h3>
                  {task.description && (
                    <p className="mt-2 text-sage-600">{task.description}</p>
                  )}
                </div>
                <div className="pt-4 border-t border-sage-200">
                  <span className="text-sm text-sage-500">
                    Status:{" "}
                    {task.status === "COMPLETED"
                      ? "Complétée"
                      : task.status === "MISSED"
                      ? "Manquée"
                      : task.status === "PENDING"
                      ? "Programmée"
                      : "Non programmée"}
                  </span>
                </div>
                <div className="flex gap-4">
                  {canEdit && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsEditing(true)}
                      className="flex-1 bg-emerald-500 text-white py-3 rounded-xl hover:bg-emerald-600 transition-colors"
                    >
                      Modifier
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 bg-sage-100 text-sage-700 py-3 rounded-xl hover:bg-sage-200 transition-colors"
                  >
                    Fermer
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
