import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const habits = await prisma.habit.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        completions: {
          orderBy: {
            date: 'desc'
          },
          take: 30, // Récupère les 30 derniers jours
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formater les données pour inclure l'état de chaque jour
    const formattedHabits = habits.map(habit => {
      const completionMap = new Map(
        habit.completions.map(completion => [
          completion.date.toISOString().split('T')[0],
          completion.completed
        ])
      );

      // Créer un tableau des 30 derniers jours
      const last30Days = [...Array(30)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        return {
          date: dateStr,
          completed: completionMap.get(dateStr) ?? false
        };
      });

      return {
        id: habit.id,
        title: habit.title,
        description: habit.description,
        createdAt: habit.createdAt,
        completionHistory: last30Days
      };
    });

    return NextResponse.json(formattedHabits);
    
  } catch (error) {
    console.error("Erreur lors de la récupération des habitudes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des habitudes" },
      { status: 500 }
    );
  }
}
