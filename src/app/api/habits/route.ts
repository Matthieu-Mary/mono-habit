import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "../../lib/db";
import { authOptions } from "../../lib/auth";

// Créer la tâche du jour
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const { title, description, date } = await req.json();
    
    // Utiliser la date fournie ou par défaut la date actuelle
    const startDate = date ? new Date(date) : new Date();

    const habit = await prisma.habit.create({
      data: {
        name: title,
        description,
        userId: session.user.id,
        startDate, // Utiliser la date sélectionnée
      },
    });

    // Créer le HabitLog pour la date sélectionnée
    await prisma.habitLog.create({
      data: {
        habitId: habit.id,
        userId: session.user.id,
        date: startDate, // Utiliser la même date
        completed: false,
        status: "PENDING",
      },
    });

    return NextResponse.json(habit);
  } catch (error) {
    console.error(error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
