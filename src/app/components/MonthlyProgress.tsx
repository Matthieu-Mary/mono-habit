"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Status, TaskType } from "../types/enums";
import { MonthlyResponseData } from "../interfaces/monthData.interface";
import TaskDetailsModal from "./TaskDetailsModal";

/**
 * Petit utilitaire pour formater une date JS locale au format "YYYY-MM-DD"
 * sans utiliser toISOString() (qui, elle, renvoie en UTC).
 */
function toLocalDateString(date: Date): string {
  const yyyy = date.getFullYear();
  // getMonth() renvoie 0..11, on ajoute 1 avant de formatter
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

interface TaskDetails {
  id?: string;
  title: string;
  description?: string;
  status: Status;
  date: string;
  type: TaskType;
}

interface MonthlyProgressProps extends MonthlyResponseData {
  onSuccess?: () => Promise<void>;
}

export default function MonthlyProgress({
  month,
  year,
  daysInMonth,
  habits,
  onSuccess,
}: Readonly<MonthlyProgressProps>) {
  const [selectedTask, setSelectedTask] = useState<TaskDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Convertit le mois renvoyé par l'API (1..12) en index JS (0..11)
  const serverMonthIndex = month - 1;

  // Date "maintenant" pour savoir si un jour est passé, en cours ou futur
  const now = new Date();

  // Nom du mois (en français) pour l'entête
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
   * Pour chaque jour, on détermine son status final.
   * On n'utilise pas toISOString(), on fabrique "YYYY-MM-DD" en local.
   */
  const daysArray = useMemo(() => {
    const tmp = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const currentDate = new Date(year, serverMonthIndex, d);
      const dateString = toLocalDateString(currentDate);
      const isPastDay =
        currentDate < now &&
        toLocalDateString(currentDate) !== toLocalDateString(now);

      // Par défaut, on considère que c'est un jour futur non programmé
      let dayStatus = Status.FUTURE_UNSCHEDULED;

      // On vérifie s'il y a un log pour cette date
      if (statusMap.has(dateString)) {
        dayStatus = statusMap.get(dateString)!;
      } else if (isPastDay) {
        // Si c'est un jour passé sans tâche, on le marque comme non programmé dans le passé
        dayStatus = Status.PAST_UNSCHEDULED;
      }

      tmp.push({ date: currentDate, status: dayStatus });
    }
    return tmp;
  }, [daysInMonth, year, serverMonthIndex, statusMap, now]);

  /**
   * Choix de la couleur selon status
   */
  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.MISSED:
        return "bg-red-400 hover:bg-red-500";
      case Status.COMPLETED:
        return "bg-emerald-500 hover:bg-emerald-600";
      case Status.PENDING:
        return "bg-blue-300 hover:bg-blue-400";
      case Status.PAST_UNSCHEDULED:
        return "bg-gray-400 hover:bg-gray-500"; // Plus foncé pour les jours passés non programmés
      case Status.FUTURE_UNSCHEDULED:
      default:
        return "bg-gray-200 hover:bg-gray-300"; // Plus clair pour les jours futurs non programmés
    }
  };

  /**
   * Décalage (offset) pour aligner le 1er jour du mois sur la bonne colonne (lundi = col 1)
   */
  let offset = 0;
  if (daysArray.length > 0) {
    const firstDay = daysArray[0].date;
    // getDay() renvoie : 0(dim), 1(lun), 2(mar)...
    offset = (firstDay.getDay() + 6) % 7;
  }

  /**
   * Retourne la traduction pour le tooltip
   */
  const getStatusLabel = (status: Status) => {
    switch (status) {
      case Status.COMPLETED:
        return "Tâche complétée";
      case Status.MISSED:
        return "Tâche manquée";
      case Status.PENDING:
        return "Programmé";
      case Status.PAST_UNSCHEDULED:
        return "Jour passé non programmé";
      case Status.FUTURE_UNSCHEDULED:
        return "Jour disponible";
      default:
        return "Aucune tâche";
    }
  };

  const handleDayClick = (date: Date) => {
    const dateStr = toLocalDateString(date);
    const habitForDay = habits.find((h) => h.date === dateStr);
    const isPastDay =
      date < now && toLocalDateString(date) !== toLocalDateString(now);

    if (habitForDay) {
      // Si une tâche existe déjà pour ce jour
      setSelectedTask({
        id: habitForDay.id,
        title: habitForDay.title,
        description: habitForDay.description ?? "",
        status: habitForDay.status,
        date: dateStr,
        type: habitForDay.type ?? TaskType.LOISIRS,
      });
      setIsModalOpen(true);
    } else if (!isPastDay) {
      // On ne permet l'ajout que pour aujourd'hui et les jours futurs
      setSelectedTask({
        title: "",
        description: "",
        status: Status.FUTURE_UNSCHEDULED,
        date: dateStr,
        type: TaskType.LOISIRS,
      });
      setIsModalOpen(true);
    }
    // On ne fait rien si c'est un jour passé sans tâche
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleTaskSuccess = async () => {
    if (onSuccess) {
      await onSuccess();
    }
    handleModalClose();
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-sage-800 mb-4 capitalize">
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
            onClick={() => handleDayClick(day.date)}
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
          <div
            className={`w-3 h-3 rounded ${getStatusColor(Status.COMPLETED)}`}
          />
          <span className="text-sage-600">Complétée</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded ${getStatusColor(Status.MISSED)}`} />
          <span className="text-sage-600">Manquée</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className={`w-3 h-3 rounded ${getStatusColor(Status.PENDING)}`}
          />
          <span className="text-sage-600">Programmé</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className={`w-3 h-3 rounded ${getStatusColor(
              Status.PAST_UNSCHEDULED
            )}`}
          />
          <span className="text-sage-600">Non programmé (passé)</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className={`w-3 h-3 rounded ${getStatusColor(
              Status.FUTURE_UNSCHEDULED
            )}`}
          />
          <span className="text-sage-600">Disponible</span>
        </div>
      </div>

      {/* Modale de détails/programmation */}
      <TaskDetailsModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleTaskSuccess}
        task={selectedTask}
        isFutureDate={selectedTask ? new Date(selectedTask.date) > now : false}
      />
    </div>
  );
}
