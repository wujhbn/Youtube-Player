import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

interface BigButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  className?: string;
  icon?: React.ReactNode;
}

export function BigButton({ children, variant = 'primary', className, icon, ...props }: BigButtonProps) {
  const { bigButtonMode } = useStore((state) => state.settings);

  const baseStyles = "relative font-black rounded-2xl border-4 border-stone-800 transition-colors shadow-[0_2px_0_0_#292524] active:shadow-[0_0px_0_0_#292524] active:translate-y-[2px] flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap";
  
  const variants = {
    primary: "bg-orange-400 hover:bg-orange-300 text-stone-800",
    secondary: "bg-blue-300 hover:bg-blue-200 text-stone-800",
    danger: "bg-pink-300 hover:bg-pink-200 text-stone-800",
    success: "bg-green-400 hover:bg-green-300 text-stone-800"
  };

  const sizeStyles = bigButtonMode 
    ? "px-10 py-4 text-3xl" 
    : "px-6 py-2 text-xl"; 

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className={cn(baseStyles, variants[variant], sizeStyles, className)}
      {...props}
    >
      {icon && <span className={cn(bigButtonMode ? "w-12 h-12" : "w-8 h-8", "[&>svg]:w-full [&>svg]:h-full")}>{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
}
