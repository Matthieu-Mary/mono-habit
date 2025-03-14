import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ChallengeStatus, ChallengeType } from "../../types/enums";

// GET - Récupérer tous les challenges de l'utilisateur
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

    // Récupérer tous les challenges de l'utilisateur
    const challenges = await prisma.challenge.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ challenges });
  } catch (error) {
    console.error("Erreur lors de la récupération des challenges:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Créer un nouveau challenge
export async function POST(request: Request) {
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

    // Récupérer les données du challenge depuis la requête
    const data = await request.json();

    // Obtenir le mois actuel (1-12)
    const currentMonth = new Date().getMonth() + 1;

    // Créer le challenge
    const challenge = await prisma.challenge.create({
      data: {
        title: `Challenge ${data.type || "Inconnu"}`,
        description: data.description || null,
        type: data.type,
        goal: parseInt(data.goal) || 1,
        reward: data.reward || "",
        penalty: data.penalty || "",
        month: currentMonth,
        status: ChallengeStatus.ACTIVE,
        taskType: data.taskType || null,
        userId: user.id,
      },
    });

    return NextResponse.json({ challenge }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du challenge:", error);
    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
