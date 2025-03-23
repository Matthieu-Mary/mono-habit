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

      // Trier les logs par date (du plus ancien au plus récent)
      const chronologicalLogs = monthHabits
        .flatMap((h) => h.HabitLog)
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      // Regrouper les logs par jour (puisqu'on ne peut avoir qu'une tâche par jour)
      const logsByDay = new Map<string, boolean>();

      for (const log of chronologicalLogs) {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        const dateKey = logDate.toISOString().split("T")[0];

        // Si un log pour ce jour est complété, on marque le jour comme complété
        if (log.status === "COMPLETED") {
          logsByDay.set(dateKey, true);
        } else if (!logsByDay.has(dateKey)) {
          // Si aucun log n'existe pour ce jour, on l'ajoute comme non complété
          logsByDay.set(dateKey, false);
        }
      }

      // Convertir la map en tableau trié par date
      const sortedDays = Array.from(logsByDay.entries()).sort((a, b) =>
        a[0].localeCompare(b[0])
      );

      // Calculer la meilleure série (bestStreak) pour ce mois
      bestStreak = 0;

      // Parcourir les jours triés et trouver la plus longue séquence consécutive
      let currentSequence = 0;
      let previousDate: Date | null = null;

      for (const [dateKey, isCompleted] of sortedDays) {
        if (isCompleted) {
          const currentDate = new Date(dateKey);

          // Si c'est le premier jour complété ou s'il suit immédiatement le jour précédent
          if (previousDate === null) {
            // Premier jour complété de la séquence
            currentSequence = 1;
            previousDate = currentDate;
          } else {
            // Calculer la différence en jours
            const prevDay = new Date(previousDate);
            prevDay.setDate(prevDay.getDate() + 1);

            // Vérifier si ce jour suit immédiatement le jour précédent
            if (
              currentDate.toISOString().split("T")[0] ===
              prevDay.toISOString().split("T")[0]
            ) {
              // Jour consécutif
              currentSequence++;
            } else {
              // Jour non consécutif, on recommence une nouvelle séquence
              currentSequence = 1;
            }

            previousDate = currentDate;
          }

          // Mettre à jour le record si nécessaire
          bestStreak = Math.max(bestStreak, currentSequence);
        } else {
          // Jour non complété, on réinitialise la séquence
          currentSequence = 0;
          previousDate = null;
        }
      }

      // Pour calculer la série actuelle (currentStreak) - seulement pour le mois en cours
      if (isCurrentMonth) {
        // Trier les jours du plus récent au plus ancien
        const sortedDaysDesc = [...sortedDays].reverse();

        currentStreak = 0;

        // Vérifier si le jour le plus récent est aujourd'hui ou hier
        const today = new Date();
        const todayKey = today.toISOString().split("T")[0];

        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const yesterdayKey = yesterday.toISOString().split("T")[0];

        // On ne commence à compter que si le jour le plus récent complété est d'aujourd'hui ou d'hier
        let canCountStreak = false;

        for (const [dateKey, isCompleted] of sortedDaysDesc) {
          if (!canCountStreak) {
            // Chercher le premier jour complété qui est aujourd'hui ou hier
            if (
              isCompleted &&
              (dateKey === todayKey || dateKey === yesterdayKey)
            ) {
              canCountStreak = true;
              currentStreak = 1;
              continue;
            }
          } else if (isCompleted) {
            // Vérifier si ce jour est consécutif au précédent
            const prevDateKey = sortedDaysDesc[currentStreak - 1][0];
            const currentDate = new Date(dateKey);
            const prevDate = new Date(prevDateKey);

            // Le jour doit être exactement 1 jour avant le précédent
            const expectedDate = new Date(prevDate);
            expectedDate.setDate(prevDate.getDate() - 1);

            if (
              currentDate.toISOString().split("T")[0] ===
              expectedDate.toISOString().split("T")[0]
            ) {
              currentStreak++;
            } else {
              // Jour non consécutif, on arrête le comptage
              break;
            }
          } else {
            // Jour non complété, on arrête le comptage
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
