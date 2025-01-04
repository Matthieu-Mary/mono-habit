import { Status } from "@prisma/client";

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
    }>;
  }