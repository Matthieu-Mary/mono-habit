import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";
import { TaskType } from "../../../types/enums";

interface MonthlyStats {
  month: string;
  successRate: number;
  currentStreak: number;
  bestStreak: number;
  favoriteTypes: TaskType[] | null;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    // Obtenir tous les mois avec des habitudes
    const habits = await prisma.habit.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        HabitLog: true,
      },
      orderBy: {
        startDate: "desc",
      },
    });

    if (!habits.length) {
      return NextResponse.json({
        currentMonth: {
          successRate: 0,
          currentStreak: 0,
          bestStreak: 0,
          favoriteTypes: null,
        },
        monthlyStats: [],
      });
    }

    // Grouper les habitudes par mois
    const habitsByMonth = new Map<string, typeof habits>();
    habits.forEach((habit) => {
      const monthKey = `${habit.startDate.getFullYear()}-${String(
        habit.startDate.getMonth() + 1
      ).padStart(2, "0")}`;
      if (!habitsByMonth.has(monthKey)) {
        habitsByMonth.set(monthKey, []);
      }
      habitsByMonth.get(monthKey)!.push(habit);
    });

    // Calculer les stats pour chaque mois
    const monthlyStats: MonthlyStats[] = [];
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    habitsByMonth.forEach((monthHabits, monthKey) => {
      const [year, month] = monthKey.split("-").map(Number);
      const endOfMonth = new Date(year, month, 0);
      const isCurrentMonth = monthKey === currentMonthKey;
      const daysInMonth = isCurrentMonth ? now.getDate() : endOfMonth.getDate();

      // Calculer le taux de réussite
      const completedTasks = monthHabits
        .flatMap((h) => h.HabitLog)
        .filter((log) => log.status === "COMPLETED").length;
      const successRate = Math.round((completedTasks / daysInMonth) * 100);

      // Calculer les séries
      let currentStreak = 0;
      let bestStreak = 0;
      let currentCount = 0;

      const sortedLogs = monthHabits
        .flatMap((h) => h.HabitLog)
        .sort((a, b) => b.date.getTime() - a.date.getTime());

      // Série actuelle (seulement pour le mois en cours)
      if (isCurrentMonth) {
        let i = 0;
        while (i < sortedLogs.length && sortedLogs[i].status === "COMPLETED") {
          currentStreak++;
          i++;
        }
      }

      // Meilleure série
      for (const log of sortedLogs) {
        if (log.status === "COMPLETED") {
          currentCount++;
          bestStreak = Math.max(bestStreak, currentCount);
        } else {
          currentCount = 0;
        }
      }

      // Calculer les types de tâches favoris
      const typeCount = new Map<TaskType, number>();
      monthHabits.forEach((habit) => {
        const currentCount = typeCount.get(habit.type as TaskType) || 0;
        typeCount.set(habit.type as TaskType, currentCount + 1);
      });

      let maxCount = 0;
      let favoriteTypes: TaskType[] = [];

      typeCount.forEach((count, type) => {
        if (count > maxCount) {
          maxCount = count;
          favoriteTypes = [type];
        } else if (count === maxCount) {
          favoriteTypes.push(type);
        }
      });

      monthlyStats.push({
        month: monthKey,
        successRate,
        currentStreak: isCurrentMonth ? currentStreak : 0,
        bestStreak,
        favoriteTypes: maxCount > 0 ? favoriteTypes : null,
      });
    });

    // Trier les stats par mois (du plus récent au plus ancien)
    monthlyStats.sort((a, b) => b.month.localeCompare(a.month));

    return NextResponse.json({
      currentMonth: monthlyStats.find(
        (stats) => stats.month === currentMonthKey
      ) || {
        successRate: 0,
        currentStreak: 0,
        bestStreak: 0,
        favoriteTypes: null,
      },
      monthlyStats,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
