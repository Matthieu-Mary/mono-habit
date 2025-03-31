import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";
import { TaskType } from "../../../types/enums";
import { Challenge } from "../../../interfaces/challenges.interface";

interface MonthlyStats {
  month: string;
  successRate: number;
  currentStreak: number;
  bestStreak: number;
  favoriteTypes: TaskType[] | null;
  challenge: Challenge | null;
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
          challenge: null,
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

    const monthlyStats: MonthlyStats[] = [];
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    // Récupérer le challenge actif du mois en cours avec le bon typage
    const currentChallenge = (await prisma.challenge.findFirst({
      where: {
        userId: session.user.id,
        month: now.getMonth() + 1,
      },
    })) as Challenge | null;

    let currentMonthStats: MonthlyStats | null = null;

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

      // Trier les logs par date
      const chronologicalLogs = monthHabits
        .flatMap((h) => h.HabitLog)
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      // Regrouper les logs par jour
      const logsByDay = new Map<string, boolean>();

      for (const log of chronologicalLogs) {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        const dateKey = logDate.toISOString().split("T")[0];

        if (log.status === "COMPLETED") {
          logsByDay.set(dateKey, true);
        } else if (!logsByDay.has(dateKey)) {
          logsByDay.set(dateKey, false);
        }
      }

      // Convertir la map en tableau trié par date
      const sortedDays = Array.from(logsByDay.entries()).sort((a, b) =>
        a[0].localeCompare(b[0])
      );

      // Calculer la meilleure série
      bestStreak = 0;
      let currentSequence = 0;
      let previousDate: Date | null = null;

      for (const [dateKey, isCompleted] of sortedDays) {
        if (isCompleted) {
          const currentDate = new Date(dateKey);
          if (previousDate === null) {
            currentSequence = 1;
          } else {
            const prevDay = new Date(previousDate);
            prevDay.setDate(prevDay.getDate() + 1);
            if (
              currentDate.toISOString().split("T")[0] ===
              prevDay.toISOString().split("T")[0]
            ) {
              currentSequence++;
            } else {
              currentSequence = 1;
            }
          }
          previousDate = currentDate;
          bestStreak = Math.max(bestStreak, currentSequence);
        } else {
          currentSequence = 0;
          previousDate = null;
        }
      }

      // Calculer la série actuelle pour le mois en cours
      if (isCurrentMonth) {
        const sortedDaysDesc = [...sortedDays].reverse();
        currentStreak = 0;

        const today = new Date();
        const todayKey = today.toISOString().split("T")[0];
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const yesterdayKey = yesterday.toISOString().split("T")[0];

        let canCountStreak = false;

        for (const [dateKey, isCompleted] of sortedDaysDesc) {
          if (!canCountStreak) {
            if (
              isCompleted &&
              (dateKey === todayKey || dateKey === yesterdayKey)
            ) {
              canCountStreak = true;
              currentStreak = 1;
              continue;
            }
          } else if (isCompleted) {
            const prevDateKey = sortedDaysDesc[currentStreak - 1][0];
            const currentDate = new Date(dateKey);
            const prevDate = new Date(prevDateKey);
            const expectedDate = new Date(prevDate);
            expectedDate.setDate(prevDate.getDate() - 1);

            if (
              currentDate.toISOString().split("T")[0] ===
              expectedDate.toISOString().split("T")[0]
            ) {
              currentStreak++;
            } else {
              break;
            }
          } else {
            break;
          }
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

      const monthStats: MonthlyStats = {
        month: monthKey,
        successRate,
        currentStreak,
        bestStreak,
        favoriteTypes: maxCount > 0 ? favoriteTypes : null,
        challenge: monthKey === currentMonthKey ? currentChallenge : null,
      };

      if (isCurrentMonth) {
        currentMonthStats = monthStats;
      }
      monthlyStats.push(monthStats);
    });

    // Trier les stats par mois (du plus récent au plus ancien)
    monthlyStats.sort((a, b) => b.month.localeCompare(a.month));

    return NextResponse.json({
      currentMonth:
        currentMonthStats ||
        ({
          month: currentMonthKey,
          successRate: 0,
          currentStreak: 0,
          bestStreak: 0,
          favoriteTypes: null,
          challenge: currentChallenge,
        } as MonthlyStats),
      monthlyStats,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des stats:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
