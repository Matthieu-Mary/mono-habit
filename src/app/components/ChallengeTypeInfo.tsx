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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {Object.entries(challengeTypeInfo).map(([type, info]) => (
        <motion.div
          key={type}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(type as ChallengeType)}
          className="bg-sage-50 rounded-xl p-6 cursor-pointer hover:bg-sage-100 transition-all duration-200 h-full flex flex-col"
        >
          <div className="flex items-start gap-4 h-full">
            <div className="text-3xl flex-shrink-0">{info.icon}</div>
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-sage-800 mb-1">
                {info.title}
              </h3>
              <p className="text-sm text-sage-600">{info.description}</p>
              <p className="text-xs text-sage-500 italic mt-1">
                {info.example}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
