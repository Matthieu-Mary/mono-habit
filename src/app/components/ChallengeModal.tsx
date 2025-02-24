"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
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
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState(0);
  const [reward, setReward] = useState("");
  const [penalty, setPenalty] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [taskType, setTaskType] = useState<TaskType | undefined>();

  const handleTypeSelect = (selectedType: ChallengeType) => {
    setType(selectedType);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          type,
          goal,
          reward,
          penalty,
          startDate,
          endDate,
          taskType:
            type === ChallengeType.TASK_TYPE_GOAL ? taskType : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du challenge");
      }

      // Réinitialiser le formulaire
      setStep(1);
      setType(undefined);
      setTitle("");
      setDescription("");
      setGoal(0);
      setReward("");
      setPenalty("");
      setStartDate("");
      setEndDate("");
      setTaskType(undefined);

      onClose();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleClose = () => {
    // Réinitialiser le formulaire
    setStep(1);
    setType(undefined);
    setTitle("");
    setDescription("");
    setGoal(0);
    setReward("");
    setPenalty("");
    setStartDate("");
    setEndDate("");
    setTaskType(undefined);

    onClose();
  };

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
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium leading-6 text-sage-900">
                {step === 1
                  ? "Choisir un type de challenge"
                  : "Créer un nouveau challenge"}
              </h3>
              <button
                type="button"
                className="rounded-md text-sage-400 hover:text-sage-500"
                onClick={handleClose}
              >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {step === 1 ? (
              <ChallengeTypeInfo onSelect={handleTypeSelect} />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-sage-700"
                  >
                    Titre
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md border-sage-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-sage-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-sage-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="goal"
                    className="block text-sm font-medium text-sage-700"
                  >
                    Objectif
                  </label>
                  <input
                    type="number"
                    id="goal"
                    value={goal}
                    onChange={(e) => setGoal(parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-sage-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    required
                    min="1"
                  />
                </div>

                {type === ChallengeType.TASK_TYPE_GOAL && (
                  <div>
                    <label
                      htmlFor="taskType"
                      className="block text-sm font-medium text-sage-700"
                    >
                      Type de tâche
                    </label>
                    <select
                      id="taskType"
                      value={taskType}
                      onChange={(e) => setTaskType(e.target.value as TaskType)}
                      className="mt-1 block w-full rounded-md border-sage-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
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

                <div>
                  <label
                    htmlFor="reward"
                    className="block text-sm font-medium text-sage-700"
                  >
                    Récompense
                  </label>
                  <input
                    type="text"
                    id="reward"
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    className="mt-1 block w-full rounded-md border-sage-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    required
                    placeholder="Ex: Un dîner au restaurant"
                  />
                </div>

                <div>
                  <label
                    htmlFor="penalty"
                    className="block text-sm font-medium text-sage-700"
                  >
                    Pénalité
                  </label>
                  <input
                    type="text"
                    id="penalty"
                    value={penalty}
                    onChange={(e) => setPenalty(e.target.value)}
                    className="mt-1 block w-full rounded-md border-sage-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    required
                    placeholder="Ex: Don de 20€ à une association"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="startDate"
                      className="block text-sm font-medium text-sage-700"
                    >
                      Date de début
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1 block w-full rounded-md border-sage-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="endDate"
                      className="block text-sm font-medium text-sage-700"
                    >
                      Date de fin
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-1 block w-full rounded-md border-sage-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="rounded-md border border-sage-300 bg-white px-4 py-2 text-sm font-medium text-sage-700 hover:bg-sage-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    onClick={() => setStep(1)}
                  >
                    Retour
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  >
                    Créer
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
