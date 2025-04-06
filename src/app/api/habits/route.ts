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
    // Générer les dates pour le reste de la semaine en cours (lundi-dimanche)
    const currentDay = startDate.getDay(); // 0=dimanche, 1=lundi, etc.
    
    // Convertir en format européen (1=lundi, 7=dimanche)
    const europeanDay = currentDay === 0 ? 7 : currentDay;
    
    // Calculer combien de jours restent jusqu'à dimanche
    const daysUntilEndOfWeek = 7 - europeanDay;
    
    // Ajouter les jours restants de la semaine
    for (let i = 1; i <= daysUntilEndOfWeek; i++) {
      const nextDate = new Date(startDate);
      nextDate.setDate(day + i);
      dates.push(nextDate);
    }
  } else if (recurrence === "month") {
    // Générer les dates pour les jours restants du mois
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    for (let i = day + 1; i <= lastDayOfMonth; i++) {
      dates.push(new Date(year, month, i));
    }
  } else if (recurrence === "weekdays") {
    // Jours ouvrables: lundi (1) à vendredi (5)
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    for (let i = day + 1; i <= lastDayOfMonth; i++) {
      const date = new Date(year, month, i);
      const dayOfWeek = date.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        dates.push(date);
      }
    }
  } else if (recurrence === "weekends") {
    // Weekends: samedi (6) et dimanche (0)
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    for (let i = day + 1; i <= lastDayOfMonth; i++) {
      const date = new Date(year, month, i);
      const dayOfWeek = date.getDay();
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
    
    // Créer une habitude distincte pour chaque date
    const habitsPromises = dates.map(date => 
      prisma.habit.create({
        data: {
          name: title,
          description,
          userId: session.user.id,
          startDate: date,
          type: type || TaskType.LOISIRS,
          HabitLog: {
            create: {
              userId: session.user.id,
              date: date,
              completed: false,
              status: "PENDING",
            }
          }
        },
      })
    );
    
    // Créer toutes les habitudes en parallèle
    const habits = await Promise.all(habitsPromises);
    
    // Retourner la première habitude créée (celle pour la date sélectionnée)
    return NextResponse.json(habits[0]);
  } catch (error) {
    console.error(error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
