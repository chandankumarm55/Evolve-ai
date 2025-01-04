import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ServiceContainerProps {
  title: string;
  children: ReactNode;
}

export const ServiceContainer = ({ title, children }: ServiceContainerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col"
    >
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      {children}
    </motion.div>
  );
};