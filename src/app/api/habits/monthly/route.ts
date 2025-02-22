import { prisma } from "../../../lib/db";
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

export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const { params } = context;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const { title, description } = await req.json();

    // Vérifier que l'habitude appartient bien à l'utilisateur
    const habit = await prisma.habit.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!habit) {
      return new NextResponse("Habitude non trouvée", { status: 404 });
    }

    // Mettre à jour l'habitude
    const updatedHabit = await prisma.habit.update({
      where: {
        id: params.id,
      },
      data: {
        name: title,
        description,
      },
    });

    return NextResponse.json(updatedHabit);
  } catch (error) {
    console.error(error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
