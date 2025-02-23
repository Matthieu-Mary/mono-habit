import { TaskType } from "../types/enums";

interface TaskTypeStyle {
  bg: string;
  text: string;
  border?: string;
  hover?: string;
  icon: string;
}

export const getTaskTypeColor = (type: TaskType): TaskTypeStyle => {
  const colorMap = {
    [TaskType.SPORT]: {
      bg: "bg-orange-100",
      text: "text-orange-600",
      border: "border-orange-200",
      hover: "hover:bg-orange-200",
      icon: "🏃‍♂️",
    },
    [TaskType.SANTE]: {
      bg: "bg-emerald-100",
      text: "text-emerald-600",
      border: "border-emerald-200",
      hover: "hover:bg-emerald-200",
      icon: "💚",
    },
    [TaskType.TRAVAIL]: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      border: "border-blue-200",
      hover: "hover:bg-blue-200",
      icon: "💼",
    },
    [TaskType.LOISIRS]: {
      bg: "bg-purple-100",
      text: "text-purple-600",
      border: "border-purple-200",
      hover: "hover:bg-purple-200",
      icon: "🎮",
    },
  };
  return colorMap[type];
};
