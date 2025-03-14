"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ChallengeType, TaskType } from "../types/enums";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ChallengeTypeInfo from "./ChallengeTypeInfo";

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedType?: ChallengeType;
}

export default function ChallengeModal({
  isOpen,
  onClose,
  selectedType: initialType,
}: ChallengeModalProps) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<ChallengeType | undefined>(initialType);
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState(0);
  const [reward, setReward] = useState("");
  const [penalty, setPenalty] = useState("");
  const [taskType, setTaskType] = useState<TaskType | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  // Réinitialiser le type si initialType change
  useEffect(() => {
    if (initialType) {
      setType(initialType);
      setStep(2);
    }
  }, [initialType]);

  const handleTypeSelect = (selectedType: ChallengeType) => {
    setType(selectedType);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Préparer les données selon le type de challenge
      const challengeData: any = {
        type,
        reward,
        penalty,
      };

      // Ajouter les champs spécifiques selon le type de challenge
      if (
        type === ChallengeType.MONTHLY_TASK_GOAL ||
        type === ChallengeType.STREAK_GOAL ||
        type === ChallengeType.TASK_TYPE_GOAL
      ) {
        challengeData.goal = goal;
      }

      if (type === ChallengeType.TASK_TYPE_GOAL) {
        challengeData.taskType = taskType;
      }

      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(challengeData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du challenge");
      }

      // Réinitialiser le formulaire
      resetForm();
      onClose();
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setType(undefined);
    setTitle("");
    setGoal(0);
    setReward("");
    setPenalty("");
    setTaskType(undefined);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Animation des particules en arrière-plan (comme dans TaskModal)
  const particles = Array.from({ length: 20 }).map((_, i) => (
    <motion.div
      key={i}
      className="absolute w-2 h-2 bg-emerald-200 rounded-full"
      initial={{
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      }}
      animate={{
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration: Math.random() * 5 + 3,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  ));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={handleClose}
        >
          {/* Particules d'arrière-plan */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles}
          </div>

          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl p-8 shadow-xl sm:max-w-md md:max-w-2xl lg:max-w-4xl w-full mx-4 relative text-sage-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-2 -left-2 w-full h-full bg-emerald-100 rounded-3xl -z-10 transform rotate-1"></div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-sage-800">
                {step === 1
                  ? "Choisir un type de challenge"
                  : "Nouveau challenge"}
              </h2>
              <button
                type="button"
                className="text-sage-400 hover:text-sage-500"
                onClick={handleClose}
              >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {step === 1 ? (
              <ChallengeTypeInfo onSelect={handleTypeSelect} />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Champ Objectif pour les types qui en ont besoin */}
                {(type === ChallengeType.MONTHLY_TASK_GOAL ||
                  type === ChallengeType.STREAK_GOAL ||
                  type === ChallengeType.TASK_TYPE_GOAL) && (
                  <div>
                    <label className="block text-sage-700 mb-2" htmlFor="goal">
                      Objectif
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      type="number"
                      id="goal"
                      value={goal}
                      onChange={(e) => setGoal(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 rounded-xl border border-sage-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                      required
                      min="1"
                    />
                  </div>
                )}

                {/* Champ Type de tâche pour TASK_TYPE_GOAL */}
                {type === ChallengeType.TASK_TYPE_GOAL && (
                  <div>
                    <label
                      className="block text-sage-700 mb-2"
                      htmlFor="taskType"
                    >
                      Type de tâche
                    </label>
                    <select
                      id="taskType"
                      value={taskType}
                      onChange={(e) => setTaskType(e.target.value as TaskType)}
                      className="w-full px-4 py-3 rounded-xl border border-sage-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                      required
                    >
                      <option value="">Sélectionner un type</option>
                      {Object.values(TaskType).map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Champ Récompense (optionnel pour tous) */}
                <div>
                  <label className="block text-sage-700 mb-2" htmlFor="reward">
                    Récompense (optionnelle)
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    id="reward"
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-sage-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="Ex: Un dîner au restaurant"
                  />
                </div>

                {/* Champ Pénalité (optionnel pour tous) */}
                <div>
                  <label className="block text-sage-700 mb-2" htmlFor="penalty">
                    Pénalité (optionnelle)
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    id="penalty"
                    value={penalty}
                    onChange={(e) => setPenalty(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-sage-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="Ex: Don de 20€ à une association"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-sage-100 text-sage-700 py-3 rounded-xl hover:bg-sage-200 transition-colors"
                  >
                    Retour
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-emerald-500 text-white py-3 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      "Créer"
                    )}
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
