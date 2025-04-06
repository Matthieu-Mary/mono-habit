import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { authOptions } from "../../../../../../lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { year: string; month: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const year = parseInt(params.year);
    const month = parseInt(params.month);

    // Vérifier que les paramètres sont valides
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return new NextResponse("Paramètres invalides", { status: 400 });
    }

    // Définir la plage de dates pour le mois
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);
    
    // Date actuelle pour ne supprimer que les tâches futures ou du jour même
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Récupérer tous les HabitLog PENDING pour le mois spécifié
    const pendingLogs = await prisma.habitLog.findMany({
      where: {
        userId: session.user.id,
        status: "PENDING",
        date: {
          gte: now,
          lte: endOfMonth,
        },
      },
      select: {
        id: true,
        habitId: true,
      },
    });

    // Collecter tous les IDs d'habitudes uniques
    const habitIds = [...new Set(pendingLogs.map(log => log.habitId))];
    
    // Supprimer les HabitLogs
    await prisma.habitLog.deleteMany({
      where: {
        id: {
          in: pendingLogs.map(log => log.id),
        },
      },
    });

    // Supprimer les habitudes qui n'ont plus de logs associés
    for (const habitId of habitIds) {
      const remainingLogs = await prisma.habitLog.count({
        where: {
          habitId,
        },
      });
      
      if (remainingLogs === 0) {
        await prisma.habit.delete({
          where: {
            id: habitId,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression des tâches:", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
} 