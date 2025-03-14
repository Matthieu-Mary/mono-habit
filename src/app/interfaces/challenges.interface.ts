import { ChallengeStatus, ChallengeType, TaskType } from "../types/enums";

export interface Challenge {
    id: string;
    title: string;
    description: string | null;
    type: ChallengeType;
    goal: number;
    reward: string;
    penalty: string;
    month: number;
    status: ChallengeStatus;
    taskType?: TaskType | null;
    createdAt: string;
    updatedAt: string;
    userId: string;
  }
  