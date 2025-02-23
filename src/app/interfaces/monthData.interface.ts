import { Status, TaskType } from "../types/enums";

export interface MonthlyResponseData {
  month: number;
  year: number;
  daysInMonth: number;
  habits: Array<{
    id: string;
    title: string;
    description: string | null;
    status: Status;
    date: string;
    day: number;
    completed: boolean;
    type: TaskType;
  }>;
}
