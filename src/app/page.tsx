"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  //add redirection to signup page when clicking on the button Commencer votre voyage
  const handleStartJourney = () => {
    router.push("/auth/login");
  };

  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-sage-50 to-sage-100 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold text-sage-800 mb-4">
          Mono<span className="text-emerald-600">Habit</span>
        </h1>

        <p className="text-xl text-sage-700 leading-relaxed">
          Concentrez-vous sur une seule habitude à la fois.
          <br />
          Transformez votre vie, un petit pas après l&apos;autre.
        </p>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-center space-x-6">
            <div className="text-center">
              <div className="text-emerald-600 text-4xl font-bold">1</div>
              <div className="text-sage-700">Habitude</div>
            </div>
            <div className="h-12 w-px bg-sage-200"></div>
            <div className="text-center">
              <div className="text-emerald-600 text-4xl font-bold">∞</div>
              <div className="text-sage-700">Potentiel</div>
            </div>
          </div>
        </div>

        <button
          onClick={handleStartJourney}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-full transition-all transform hover:scale-105"
        >
          Commencer votre voyage
        </button>
      </div>
    </main>
  );
}
