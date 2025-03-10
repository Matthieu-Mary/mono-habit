import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { ChallengeStatus } from "../../../../app/types/enums";

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

    // Récupérer le challenge actif (statut ACTIVE)
    const activeChallenge = await prisma.challenge.findFirst({
      where: {
        userId: user.id,
        status: ChallengeStatus.ACTIVE,
      },
    });

    return NextResponse.json({ challenge: activeChallenge });
  } catch (error) {
    console.error("Erreur lors de la récupération du challenge actif:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
