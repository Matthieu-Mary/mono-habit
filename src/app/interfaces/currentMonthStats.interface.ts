import { TaskType } from "../types/enums";
import { Challenge } from "./challenges.interface";

export interface CurrentMonthStats {
  month: string;
  successRate: number;
  currentStreak: number;
  bestStreak: number;
  favoriteTypes: TaskType[] | null;
  challenge: Challenge | null;
}
