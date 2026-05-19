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
      whileHover={onClick ? { scale: 1.02, y: -4 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={cn(
        "rounded-[2.5rem] border-[6px] border-stone-800 p-6 shadow-[8px_8px_0_0_#292524] relative overflow-hidden",
        color,
        onClick && "cursor-pointer active:shadow-[2px_2px_0_0_#292524] active:translate-x-[6px] active:translate-y-[6px] transition-all",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
