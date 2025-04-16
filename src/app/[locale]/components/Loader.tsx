"use client";

import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export default function Loader({ size = 'md', color = 'emerald-600' }: LoaderProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-b-2 border-${color} ${sizeClasses[size]}`}></div>
    </div>
  );
}
