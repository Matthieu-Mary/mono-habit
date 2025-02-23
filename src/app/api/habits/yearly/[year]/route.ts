import { prisma } from "../../../../lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../lib/auth";

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
        });
        continue;
      }

      // Récupérer tous les logs du mois
      const habitLogs = await prisma.habitLog.findMany({
        where: {
          userId: session.user.id,
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        orderBy: {
          date: "asc",
        },
      });

      // Calculer le nombre de tâches complétées
      const completedTasks = habitLogs.filter(
        (log) => log.status === "COMPLETED"
      ).length;

      // Calculer la meilleure série du mois
      let currentStreak = 0;
      let bestStreak = 0;

      for (let i = 0; i < habitLogs.length; i++) {
        if (habitLogs[i].status === "COMPLETED") {
          currentStreak++;
          bestStreak = Math.max(bestStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }

      // Vérifier si le mois est parfait (toutes les tâches complétées)
      const isPerfect = completedTasks === totalDays;

      monthsStats.push({
        month,
        year,
        completedTasks,
        totalDays,
        bestStreak,
        isPerfect,
      });
    }

    return NextResponse.json(monthsStats);
  } catch (error) {
    console.error(error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
