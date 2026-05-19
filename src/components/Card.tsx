import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../lib/utils';

interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  color?: string;
}

export function Card({ children, className, onClick, color = "bg-orange-100", ...props }: CardProps) {
  return (
    <motion.div
      whileHover={onClick ? { scale: 1.01 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={cn(
        "rounded-[24px] bg-white p-6 shadow-sm border border-gray-100 relative overflow-hidden",
        onClick && "cursor-pointer active:opacity-80 transition-all",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
