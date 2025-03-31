import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { ChallengeStatus, ChallengeType } from "../../../../types/enums";

async function updateChallengeStatus(
  challengeId: string,
  newStatus: ChallengeStatus
) {
  await prisma.challenge.update({
    where: { id: challengeId },
    data: { status: newStatus },
  });
}

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

    // Calculer le nombre de jours restants dans le mois
    const today = new Date();
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );
    const remainingDays = lastDayOfMonth.getDate() - today.getDate();

    let progress = 0;
    let total = currentChallenge.goal;
    let shouldFailChallenge = false;

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

      // Vérifier si c'est mathématiquement possible d'atteindre l'objectif
      const maxPossibleTasks = progress + remainingDays;
      if (maxPossibleTasks < currentChallenge.goal) {
        shouldFailChallenge = true;
      }
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

      // Si le streak actuel + jours restants ne peut pas atteindre l'objectif
      const maxPossibleStreak = currentStreak + remainingDays;
      if (maxPossibleStreak < currentChallenge.goal) {
        shouldFailChallenge = true;
      }
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

      // Ajouter un type explicite pour résoudre l'erreur
      type DaysCountResult = { days_count: number }[];
      progress =
        (daysWithCompletedTasks as DaysCountResult)[0]?.days_count || 0;

      // Le total est le nombre de jours écoulés dans le mois
      total = today.getDate();

      // Vérifier s'il y a des jours manqués dans le mois
      const missedDays = await prisma.habitLog.findFirst({
        where: {
          userId: user.id,
          date: {
            gte: startOfMonth,
            lte: today,
          },
          completed: false,
        },
      });

      if (missedDays) {
        shouldFailChallenge = true;
      }
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
            type: currentChallenge.taskType || undefined,
          },
        },
      });

      progress = completedTasks;

      // Vérifier si c'est mathématiquement possible d'atteindre l'objectif
      const maxPossibleTasks = progress + remainingDays;
      if (maxPossibleTasks < currentChallenge.goal) {
        shouldFailChallenge = true;
      }
    }

    // Mettre à jour le statut si nécessaire
    if (shouldFailChallenge) {
      await updateChallengeStatus(currentChallenge.id, ChallengeStatus.FAILED);
    } else if (progress >= currentChallenge.goal) {
      await updateChallengeStatus(
        currentChallenge.id,
        ChallengeStatus.COMPLETED
      );
    }

    // Calculer le pourcentage de progression
    const percentage = Math.min(Math.round((progress / total) * 100), 100);

    return NextResponse.json({
      progress,
      total,
      percentage,
      remainingDays,
    });
  } catch (error) {
    console.error("Erreur lors du calcul de la progression:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
