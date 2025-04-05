import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <motion.div
      className={`bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`}
      animate={{
        opacity: [0.5, 0.8, 0.5],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }
      }}
    />
  );
};

export default Skeleton;
