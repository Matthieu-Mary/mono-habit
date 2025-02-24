"use client";

import { challengeTypeInfo } from "../utils/challengeTypeUtils";
import { motion } from "framer-motion";
import { ChallengeType } from "../types/enums";
interface ChallengeTypeInfoProps {
  onSelect: (type: ChallengeType) => void;
}

export default function ChallengeTypeInfo({
  onSelect,
}: Readonly<ChallengeTypeInfoProps>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(challengeTypeInfo).map(([type, info]) => (
        <motion.div
          key={type}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(type as ChallengeType)}
          className="bg-white rounded-lg p-6 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="text-4xl mb-4">{info.icon}</div>
          <h3 className="text-lg font-semibold text-sage-900 mb-2">
            {info.title}
          </h3>
          <p className="text-sage-600 mb-4">{info.description}</p>
          <p className="text-sm text-sage-500 italic">{info.example}</p>
        </motion.div>
      ))}
    </div>
  );
}
