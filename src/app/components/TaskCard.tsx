"use client";

import { motion } from "framer-motion";

interface Task {
  title: string;
  description?: string;
}

export default function TaskCard({ task }: { task: Task }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-40 bg-gradient-to-br from-emerald-50 to-sage-50 rounded-xl p-6 relative overflow-hidden"
    >
      {/* Cercle décoratif */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-100 rounded-full opacity-50" />
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-sage-100 rounded-full opacity-30" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold text-sage-800 mb-2">
            {task.title}
          </h3>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-emerald-500 text-white p-2 rounded-full"
          >
            ✓
          </motion.div>
        </div>

        {task.description && (
          <p className="text-sage-600 text-sm line-clamp-2">
            {task.description}
          </p>
        )}
      </div>
    </motion.div>
  );
} 