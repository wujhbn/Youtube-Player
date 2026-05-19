import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';

interface ModalProps {
  isOpen: boolean;
  children: React.ReactNode;
}

export function Modal({ isOpen, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-2xl"
          >
            <Card color="bg-white" className="p-8 sm:p-12 shadow-xl flex flex-col gap-8 rounded-[32px] border-none">
              {children}
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
