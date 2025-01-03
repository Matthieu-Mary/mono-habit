"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface DayStatus {
  date: Date;
  status: "completed" | "missed" | "unscheduled" | "future";
}

interface MonthlyProgressProps {
  habits: Array<{
    id: string;
    title: string;
    description: string | null;
    dailyStatus: Array<{
      date: string;
      day: number;
      completed: boolean;
    }>;
  }>;
}

const MonthlyProgress = ({ habits }: MonthlyProgressProps) => {
  const [days, setDays] = useState<DayStatus[]>([]);
  const [currentMonth, setCurrentMonth] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
  
    setCurrentMonth(
      new Date(year, month).toLocaleString("fr-FR", { month: "long" })
    );

    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth: DayStatus[] = [];

    // Créer un Map pour stocker le statut de chaque jour
    const statusMap = new Map<string, boolean>();

    // Combiner les statuts de toutes les habitudes
    habits.forEach(habit => {
      habit.dailyStatus.forEach(status => {
        const dateKey = status.date;
        // Si au moins une habitude est complétée ce jour-là, marquer comme complété
        if (status.completed) {
          statusMap.set(dateKey, true);
        } else if (!statusMap.has(dateKey)) {
          statusMap.set(dateKey, false);
        }
      });
    });

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const currentDate = new Date(year, month, d);
      const dateString = currentDate.toISOString().split("T")[0];

      let status: DayStatus["status"] = "unscheduled";

      if (currentDate > now) {
        status = "future";
      } else if (statusMap.has(dateString)) {
        status = statusMap.get(dateString) ? "completed" : "missed";
      }

      daysInMonth.push({
        date: currentDate,
        status,
      });
    }

    setDays(daysInMonth);
  }, [habits]);

  /**
   * Renvoie la couleur de fond associée au status.
   */
  const getStatusColor = (status: DayStatus["status"]) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500 hover:bg-emerald-600";
      case "missed":
        return "bg-red-400 hover:bg-red-500";
      case "unscheduled":
        return "bg-sage-200 hover:bg-sage-300";
      case "future":
        return "bg-sage-100";
      default:
        return "bg-sage-100";
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg h-full">
      <h2 className="text-xl font-semibold text-sage-800 mb-4 capitalize">
        {currentMonth}
      </h2>

      <div className="grid grid-cols-7 gap-1">
        {/* En-têtes des jours de la semaine */}
        {[
          { key: "lun", label: "L" },
          { key: "mar", label: "M" },
          { key: "mer", label: "M" },
          { key: "jeu", label: "J" },
          { key: "ven", label: "V" },
          { key: "sam", label: "S" },
          { key: "dim", label: "D" },
        ].map((day) => (
          <div
            key={day.key}
            className="text-center text-xs font-medium text-sage-600 mb-1"
          >
            {day.label}
          </div>
        ))}

        {/* Calcul du décalage pour le premier jour (ex. si c'est dimanche JS -> col 6) */}
        {(() => {
          if (!days.length) return null;
          const firstDay = days[0].date;
          // Ex: Dimanche = getDay() = 0, on veut qu'il soit la 7e colonne => offset = 6
          // => offset = (0 + 6) % 7 = 6
          const offset = (firstDay.getDay() + 6) % 7;

          return Array.from({ length: offset }).map((_, index) => (
            <div key={`empty-${index}`} />
          ));
        })()}

        {/* Rendu des jours du mois */}
        {days.map((day, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.01 }}
            className={`
              relative aspect-square rounded-lg cursor-pointer
              transition-all duration-200 ease-in-out
              ${getStatusColor(day.status)}
              hover:transform hover:scale-105
              group
            `}
          >
            {/* Numéro du jour */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-white group-hover:font-bold">
                {day.date.getDate()}
              </span>
            </div>

            {/* Tooltip */}
            <div
              className="
                absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                px-2 py-1 bg-sage-800 text-white text-xs rounded
                opacity-0 group-hover:opacity-100 transition-opacity
                whitespace-nowrap z-10
              "
            >
              {day.status === "completed" && "Tâche complétée"}
              {day.status === "missed" && "Tâche manquée"}
              {day.status === "unscheduled" && "Aucune tâche"}
              {day.status === "future" && "À venir"}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Légende */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded ${getStatusColor("completed")}`} />
          <span className="text-sage-600">Complété</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded ${getStatusColor("missed")}`} />
          <span className="text-sage-600">Manqué</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded ${getStatusColor("unscheduled")}`} />
          <span className="text-sage-600">Non programmé</span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyProgress;
