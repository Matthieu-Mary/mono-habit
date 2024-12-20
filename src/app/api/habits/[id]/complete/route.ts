import { prisma } from "../../../../lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.habitLog.updateMany({
      where: {
        habitId: params.id,
        userId: session.user.id,
        date: today,
      },
      data: {
        completed: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
