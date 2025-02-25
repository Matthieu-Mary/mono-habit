import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const habitLog = await prisma.habitLog.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        habit: true,
      },
    });

    return NextResponse.json({
      habit: habitLog?.habit || null,
      completed: habitLog?.completed || false,
      status: habitLog?.status || "PENDING",
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
