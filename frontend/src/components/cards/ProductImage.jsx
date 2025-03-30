import React from 'react';
import { motion } from 'framer-motion';

const ProductImage = ({ image, name, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-lg bg-white w-full max-w-xs mx-auto flex items-center justify-center"
      style={{ height: '20rem' }} 
    >
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        src={image}
        alt={name}
        className="max-w-full max-h-full object-contain object-center rounded-md cursor-pointer transform transition-transform duration-300 hover:brightness-105"
        onClick={onClick}
      />
    </motion.div>
  );
};

export default ProductImage;