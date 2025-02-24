"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChallengeType, ChallengeStatus } from "../types/enums";
import ChallengeModal from "../components/ChallengeModal";
import { PlusIcon, TrophyIcon } from "@heroicons/react/24/outline";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  goal: number;
  reward: string;
  penalty: string;
  startDate: string;
  endDate: string;
  status: ChallengeStatus;
}

export default function ChallengePage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ChallengeType | undefined>(
    undefined
  );

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await fetch("/api/challenges");
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des challenges");
      const data = await response.json();
      setChallenges(data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChallenge = async (id: string) => {
    try {
      const response = await fetch(`/api/challenges?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Erreur lors de la suppression");
      await fetchChallenges();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleUpdateStatus = async (id: string, status: ChallengeStatus) => {
    try {
      const response = await fetch("/api/challenges", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });
      if (!response.ok) throw new Error("Erreur lors de la mise à jour");
      await fetchChallenges();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const getStatusColor = (status: ChallengeStatus) => {
    switch (status) {
      case ChallengeStatus.ACTIVE:
        return "bg-blue-100 text-blue-800";
      case ChallengeStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      case ChallengeStatus.FAILED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen pb-48 bg-sage-50 p-8 lg:pb-16">
      <div className="flex justify-between items-center mb-8 mt-12 lg:ml-16 lg:mb-6 lg:mt-0">
        <h1 className="text-2xl font-bold text-sage-800 lg:text-4xl">
          Mes Challenges
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nouveau Challenge
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <TrophyIcon className="mx-auto h-12 w-12 text-sage-400" />
          <h3 className="mt-2 text-lg font-medium text-sage-900">
            Aucun challenge
          </h3>
          <p className="mt-1 text-sage-500">
            Commencez par créer votre premier challenge !
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {challenges.map((challenge) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-sage-800">
                  {challenge.title}
                </h2>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    challenge.status
                  )}`}
                >
                  {challenge.status === ChallengeStatus.ACTIVE
                    ? "En cours"
                    : challenge.status === ChallengeStatus.COMPLETED
                    ? "Réussi"
                    : "Échoué"}
                </span>
              </div>
              <p className="text-sage-600 mb-4">{challenge.description}</p>
              <div className="space-y-2 text-sm text-sage-500">
                <p>Objectif : {challenge.goal}</p>
                <p>
                  Récompense :{" "}
                  <span className="text-emerald-600">{challenge.reward}</span>
                </p>
                <p>
                  Pénalité :{" "}
                  <span className="text-red-600">{challenge.penalty}</span>
                </p>
                <p>
                  Du {formatDate(challenge.startDate)} au{" "}
                  {formatDate(challenge.endDate)}
                </p>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                {challenge.status === ChallengeStatus.ACTIVE && (
                  <>
                    <button
                      onClick={() =>
                        handleUpdateStatus(
                          challenge.id,
                          ChallengeStatus.COMPLETED
                        )
                      }
                      className="px-3 py-1 text-sm text-emerald-700 hover:bg-emerald-100 rounded-md transition-colors"
                    >
                      Réussi
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatus(challenge.id, ChallengeStatus.FAILED)
                      }
                      className="px-3 py-1 text-sm text-red-700 hover:bg-red-100 rounded-md transition-colors"
                    >
                      Échoué
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDeleteChallenge(challenge.id)}
                  className="px-3 py-1 text-sm text-sage-700 hover:bg-sage-100 rounded-md transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ChallengeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedType(undefined);
          fetchChallenges();
        }}
        selectedType={selectedType}
      />
    </div>
  );
}
