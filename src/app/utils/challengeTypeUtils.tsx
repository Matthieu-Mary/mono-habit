import { ChallengeType } from "../types/enums";

interface ChallengeTypeDetails {
  title: string;
  description: string;
  example: string;
  icon: string;
}

export const challengeTypeInfo: Record<ChallengeType, ChallengeTypeDetails> = {
  [ChallengeType.MONTHLY_TASK_GOAL]: {
    title: "Objectif mensuel de tâches",
    description: "Définissez un nombre de tâches à accomplir ce mois-ci",
    example: "Ex: Accomplir 20 tâches ce mois-ci",
    icon: "🎯",
  },
  [ChallengeType.PERFECT_MONTH]: {
    title: "Mois parfait",
    description: "Accomplissez une tâche chaque jour du mois",
    example: "Ex: Ne manquez aucun jour ce mois-ci",
    icon: "🏆",
  },
  [ChallengeType.STREAK_GOAL]: {
    title: "Série de jours consécutifs",
    description:
      "Maintenez une série de jours consécutifs avec des tâches accomplies",
    example: "Ex: Maintenir une série de 7 jours consécutifs",
    icon: "🔥",
  },
  [ChallengeType.TASK_TYPE_GOAL]: {
    title: "Objectif par type de tâche",
    description:
      "Accomplissez un certain nombre de tâches d'un type spécifique",
    example: "Ex: Accomplir 10 tâches de type Sport ce mois-ci",
    icon: "📊",
  },
};
