import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { ChallengeStatus } from "../../../types/enums";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Obtenir le mois actuel (1-12)
    const currentMonth = new Date().getMonth() + 1;

    // Récupérer le challenge du mois en cours
    const currentChallenge = await prisma.challenge.findFirst({
      where: {
        userId: user.id,
        month: currentMonth,
        status: ChallengeStatus.ACTIVE,
      },
    });

    return NextResponse.json({ challenge: currentChallenge });
  } catch (error) {
    console.error("Erreur lors de la récupération du challenge actuel:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
