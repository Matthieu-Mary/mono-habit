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
      // Récupérer la série actuelle
      const stats = await prisma.$queryRaw`
        SELECT 
          COALESCE(MAX(streak), 0) as "currentStreak"
        FROM (
          SELECT 
            date,
            SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed_count,
            COUNT(*) as total_count,
            CASE 
              WHEN SUM(CASE WHEN completed THEN 1 ELSE 0 END) > 0 THEN 1 
              ELSE 0 
            END as day_completed,
            COUNT(*) FILTER (WHERE date = CURRENT_DATE) as is_today,
            SUM(CASE 
              WHEN date = CURRENT_DATE AND completed THEN 1 
              ELSE 0 
            END) as completed_today
          FROM "HabitLog"
          WHERE "userId" = ${user.id}
          GROUP BY date
          ORDER BY date DESC
        ) as daily_completions
        CROSS JOIN LATERAL (
          SELECT 
            COUNT(*) as streak
          FROM (
            SELECT 
              ROW_NUMBER() OVER (ORDER BY date DESC) as row_num,
              date,
              day_completed
            FROM daily_completions
            WHERE day_completed = 1 OR (is_today > 0 AND completed_today > 0)
          ) as streak_calc
          WHERE streak_calc.row_num = streak_calc.date - (CURRENT_DATE - streak_calc.row_num)::integer
        ) as streak_count;
      `;

      // @ts-ignore
      progress = stats[0]?.currentStreak || 0;
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
