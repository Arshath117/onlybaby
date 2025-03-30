import React, { useContext, useState } from "react";
import { motion } from "framer-motion";
import { FaCartPlus, FaHeart, FaRegHeart } from "react-icons/fa";
import { ToyStore } from "../context/ContextApi";
import { toast } from "react-toastify";
import ProductImage from "./ProductImage";
import DiscountBadge from "./DiscountBadge";
import ActionButton from "./ActionButton";

const Cards = ({ product }) => {

  
  const { addToCart, openSidebar, handleLikeToggle, likedItems, cartItems } =
    useContext(ToyStore);
  
  const isLiked = likedItems.some((item) => item._id === product._id);

  const isInCart = cartItems.some((item) => item._id === product._id);

  const handleAddToCart = () => {
    if (isInCart) {
      toast.warning(`${product.name} is already in the cart!`);
    } else {
      const cartProduct = {
        productId: product._id,
        name: product.name,
        price: product.price,
        color: product.colors[0].color,
        images: product.colors[0].images,
        ageGroup: product.ageGroup,
        bestSellers: product.bestSellers,
        benefits: product.benefits, 
        createdAt: product.createdAt,
        description: product.description,
        features: product.features,
        discount: product.discount,
        newArrivals: product.newArrivals,
        quantity: product.quantity, 
        updatedAt: product.updatedAt,
      };
  
      addToCart(cartProduct, 0); 
      toast.success(`${product.name} added to cart!`);
    }
  };
  

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col justify-between max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg p-2 py-3 sm:px-5 md:px-2 rounded-lg shadow-lg shadow-gray-400 hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-50 dark:text-gray-900"
    >
      <DiscountBadge percentage={discountPercentage} />

      <ProductImage
        image={product.colors[0].images[0]}
        name={product.name}
        onClick={() => openSidebar(product)}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-4 mb-2"
      >
        <motion.span
          whileHover={{ scale: 1.02 }}
          className="block text-xs md:text-sm lg:text-md font-medium tracking-widest uppercase dark:text-violet-600"
        >
          {product.name.length > 60 ? `${product.name.substring(0, 20)}...` : product.name}
        </motion.span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between font-bold text-sm sm:text-base dark:text-gray-800"
      >
        <motion.div whileHover={{ scale: 1.05 }} className="text-gray-700">
          ₹ {product.price}
        </motion.div>

        <div className="flex gap-2 md:gap-5">
          <ActionButton onClick={() => handleAddToCart(product)}>
            <FaCartPlus className="text-[12px] md:text-xl text-black transition-colors duration-300 hover:text-blue-600" />
          </ActionButton>

          <ActionButton onClick={() => handleLikeToggle(product)}>
            {isLiked ? (
              <FaHeart className="text-[12px] md:text-xl text-red-500" />
            ) : (
              <FaRegHeart className="text-[12px] md:text-xl text-gray-500 hover:text-red-500 transition-colors duration-300" />
            )}
          </ActionButton>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Cards;
