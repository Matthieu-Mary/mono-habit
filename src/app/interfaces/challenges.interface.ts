import { ChallengeStatus, ChallengeType, TaskType } from "../types/enums";

export interface Challenge {
  id: string;
  title: string;
  type: ChallengeType;
  goal: number;
  reward: string | null;
  penalty: string | null;
  month: number;
  status: ChallengeStatus;
  taskType?: TaskType | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  completed: boolean;
}

export interface ChallengeProgress {
  challenge: Challenge;
  progress: number;
  total: number;
  percentage: number;
}

export interface StatsCardProps {
  onNewChallenge: () => void;
  currentChallenge: Challenge | null;
  isLoadingChallenge: boolean;
  refreshTrigger?: number;
}
