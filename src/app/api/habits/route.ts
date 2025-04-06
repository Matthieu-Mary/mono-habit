import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { authOptions } from "../../lib/auth";
import { TaskType } from "../../types/enums";

// Fonction utilitaire pour générer les dates selon la récurrence
const generateDatesFromRecurrence = (startDate: Date, recurrence: string): Date[] => {
  const dates: Date[] = [new Date(startDate)];
  
  if (recurrence === "none") {
    return dates;
  }
  
  const year = startDate.getFullYear();
  const month = startDate.getMonth();
  const day = startDate.getDate();
  
  if (recurrence === "week") {
    // Générer les dates pour le reste de la semaine en cours
    // Déterminer le premier et dernier jour de la semaine en cours
    const currentDay = startDate.getDay(); // 0 = dimanche, 1 = lundi, etc.
    const firstDayOfWeek = new Date(startDate);
    firstDayOfWeek.setDate(day - currentDay + (currentDay === 0 ? 0 : 1)); // Lundi de la semaine
    
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6); // Dimanche de la semaine
    
    // Ajouter les jours restants de la semaine en cours (à partir du jour suivant)
    const nextDay = new Date(startDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    while (nextDay <= lastDayOfWeek) {
      dates.push(new Date(nextDay));
      nextDay.setDate(nextDay.getDate() + 1);
    }
  } else if (recurrence === "month") {
    // Générer les dates pour les jours restants du mois en cours
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    for (let i = day + 1; i <= lastDayOfMonth; i++) {
      dates.push(new Date(year, month, i));
    }
  } else if (recurrence === "weekdays") {
    // Générer les dates pour les jours ouvrables restants du mois (lundi-vendredi)
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    for (let i = day + 1; i <= lastDayOfMonth; i++) {
      const date = new Date(year, month, i);
      const dayOfWeek = date.getDay();
      // 1-5 correspond à lundi-vendredi (1 = lundi, 5 = vendredi)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        dates.push(date);
      }
    }
  } else if (recurrence === "weekends") {
    // Générer les dates pour les weekends restants du mois (samedi-dimanche)
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    for (let i = day + 1; i <= lastDayOfMonth; i++) {
      const date = new Date(year, month, i);
      const dayOfWeek = date.getDay();
      // 0 = dimanche, 6 = samedi
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        dates.push(date);
      }
    }
  }
  
  return dates;
};

// Créer la tâche du jour
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const { title, description, date, type, recurrence } = await req.json();

    // Vérifier que le type est valide
    if (!Object.values(TaskType).includes(type as TaskType)) {
      return new NextResponse("Type de tâche invalide", { status: 400 });
    }

    // Utiliser la date fournie ou par défaut la date actuelle
    const startDate = date ? new Date(date) : new Date();
    
    // Générer les dates selon la récurrence
    const dates = generateDatesFromRecurrence(startDate, recurrence || "none");
    
    // Créer l'habitude principale
    const habit = await prisma.habit.create({
      data: {
        name: title,
        description,
        userId: session.user.id,
        startDate: startDate,
        type: type || TaskType.LOISIRS,
      },
    });
    
    // Créer les HabitLogs pour toutes les dates générées
    const habitLogPromises = dates.map(date => 
      prisma.habitLog.create({
        data: {
          habitId: habit.id,
          userId: session.user.id,
          date: date,
          completed: false,
          status: "PENDING",
        },
      })
    );
    
    await Promise.all(habitLogPromises);

    return NextResponse.json(habit);
  } catch (error) {
    console.error(error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
