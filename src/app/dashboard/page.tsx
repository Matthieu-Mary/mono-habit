'use client'

import { useAuth } from "../hooks/useAuth"

export default function DashboardPage() {
  const { session, status } = useAuth()

  if (status === "loading") {
    return <div>Chargement...</div>
  }

  return (
    <div>
      <h1>Tableau de bord</h1>
      <p>Bienvenue {session?.user?.email}</p>
    </div>
  )
} 