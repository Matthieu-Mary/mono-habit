import { prisma } from "../../lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const { title, description } = await req.json();

    const habit = await prisma.habit.create({
      data: {
        name: title,
        description,
        userId: session.user.id,
        frequency: "DAILY",
        startDate: new Date(),
      },
    });

    // Créer le HabitLog pour aujourd'hui
    await prisma.habitLog.create({
      data: {
        habitId: habit.id,
        userId: session.user.id,
        date: new Date(),
        completed: false,
      },
    });

    return NextResponse.json(habit);
  } catch (error) {
    console.error(error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
