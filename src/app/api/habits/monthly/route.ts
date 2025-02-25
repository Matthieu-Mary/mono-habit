import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user?.email as string,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    // On récupère les tâches du mois en cours
    const habits = await prisma.habit.findMany({
      where: {
        userId: user.id,
      },
      include: {
        HabitLog: {
          where: {
            date: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth,
            },
          },
        },
      },
    });

    // Nombre de jours dans le mois
    const daysInMonth = lastDayOfMonth.getDate();

    // On formate les données
    const formattedHabits = habits.flatMap((habit) => {
      return habit.HabitLog.map((habitLog) => ({
        id: habit.id,
        title: habit.name,
        description: habit.description,
        status: habitLog.status,
        date: habitLog.date.toISOString().split("T")[0],
        day: new Date(habitLog.date).getDate(),
        completed: habitLog.completed,
        type: habit.type,
      }));
    });

    return NextResponse.json({
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      daysInMonth,
      habits: formattedHabits,
    });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
