import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";
import { TaskType } from "../../../types/enums";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const { title, description, type } = await req.json();

    // Vérifier que le type est valide
    if (!Object.values(TaskType).includes(type as TaskType)) {
      return new NextResponse("Type de tâche invalide", { status: 400 });
    }

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
        type: type || TaskType.LOISIRS,
      },
    });

    // Mettre à jour également le HabitLog associé pour maintenir la cohérence
    await prisma.habitLog.updateMany({
      where: {
        habitId: params.id,
        userId: session.user.id,
      },
      data: {
        status: "PENDING",
      },
    });

    return NextResponse.json(updatedHabit);
  } catch (error) {
    console.error(error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
