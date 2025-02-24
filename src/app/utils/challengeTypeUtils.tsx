import { ChallengeType } from "../types/enums";

export const challengeTypeInfo = {
  [ChallengeType.MONTHLY_TASKS]: {
      title: "Objectif mensuel de tâches",
      description: "Accomplissez un certain nombre de tâches dans le mois",
      example: "Exemple : Réaliser 20 tâches ce mois-ci",
      icon: "📊",
    },
    [ChallengeType.STREAK_DAYS]: {
      title: "Série de jours consécutifs",
      description: "Maintenez une série de jours avec des tâches accomplies",
      example: "Exemple : 7 jours consécutifs avec au moins une tâche",
      icon: "🔥",
    },
    [ChallengeType.PERFECT_MONTH]: {
      title: "Mois parfait",
      description: "Accomplissez toutes vos tâches pendant un mois entier",
      example: "Exemple : Aucune tâche manquée en mars",
      icon: "⭐",
    },
    [ChallengeType.TASK_TYPE_GOAL]: {
      title: "Objectif par type de tâche",
      description: "Atteignez un objectif pour un type de tâche spécifique",
      example: "Exemple : 10 tâches de sport ce mois-ci",
      icon: "🎯",
    },
  };