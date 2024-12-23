"use client";

import { motion } from "framer-motion";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Loader({ size = "md", className = "" }: LoaderProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} relative`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-0">
          <div className="h-full w-full rounded-full border-4 border-emerald-100" />
        </div>
        <div className="absolute inset-0">
          <div className="h-full w-full rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        </div>
      </motion.div>
    </div>
  );
}
