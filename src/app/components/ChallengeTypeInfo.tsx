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
          whileHover={{
            scale: 1.03,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            duration: 0.1,
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(type as ChallengeType)}
          className={`rounded-xl p-6 cursor-pointer transition-all duration-100 h-full flex flex-col relative overflow-hidden ${
            info.bgColor
          } ${info.borderColor ? `border ${info.borderColor}` : ""} ${
            type === ChallengeType.PERFECT_MONTH
              ? "bg-gradient-to-br from-amber-50 via-amber-100 to-yellow-100 border-amber-200 shadow-sm"
              : ""
          }`}
        >
          {type === ChallengeType.PERFECT_MONTH && (
            <>
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_rgba(251,191,36,0.15),transparent_70%)]"></div>
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-yellow-300 opacity-10 rounded-full blur-xl"></div>
            </>
          )}

          <div className="flex items-start gap-4 h-full relative z-10">
            <div
              className={`flex-shrink-0 p-3 rounded-full ${info.iconColor} ${
                type === ChallengeType.PERFECT_MONTH
                  ? "bg-gradient-to-r from-amber-200 to-yellow-300 shadow-md relative"
                  : "bg-white/80"
              }`}
            >
              {info.icon}
              {type === ChallengeType.PERFECT_MONTH && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full"
                      initial={{
                        x: 0,
                        y: 0,
                        opacity: 0.8,
                      }}
                      animate={{
                        x: [0, ((i % 2 === 0 ? 20 : -20) * (i + 1)) / 3],
                        y: [-5, (-25 * (i + 1)) / 3],
                        opacity: [0.8, 0],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </>
              )}
            </div>
            <div className="flex-grow">
              <h3
                className={`text-lg font-semibold mb-1 ${info.textColor} ${
                  type === ChallengeType.PERFECT_MONTH ? "font-bold" : ""
                }`}
              >
                {info.title}
              </h3>
              <p className={`text-sm ${info.textColor} opacity-80`}>
                {info.description}
              </p>
              <p className={`text-xs italic mt-1 ${info.textColor} opacity-70`}>
                {info.example}
              </p>
            </div>
          </div>

          {type === ChallengeType.STREAK_DAYS && (
            <div className="absolute -bottom-2 -right-2 w-12 h-12 text-orange-500 opacity-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              >
                🔥
              </motion.div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
