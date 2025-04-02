"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Header from "src/app/components/Header";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
    color: "text-gray-500",
    bgColor: "bg-gray-200",
  });
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Vérifier la force du mot de passe
  const checkPasswordStrength = (password: string) => {
    // Critères de vérification
    const minLength = password.length >= 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);

    // Calcul du score (0-3)
    let score = 0;
    if (minLength) score++;
    if (hasUpperCase) score++;
    if (hasNumbers) score++;

    // Messages selon le score
    let message = "";
    let color = "";
    let bgColor = "";

    if (password === "") {
      message = "";
      color = "text-gray-500";
      bgColor = "bg-gray-200";
    } else if (score < 1) {
      message = "Très faible";
      color = "text-red-700";
      bgColor = "bg-red-200";
    } else if (score < 2) {
      message = "Faible";
      color = "text-orange-700";
      bgColor = "bg-orange-200";
    } else if (score < 3) {
      message = "Moyen";
      color = "text-yellow-700";
      bgColor = "bg-yellow-200";
    } else {
      message = "Fort";
      color = "text-emerald-700";
      bgColor = "bg-emerald-300";
    }

    return { score, message, color, bgColor };
  };

  // Vérifier si les mots de passe correspondent
  useEffect(() => {
    if (formData.confirmPassword) {
      setPasswordMatch(formData.password === formData.confirmPassword);
    } else {
      setPasswordMatch(true);
    }
  }, [formData.password, formData.confirmPassword]);

  // Mettre à jour la force du mot de passe quand il change
  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(formData.password));
  }, [formData.password]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Vérification du mot de passe
    if (passwordStrength.score < 3) {
      setError(
        "Votre mot de passe doit contenir au moins 6 caractères, 1 majuscule et 1 chiffre."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!formData.acceptedTerms) {
      setError("Vous devez accepter les conditions générales d'utilisation.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/auth/login");
        router.refresh();
      } else {
        setError(data.error || "Une erreur est survenue lors de l'inscription");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-sage-50 to-sage-100 flex flex-col items-center justify-center p-8">
      <Header />
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-sage-800 text-center mb-8">
          Rejoindre <span className="text-emerald-600">MonoHabit</span>
        </h1>

        <form onSubmit={handleRegister} className="space-y-6">
          {error && (
            <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-meédium text-sage-700"
            >
              Nom d&apos;utilisateur
            </label>
            <input
              type="text"
              id="username"
              className="mt-1 block w-full rounded-md border border-sage-300 px-3 py-2 text-sage-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-sage-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full rounded-md border border-sage-300 px-3 py-2 text-sage-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-sage-700"
            >
              Mot de passe
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="block w-full rounded-md border border-sage-300 px-3 py-2 text-sage-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 pr-10"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                onBlur={() => setPasswordTouched(true)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-sage-500 hover:text-sage-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            {passwordTouched && passwordStrength.score < 3 && (
              <p className="mt-1 text-xs text-red-500">
                Requis: 6 caractères minimum, 1 majuscule, 1 chiffre
              </p>
            )}

            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center mb-1">
                  <span className={`text-xs ${passwordStrength.color}`}>
                    {passwordStrength.message}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength.bgColor}`}
                    style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-sage-700"
            >
              Confirmer le mot de passe
            </label>
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className={`block w-full rounded-md border ${
                  !passwordMatch && formData.confirmPassword
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-sage-300 focus:border-emerald-500 focus:ring-emerald-500"
                } px-3 py-2 text-sage-800 focus:outline-none focus:ring-1 pr-10`}
                required
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-sage-500 hover:text-sage-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {formData.confirmPassword && !passwordMatch && (
              <p className="mt-1 text-xs text-red-500">
                Les mots de passe ne correspondent pas
              </p>
            )}
          </div>

          <div className="flex items-start mt-4">
            <div className="flex items-center h-5">
              <input
                id="acceptedTerms"
                type="checkbox"
                checked={formData.acceptedTerms}
                onChange={(e) =>
                  setFormData({ ...formData, acceptedTerms: e.target.checked })
                }
                className="w-4 h-4 border border-sage-300 rounded bg-sage-50 focus:ring-3 focus:ring-emerald-300 text-emerald-600"
                required
              />
            </div>
            <label
              htmlFor="acceptedTerms"
              className="ml-2 text-sm font-medium text-sage-700"
            >
              J&apos;ai lu et j&apos;accepte les{" "}
              <Link
                href="/cgu"
                className="text-emerald-600 hover:text-emerald-700 underline"
                target="_blank"
              >
                conditions générales d&apos;utilisation
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={
              isLoading ||
              !passwordMatch ||
              passwordStrength.score < 3 ||
              !formData.acceptedTerms
            }
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="inline-flex items-center justify-center w-full">
                <svg
                  className="animate-spin h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </span>
            ) : (
              "Créer un compte"
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-sage-600">
          Déjà un compte ?{" "}
          <button
            onClick={() => router.push("/auth/login")}
            className="text-emerald-600 hover:text-emerald-700 font-semibold"
          >
            Se connecter
          </button>
        </p>
      </div>
    </main>
  );
}
