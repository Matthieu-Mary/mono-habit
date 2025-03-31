import { ChallengeType } from "../types/enums";
import {
  CalendarDaysIcon,
  FireIcon,
  TrophyIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

interface ChallengeTypeInfo {
  title: string;
  description: string;
  example: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  borderColor: string;
  iconColor: string;
}

export const challengeTypeInfo: Record<ChallengeType, ChallengeTypeInfo> = {
  [ChallengeType.MONTHLY_TASKS]: {
    title: "Objectif de tâches mensuelles",
    description:
      "Fixez-vous un objectif de nombre de tâches à accomplir ce mois-ci.",
    example: "Ex: Accomplir 20 tâches ce mois-ci",
    icon: <CalendarDaysIcon className="h-6 w-6" />,
    bgColor: "bg-purple-100",
    textColor: "text-purple-800",
    borderColor: "border-purple-300",
    iconColor: "text-purple-600",
  },
  [ChallengeType.STREAK_DAYS]: {
    title: "Objectif de série",
    description:
      "Fixez-vous un objectif de jours consécutifs à accomplir vos tâches.",
    example: "Ex: Maintenir une série de 7 jours consécutifs",
    icon: <FireIcon className="h-6 w-6" />,
    bgColor: "bg-orange-100",
    textColor: "text-orange-800",
    borderColor: "border-orange-300",
    iconColor: "text-orange-600",
  },
  [ChallengeType.TASK_TYPE_GOAL]: {
    title: "Objectif par type de tâche",
    description:
      "Accomplissez un certain nombre de tâches d'un type spécifique",
    example: "Ex: Accomplir 10 tâches de type Sport ce mois-ci",
    icon: <ChartBarIcon className="h-6 w-6" />,
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    borderColor: "border-blue-300",
    iconColor: "text-blue-600",
  },
  [ChallengeType.PERFECT_MONTH]: {
    title: "Mois parfait",
    description: "Accomplissez une tâche chaque jour du mois",
    example: "Ne manquez aucun jour ce mois-ci",
    icon: <TrophyIcon className="h-6 w-6" />,
    bgColor: "bg-amber-100",
    textColor: "text-amber-800",
    borderColor: "border-amber-300",
    iconColor: "text-amber-600",
  },
};
