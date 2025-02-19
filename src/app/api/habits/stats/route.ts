import { prisma } from "../../../lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    // Obtenir le premier jour du mois courant
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Obtenir tous les logs du mois en cours
    const habitLogs = await prisma.habitLog.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startOfMonth,
          lte: now,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Calculer le taux de réussite
    const daysInMonth = now.getDate(); // Nombre de jours écoulés dans le mois
    const completedTasks = habitLogs.filter(
      (log) => log.status === "COMPLETED"
    ).length;
    const successRate = Math.round((completedTasks / daysInMonth) * 100);

    // Calculer la série actuelle
    let currentStreak = 0;
    let i = 0;
    while (i < habitLogs.length && habitLogs[i].status === "COMPLETED") {
      currentStreak++;
      i++;
    }

    // Calculer la meilleure série
    let bestStreak = 0;
    let currentCount = 0;
    for (const log of habitLogs) {
      if (log.status === "COMPLETED") {
        currentCount++;
        bestStreak = Math.max(bestStreak, currentCount);
      } else {
        currentCount = 0;
      }
    }

    return NextResponse.json({
      successRate,
      currentStreak,
      bestStreak,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
