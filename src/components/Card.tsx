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
      onClick={onClick}
      className={cn(
        "rounded-[32px] bg-white p-6 shadow-[4px_6px_0px_#4a3a31] border-[4px] border-[#4a3a31] relative overflow-hidden",
        onClick && "cursor-pointer active:translate-y-[2px] active:shadow-[2px_4px_0px_#4a3a31] transition-all",
        color,
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
