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
        discount: product.discount, // Ensure discount is passed to cartProduct
        newArrivals: product.newArrivals,
        quantity: product.quantity,
        updatedAt: product.updatedAt,
      };

      addToCart(cartProduct, 0);
      toast.success(`${product.name} added to cart!`);
    }
  };

  const displayDiscountPercentage = product.discount && typeof product.discount === 'number'
    ? product.discount
    : null;

  const discountedPrice =
    product.discount && typeof product.discount === 'number'
      ? (product.price * (1 - product.discount / 100)).toFixed(2)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col justify-between w-full h-full p-2 py-3 rounded-lg shadow-lg shadow-gray-300 hover:shadow-xl transition-shadow duration-300 bg-white overflow-hidden
                 sm:p-4 sm:min-h-[300px] // Adjust minimum height for small screens
                 md:p-5 md:min-h-[400px] // Adjust minimum height for medium screens
                 lg:p-6 lg:min-h-[450px] // Adjust minimum height for large screens
                 dark:bg-gray-50 dark:text-gray-900"
    >
      {/* Discount Badge */}
      <DiscountBadge percentage={displayDiscountPercentage} />

      {/* Product Image */}
      <ProductImage
        image={product.colors[0].images[0]}
        name={product.name}
        onClick={() => openSidebar(product)}
        // Added responsive image sizing
        className="object-contain w-full h-40 sm:h-48 md:h-56 lg:h-64 mb-4"
      />

      {/* Product Name */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-4 mb-2 flex-grow flex items-center" // Use flex-grow and items-center to push content down
      >
        <motion.span
          whileHover={{ scale: 1.02 }}
          className="block text-sm md:text-md lg:text-lg font-medium tracking-wide dark:text-violet-600
                     line-clamp-2" // Use line-clamp to limit lines and prevent excessive vertical growth
        >
          {product.name}
        </motion.span>
      </motion.div>

      {/* Price and Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-end justify-between font-bold text-sm sm:text-base dark:text-gray-800 pt-2" // items-end to align prices/buttons at bottom
      >
        {/* Price Display Logic */}
        <motion.div whileHover={{ scale: 1.05 }} className="text-gray-700 flex flex-col items-start"> {/* Use flex-col for vertical stacking of prices */}
          {product.discount && typeof product.discount === 'number' && product.discount > 0 ? (
            <>
              <span className="line-through text-gray-500 text-sm md:text-base">
                ₹ {product.price.toFixed(2)} {/* Original price */}
              </span>
              <span className="text-xl md:text-2xl font-semibold text-gray-800">
                ₹ {discountedPrice} {/* Discounted price */}
              </span>
              <span className="text-red-600 text-sm md:text-lg mt-1">
                (-{displayDiscountPercentage}%)
              </span>
            </>
          ) : (
            <span className="text-xl md:text-2xl font-semibold text-gray-800">
              ₹ {product.price.toFixed(2)} {/* No discount, display original price */}
            </span>
          )}
        </motion.div>
        {/* End Price Display Logic */}

        <div className="flex gap-2 md:gap-3 lg:gap-4 flex-shrink-0"> {/* flex-shrink-0 to prevent buttons from shrinking */}
          <ActionButton onClick={() => handleAddToCart(product)}>
            <FaCartPlus className="text-lg md:text-xl text-black transition-colors duration-300 hover:text-blue-600" /> {/* Adjusted icon size */}
          </ActionButton>

          <ActionButton onClick={() => handleLikeToggle(product)}>
            {isLiked ? (
              <FaHeart className="text-lg md:text-xl text-red-500" /> 
            ) : (
              <FaRegHeart className="text-lg md:text-xl text-gray-500 hover:text-red-500 transition-colors duration-300" /> 
            )}
          </ActionButton>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Cards;