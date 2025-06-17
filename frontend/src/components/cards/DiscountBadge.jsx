import React from 'react';
import { motion } from 'framer-motion';

const DiscountBadge = ({ percentage }) => {
  if (!percentage) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 z-10 rounded-full shadow-md"
    >
      {percentage}% OFF
    </motion.div>
  );
};

export default DiscountBadge;