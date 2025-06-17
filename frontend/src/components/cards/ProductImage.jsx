import React from 'react';
import { motion } from 'framer-motion';

const ProductImage = ({ image, name, onClick, className }) => { // Accept className prop
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      // Use the passed className for height and width, remove fixed height
      className={`overflow-hidden rounded-lg bg-white w-full mx-auto flex items-center justify-center ${className || ''}`}
    >
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        src={image}
        alt={name}
        // Ensure image fits within its container
        className="max-w-full max-h-full object-contain object-center rounded-md cursor-pointer transform transition-transform duration-300 hover:brightness-105"
        onClick={onClick}
      />
    </motion.div>
  );
};

export default ProductImage;