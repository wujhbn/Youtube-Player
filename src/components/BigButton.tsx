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

  const baseStyles = "relative font-bold rounded-xl transition-all shadow-sm active:shadow-none active:scale-[0.98] flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap active:opacity-80";
  
  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-green-500 text-white hover:bg-green-600"
  };

  const sizeStyles = bigButtonMode 
    ? "px-8 py-4 text-2xl rounded-2xl" 
    : "px-5 py-2.5 text-[17px]"; 

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
