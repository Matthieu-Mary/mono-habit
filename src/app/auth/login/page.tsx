"use client";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implémenter la logique de connexion
    console.log("Connexion en cours...");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-sage-50 to-sage-100 flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-sage-800 text-center mb-8">
          Connexion à <span className="text-emerald-600">MonoHabit</span>
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-sage-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full rounded-md border border-sage-300 px-3 py-2 text-sage-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-sage-700">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full rounded-md border border-sage-300 px-3 py-2 text-sage-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-full transition-all transform hover:scale-105"
          >
            Se connecter
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-sage-600">
          Pas encore de compte ?{" "}
          <button
            onClick={() => router.push("/auth/register")}
            className="text-emerald-600 hover:text-emerald-700 font-semibold"
          >
            S&apos;inscrire
          </button>
        </p>
      </div>
    </main>
  );
}
