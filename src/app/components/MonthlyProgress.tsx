"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { Status } from "@prisma/client";

// Tu peux ajuster selon ton chemin/nom d'interface :
import { MonthlyResponseData } from "../interfaces/monthData.interface";

/**
 * On suppose que l'interface MonthlyResponseData ressemble à :
 *
 * export interface MonthlyResponseData {
 *   month: number;         // ex: 1 (janvier)
 *   year: number;          // ex: 2025
 *   daysInMonth: number;   // ex: 31
 *   habits: Array<{
 *     id: string;
 *     title: string;
 *     description: string | null;
 *     status: Status;      // "UNSCHEDULED" | "PENDING" | "COMPLETED" | "MISSED"
 *     date: string;        // "2025-01-04"
 *     day: number;         // 4
 *   }>;
 * }
 */

export default function MonthlyProgress({
  month,
  year,
  daysInMonth,
  habits,
}: MonthlyResponseData) {
  // Convertit le mois renvoyé par l'API (1..12) en index JS (0..11)
  const serverMonthIndex = month - 1;

  // Date "maintenant" pour savoir si un jour est passé, en cours ou futur
  const now = new Date();

  // Nom du mois (en français)
  const currentMonthName = new Date(year, serverMonthIndex).toLocaleString(
    "fr-FR",
    { month: "long" }
  );

  /**
   * On crée un Map : dateString => Status
   * Par exemple : "2025-01-03" => "MISSED"
   */
  const statusMap = useMemo(() => {
    const map = new Map<string, Status>();

    habits.forEach((habitLog) => {
      const dateKey = habitLog.date; // ex: "2025-01-03"
      // On enregistre le 1er status trouvé (ou on peut décider une règle de priorité)
      if (!map.has(dateKey)) {
        map.set(dateKey, habitLog.status);
      }
    });
    return map;
  }, [habits]);

  /**
   * On génère tous les jours du mois (1..daysInMonth).
   * Pour chaque jour, on détermine son status final (sans regarder le champ "completed" !)
   */
  const daysArray = useMemo(() => {
    const tmp = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const currentDate = new Date(year, serverMonthIndex, d);
      const dateString = currentDate.toISOString().split("T")[0];

      // Valeur par défaut
      let dayStatus: Status = "UNSCHEDULED";

      // Si le jour est aujourd'hui ou dans le passé, on vérifie s'il y a un log
      if (currentDate <= now && statusMap.has(dateString)) {
        dayStatus = statusMap.get(dateString)!;
      }
      // Sinon on garde "UNSCHEDULED", ce qui indique "gris foncé" (pour du futur ou pas de log)

      tmp.push({ date: currentDate, status: dayStatus });
    }
    return tmp;
  }, [daysInMonth, year, serverMonthIndex, now, statusMap]);

  /**
   * Choix de la couleur selon status
   */
  const getStatusColor = (status: Status) => {
    switch (status) {
      case "MISSED":
        return "bg-red-400 hover:bg-red-500";
      case "COMPLETED":
        return "bg-emerald-500 hover:bg-emerald-600";
      case "PENDING":
        return "bg-gray-300 hover:bg-gray-400"; // gris clair
      case "UNSCHEDULED":
      default:
        return "bg-gray-600 hover:bg-gray-700"; // gris foncé
    }
  };

  /**
   * Décalage (offset) pour aligner le 1er jour sur la bonne colonne (lundi = col 1)
   */
  let offset = 0;
  if (daysArray.length > 0) {
    const firstDay = daysArray[0].date;
    // getDay() renvoie : 0 (dim), 1 (lun), 2 (mar)...
    offset = (firstDay.getDay() + 6) % 7;
  }

  /**
   * Retourne la traduction pour le tooltip
   */
  const getStatusLabel = (status: Status) => {
    switch (status) {
      case "COMPLETED":
        return "Tâche complétée";
      case "MISSED":
        return "Tâche manquée";
      case "PENDING":
        return "Tâche en cours";
      default:
        return "Aucune tâche";
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg h-full">
      <h2 className="text-xl font-semibold text-sage-800 mb-4 capitalize">
        {/* ex: "janvier 2025" */}
        {currentMonthName} {year}
      </h2>

      <div className="grid grid-cols-7 gap-1">
        {/* En-têtes L, M, M, J, V, S, D */}
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

        {/* Décalage : place le 1er du mois sur la bonne colonne */}
        {Array.from({ length: offset }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {/* Rendu des jours */}
        {daysArray.map((day, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.01 }}
            className={`
              relative aspect-square rounded-lg cursor-pointer
              transition-all duration-200 ease-in-out
              ${getStatusColor(day.status)}
              group
            `}
          >
            {/* Numéro du jour */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-white group-hover:font-bold">
                {day.date.getDate()}
              </span>
            </div>

            {/* Tooltip au survol */}
            <div
              className="
                absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                px-2 py-1 bg-sage-800 text-white text-xs rounded
                opacity-0 group-hover:opacity-100 transition-opacity
                whitespace-nowrap z-10
              "
            >
              {getStatusLabel(day.status)}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Légende */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded ${getStatusColor("COMPLETED")}`} />
          <span className="text-sage-600">Complétée</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded ${getStatusColor("MISSED")}`} />
          <span className="text-sage-600">Manquée</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded ${getStatusColor("PENDING")}`} />
          <span className="text-sage-600">En cours</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded ${getStatusColor("UNSCHEDULED")}`} />
          <span className="text-sage-600">Non programmé</span>
        </div>
      </div>
    </div>
  );
}
