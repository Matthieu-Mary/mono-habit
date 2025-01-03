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

    const daysInMonth = lastDayOfMonth.getDate();
    const formattedHabits = habits.map((habit) => {
      const completionMap = new Map(
        habit.HabitLog.filter((habitLog) => habitLog.date instanceof Date).map(
          (habitLog) => [
            habitLog.date.toISOString().split("T")[0],
            habitLog.completed,
          ]
        )
      );

      console.log(habits);

      const dailyStatus = Array.from({ length: daysInMonth }, (_, index) => {
        const currentDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          index + 1
        );
        if (isNaN(currentDate.getTime())) {
          return {
            date: "",
            day: index + 1,
            completed: false,
          };
        }

        const dateStr = currentDate.toISOString().split("T")[0];
        return {
          date: dateStr,
          day: index + 1,
          completed: completionMap.get(dateStr) ?? false,
        };
      });

      return {
        id: habit.id,
        title: habit.name,
        description: habit.description,
        dailyStatus,
      };
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
