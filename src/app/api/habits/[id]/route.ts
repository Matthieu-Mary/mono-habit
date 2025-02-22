import { prisma } from "../../../lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id; // On attend l'ID
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const { title, description } = await req.json();

    // Vérifier que l'habitude appartient bien à l'utilisateur
    const habit = await prisma.habit.findFirst({
      where: {
        id: id, // On utilise l'ID attendu
        userId: session.user.id,
      },
    });

    if (!habit) {
      return new NextResponse("Habitude non trouvée", { status: 404 });
    }

    // Mettre à jour l'habitude
    const updatedHabit = await prisma.habit.update({
      where: {
        id: id, // On utilise l'ID attendu
      },
      data: {
        name: title,
        description,
      },
    });

    // Mettre à jour également le HabitLog associé pour maintenir la cohérence
    await prisma.habitLog.updateMany({
      where: {
        habitId: id, // On utilise l'ID attendu
        userId: session.user.id,
      },
      data: {
        status: "PENDING", // On s'assure que le statut reste PENDING
      },
    });

    return NextResponse.json(updatedHabit);
  } catch (error) {
    console.error(error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
