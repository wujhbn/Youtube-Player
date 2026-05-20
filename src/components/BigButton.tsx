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

  const baseStyles = "relative font-bold transition-all flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap border-[4px] border-[#4a3a31] rounded-[24px] box-border active:translate-y-[4px]";
  
  const variants = {
    primary: "bg-[#6cc1ff] text-[#4a3a31] shadow-[4px_6px_0px_#4a3a31] hover:brightness-110 active:shadow-[0px_2px_0px_#4a3a31]",
    secondary: "bg-white text-[#4a3a31] shadow-[4px_6px_0px_#4a3a31] hover:bg-gray-50 active:shadow-[0px_2px_0px_#4a3a31]",
    danger: "bg-[#ff8e8b] text-[#4a3a31] shadow-[4px_6px_0px_#4a3a31] hover:brightness-110 active:shadow-[0px_2px_0px_#4a3a31]",
    success: "bg-[#6ddeba] text-[#4a3a31] shadow-[4px_6px_0px_#4a3a31] hover:brightness-110 active:shadow-[0px_2px_0px_#4a3a31]"
  };

  const sizeStyles = bigButtonMode 
    ? "px-8 py-4 text-2xl rounded-2xl" 
    : "px-5 py-2.5 text-[17px]"; 

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      className={cn(baseStyles, variants[variant], sizeStyles, className)}
      {...props}
    >
      {icon && <span className={cn(bigButtonMode ? "w-12 h-12" : "w-8 h-8", "[&>svg]:w-full [&>svg]:h-full")}>{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
}
