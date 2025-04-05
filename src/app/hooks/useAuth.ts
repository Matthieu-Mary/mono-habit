'use client'

import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function useAuth(requireAuth: boolean = true) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      // Si déjà authentifié via NextAuth, on continue
      if (status === "authenticated") {
        setIsChecking(false)
        return
      }

      // Si le statut est encore en chargement, on attend
      if (status === "loading") return

      if (requireAuth) {
        // Vérifier si un token existe dans le localStorage
        const storedToken = localStorage.getItem("authToken")
        const tokenExpiry = localStorage.getItem("tokenExpiry")
        
        if (storedToken && tokenExpiry) {
          const expiryTime = parseInt(tokenExpiry)
          
          // Vérifier si le token n'est pas expiré
          if (expiryTime > Date.now()) {
            try {
              // Tenter de se connecter avec le token stocké
              await signIn("credentials", { 
                redirect: false,
                token: storedToken 
              })
              setIsChecking(false)
            } catch (error) {
              console.error("Erreur d'authentification avec le token stocké:", error)
              localStorage.removeItem("authToken")
              localStorage.removeItem("tokenExpiry")
              router.push("/auth/login")
            }
          } else {
            // Token expiré
            localStorage.removeItem("authToken")
            localStorage.removeItem("tokenExpiry")
            router.push("/auth/login")
          }
        } else if (status === "unauthenticated") {
          router.push("/auth/login")
        }
      }
      
      setIsChecking(false)
    }

    checkAuth()
  }, [status, requireAuth, router])

  return { session, status, isChecking }
} 