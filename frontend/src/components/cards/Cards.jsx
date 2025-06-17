import React, { useContext } from "react";
import { motion } from "framer-motion";
import { FaCartPlus, FaHeart, FaRegHeart } from "react-icons/fa";
import { ToyStore } from "../context/ContextApi";
import { toast } from "react-toastify";
import ProductImage from "./ProductImage";
import DiscountBadge from "./DiscountBadge";
import ActionButton from "./ActionButton";

const Cards = ({ product }) => {
  const { addToCart, openSidebar, handleLikeToggle, likedItems, cartItems } = useContext(ToyStore);

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

  const displayPrice = product.price;
  let discountPercentage = null;
  let originalPrice = null;

  const hasValidDiscount =
    typeof product.discount === "number" &&
    product.discount > 0 &&
    product.discount < 100;

  if (hasValidDiscount && typeof displayPrice === "number" && displayPrice > 0) {
    discountPercentage = Math.round(product.discount);
    originalPrice = displayPrice / (1 - discountPercentage / 100);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative flex flex-col justify-start w-full h-auto p-3 rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow duration-300 overflow-hidden"
    >
      {hasValidDiscount && <DiscountBadge percentage={discountPercentage} />}

      <ProductImage
        image={product.colors[0].images[0]}
        name={product.name}
        onClick={() => openSidebar(product)}
        className="h-32 sm:h-40 mb-2 object-contain"
      />

      <div className="mb-1">
        <span className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-2 leading-snug">
          {product.name}{hasValidDiscount && (
            <span className="text-xs text-red-500">  (-{discountPercentage}%)</span>
          )}
        </span>
      </div>

      {/* PRICE + ICONS */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex flex-col leading-tight">
          {hasValidDiscount && originalPrice && (
            <span className="text-xs text-gray-500 line-through">
              ₹{originalPrice.toFixed(2)}
            </span>
          )}
          <span className="text-base font-bold text-gray-800">
            ₹{displayPrice.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ActionButton onClick={handleAddToCart}>
            <FaCartPlus className="text-lg text-black hover:text-blue-600" />
          </ActionButton>
          <ActionButton onClick={() => handleLikeToggle(product)}>
            {isLiked ? (
              <FaHeart className="text-lg text-red-500" />
            ) : (
              <FaRegHeart className="text-lg text-gray-500 hover:text-red-500" />
            )}
          </ActionButton>
        </div>
      </div>
    </motion.div>
  );
};

export default Cards;
