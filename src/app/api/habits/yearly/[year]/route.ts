import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../lib/auth";
import { TaskType } from "../../../../types/enums";

export async function GET(
  req: Request,
  { params }: { params: { year: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const year = parseInt(params.year);
    const monthsStats = [];

    // Pour chaque mois de l'année
    for (let month = 1; month <= 12; month++) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);
      const totalDays = endOfMonth.getDate();

      // Si le mois est dans le futur, on ajoute des stats vides
      if (startOfMonth > new Date()) {
        monthsStats.push({
          month,
          year,
          completedTasks: 0,
          totalDays,
          bestStreak: 0,
          isPerfect: false,
          favoriteTypes: null,
        });
        continue;
      }

      // Récupérer tous les logs et habitudes du mois
      const habits = await prisma.habit.findMany({
        where: {
          userId: session.user.id,
          startDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        include: {
          HabitLog: {
            where: {
              date: {
                gte: startOfMonth,
                lte: endOfMonth,
              },
            },
          },
        },
      });

      // Calculer le nombre de tâches complétées
      const completedTasks = habits
        .flatMap((h) => h.HabitLog)
        .filter((log) => log.status === "COMPLETED").length;

      // Calculer la meilleure série du mois
      let currentStreak = 0;
      let bestStreak = 0;

      const sortedLogs = habits
        .flatMap((h) => h.HabitLog)
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      for (let i = 0; i < sortedLogs.length; i++) {
        if (sortedLogs[i].status === "COMPLETED") {
          currentStreak++;
          bestStreak = Math.max(bestStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }

      // Calculer les types de tâches favoris
      const typeCount = new Map<TaskType, number>();
      habits.forEach((habit) => {
        const currentCount = typeCount.get(habit.type) || 0;
        typeCount.set(habit.type, currentCount + 1);
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

      // Vérifier si le mois est parfait (toutes les tâches complétées)
      const isPerfect = completedTasks === totalDays;

      monthsStats.push({
        month,
        year,
        completedTasks,
        totalDays,
        bestStreak,
        isPerfect,
        favoriteTypes: maxCount > 0 ? favoriteTypes : null,
      });
    }

    return NextResponse.json(monthsStats);
  } catch (error) {
    console.error(error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
