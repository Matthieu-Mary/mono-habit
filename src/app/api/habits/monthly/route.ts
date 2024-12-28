import { prisma } from "../../../lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

export async function GET() {
  try {

    console.log("GET request received");
    const session = await getServerSession(authOptions);

    // Vérification de la session
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: {
        email: session.user?.email as string,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const habits = await prisma.habit.findMany({
      where: {
        userId: user.id,
      },
      include: {
        completions: {
          where: {
            date: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth,
            },
          },
        },
      },
    });

    console.log(habits)

    // const daysInMonth = lastDayOfMonth.getDate();
    // const formattedHabits = habits.map(habit => {
    //   const completionMap = new Map(
    //     habit.completions.map(completion => [
    //       completion.date.toISOString().split('T')[0],
    //       completion.completed
    //     ])
    //   );

    //   const dailyStatus = Array.from({ length: daysInMonth }, (_, index) => {
    //     const date = new Date(now.getFullYear(), now.getMonth(), index + 1);
    //     const dateStr = date.toISOString().split('T')[0];
        
    //     return {
    //       date: dateStr,
    //       day: index + 1,
    //       completed: completionMap.get(dateStr) ?? false
    //     };
    //   });

    //   return {
    //     id: habit.id,
    //     title: habit.title,
    //     description: habit.description,
    //     dailyStatus,
    //   };
    // });

    // return NextResponse.json({
    //   month: now.getMonth() + 1,
    //   year: now.getFullYear(),
    //   daysInMonth,
    //   habits: formattedHabits
    // });

    return NextResponse.json({ habits });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
