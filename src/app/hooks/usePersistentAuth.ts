'use client';

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function usePersistentAuth(redirectTo: string = "/dashboard") {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Si déjà authentifié via NextAuth, on redirige
      if (status === "authenticated") {
        setShouldRedirect(true);
        router.push(redirectTo);
        return;
      }

      // Si le statut est encore en chargement, on attend
      if (status === "loading") return;

      // Vérifier si un token existe dans le localStorage
      const storedToken = localStorage.getItem("authToken");
      const tokenExpiry = localStorage.getItem("tokenExpiry");
      
      if (storedToken && tokenExpiry) {
        const expiryTime = parseInt(tokenExpiry);
        
        // Vérifier si le token n'est pas expiré (moins de 24h)
        if (expiryTime > Date.now()) {
          try {
            setShouldRedirect(true);
            // Tenter de se connecter avec le token stocké
            await signIn("credentials", { 
              redirect: false,
              token: storedToken 
            });
            router.push(redirectTo);
          } catch (error) {
            console.error("Erreur d'authentification avec le token stocké:", error);
            // Nettoyer le localStorage en cas d'échec
            localStorage.removeItem("authToken");
            localStorage.removeItem("tokenExpiry");
            setShouldRedirect(false);
            setIsLoading(false);
          }
        } else {
          // Token expiré, nettoyer le localStorage
          localStorage.removeItem("authToken");
          localStorage.removeItem("tokenExpiry");
          setShouldRedirect(false);
          setIsLoading(false);
        }
      } else {
        setShouldRedirect(false);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [status, router, redirectTo]);

  return { session, status, isAuthLoading: isLoading, shouldRedirect };
} 