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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const currentMonth: number = new Date().getMonth() + 1;
    const currentChallenge = await prisma.challenge.findFirst({
      where: {
        userId: user.id,
        month: currentMonth,
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

    // Définir la période du mois
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    if (currentChallenge.type === ChallengeType.MONTHLY_TASKS) {
      // Compter toutes les tâches complétées ce mois-ci
      progress = await prisma.habitLog.count({
        where: {
          userId: user.id,
          completed: true,
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      // Vérifier si c'est mathématiquement possible d'atteindre l'objectif
      const maxPossibleTasks = progress + remainingDays;
      if (maxPossibleTasks < currentChallenge.goal) {
        shouldFailChallenge = true;
      }
    } else if (currentChallenge.type === ChallengeType.STREAK_DAYS) {
      // Récupérer tous les logs du mois triés par date
      const logs = await prisma.habitLog.findMany({
        where: {
          userId: user.id,
          date: {
            gte: startOfMonth,
            lte: today,
          },
        },
        orderBy: {
          date: "asc",
        },
      });

      // Calculer le streak actuel
      let currentStreak = 0;
      let maxStreak = 0;
      let previousDate: Date | null = null;

      for (const log of logs) {
        if (log.completed) {
          if (!previousDate) {
            currentStreak = 1;
          } else {
            const diffDays = Math.floor(
              (log.date.getTime() - previousDate.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            if (diffDays === 1) {
              currentStreak++;
            } else {
              currentStreak = 1;
            }
          }
          previousDate = log.date;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
          previousDate = null;
        }
      }

      progress = maxStreak;

      // Vérifier si c'est mathématiquement possible d'atteindre l'objectif
      const maxPossibleStreak = currentStreak + remainingDays;
      if (maxPossibleStreak < currentChallenge.goal) {
        shouldFailChallenge = true;
      }
    } else if (currentChallenge.type === ChallengeType.PERFECT_MONTH) {
      // Compter le nombre de jours avec des tâches complétées
      const daysWithCompletedTasks = await prisma.$queryRaw`
        SELECT COUNT(DISTINCT date::date) as days_count
        FROM "HabitLog"
        WHERE "userId" = ${user.id}
          AND completed = true
          AND date >= ${startOfMonth}
          AND date <= ${today}
      `;

      type DaysCountResult = { days_count: number }[];
      progress =
        (daysWithCompletedTasks as DaysCountResult)[0]?.days_count || 0;
      total = lastDayOfMonth.getDate();

      // Vérifier s'il y a des jours manqués
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
      // Compter les tâches d'un type spécifique
      progress = await prisma.habitLog.count({
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

      const maxPossibleTasks = progress + remainingDays;
      if (maxPossibleTasks < currentChallenge.goal) {
        shouldFailChallenge = true;
      }
    }

    // Mettre à jour le statut si nécessaire
    if (
      shouldFailChallenge &&
      currentChallenge.status === ChallengeStatus.ACTIVE
    ) {
      await updateChallengeStatus(currentChallenge.id, ChallengeStatus.FAILED);
    } else if (
      progress >= total &&
      currentChallenge.status === ChallengeStatus.ACTIVE
    ) {
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
    return NextResponse.json(
      { error: "Erreur lors du calcul de la progression" },
      { status: 500 }
    );
  }
}
