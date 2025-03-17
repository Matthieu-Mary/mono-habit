import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { ChallengeStatus, ChallengeType } from "../../../../types/enums";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Obtenir le mois actuel (1-12)
    const currentMonth = new Date().getMonth() + 1;

    // Récupérer le challenge du mois en cours
    const currentChallenge = await prisma.challenge.findFirst({
      where: {
        userId: user.id,
        month: currentMonth,
        status: ChallengeStatus.ACTIVE,
      },
    });

    if (!currentChallenge) {
      return NextResponse.json(
        { error: "Aucun challenge actif trouvé" },
        { status: 404 }
      );
    }

    // Calculer la progression en fonction du type de challenge
    let progress = 0;
    let total = currentChallenge.goal;

    if (currentChallenge.type === ChallengeType.MONTHLY_TASKS) {
      // Compter le nombre de tâches complétées ce mois-ci
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);

      const completedTasks = await prisma.habitLog.count({
        where: {
          userId: user.id,
          completed: true,
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          ...(currentChallenge.taskType
            ? { habit: { type: currentChallenge.taskType } }
            : {}),
        },
      });

      progress = completedTasks;
    } else if (currentChallenge.type === ChallengeType.STREAK_DAYS) {
      // Récupérer tous les jours des 30 derniers jours
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Regarder les 30 derniers jours

      // Récupérer les logs pour chaque jour
      const habitLogs = await prisma.habitLog.findMany({
        where: {
          userId: user.id,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          date: "desc",
        },
      });

      // Regrouper par jour et vérifier si chaque jour a au moins une tâche complétée
      const dailyCompletions = new Map();
      habitLogs.forEach((log) => {
        const dateStr = new Date(log.date).toISOString().split("T")[0];
        if (!dailyCompletions.has(dateStr)) {
          dailyCompletions.set(dateStr, false);
        }
        if (log.completed) {
          dailyCompletions.set(dateStr, true);
        }
      });

      // Calculer le streak actuel
      let currentStreak = 0;
      const today = new Date().toISOString().split("T")[0];

      // Vérifier chaque jour en partant d'aujourd'hui
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split("T")[0];

        // Si le jour a au moins une tâche complétée, incrémenter le streak
        if (dailyCompletions.get(dateStr)) {
          currentStreak++;
        } else {
          // Si un jour n'a pas de tâche complétée, arrêter le comptage
          break;
        }
      }

      progress = currentStreak;
    } else if (currentChallenge.type === ChallengeType.PERFECT_MONTH) {
      // Compter le nombre de jours avec des tâches complétées ce mois-ci
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const daysWithCompletedTasks = await prisma.$queryRaw`
        SELECT COUNT(DISTINCT date::date) as days_count
        FROM "HabitLog"
        WHERE "userId" = ${user.id}
          AND completed = true
          AND date >= ${startOfMonth}
          AND date <= ${today}
      `;

      // @ts-ignore
      progress = daysWithCompletedTasks[0]?.days_count || 0;

      // Le total est le nombre de jours écoulés dans le mois
      total = today.getDate();
    } else if (currentChallenge.type === ChallengeType.TASK_TYPE_GOAL) {
      // Compter le nombre de tâches d'un type spécifique complétées ce mois-ci
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);

      const completedTasks = await prisma.habitLog.count({
        where: {
          userId: user.id,
          completed: true,
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          habit: {
            type: currentChallenge.taskType,
          },
        },
      });

      progress = completedTasks;
    }

    // Calculer le pourcentage de progression
    const percentage = Math.min(Math.round((progress / total) * 100), 100);

    return NextResponse.json({
      challenge: currentChallenge,
      progress,
      total,
      percentage,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la progression:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
