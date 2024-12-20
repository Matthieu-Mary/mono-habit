"use client";

import { useAuth } from "../hooks/useAuth";

export default function DashboardPage() {
  const { session, status } = useAuth();

  if (status === "loading") {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-sage-800">Tableau de bord</h1>
      <p className="text-sage-600">Bienvenue {session?.user?.name}</p>
    </div>
  );
}
