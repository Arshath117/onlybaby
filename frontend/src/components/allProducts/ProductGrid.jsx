import {React, useEffect, useState} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cards from "../cards/Cards";
import { Mosaic } from "react-loading-indicators";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
// No Products Found Component
const NoProductsFound = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="col-span-full flex flex-col items-center justify-center p-8 text-center"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="w-24 h-24 mb-4 bg-purple-100 rounded-full flex items-center justify-center"
    >
      <svg
        className="w-12 h-12 text-purple-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </motion.div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">
      Loading
    </h3>
    <p className="text-gray-600">
      Try adjusting your filters or search criteria
    </p>
  </motion.div>
);

const ProductGrid = ({ products }) => {

    const [noProducts, setNoProducts] = useState(false);

    useEffect(( ) => {
        if(!products || products.length === 0){
         const wait = setTimeout(()=> {
            setNoProducts(true);
         }, 3000);
         return () => clearTimeout(wait);
        }else{
            setNoProducts(false);
        }
    },[products]);

    return(
    <motion.div
    variants={staggerContainer}
    initial="hidden"
    animate="visible"
    className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6"
  >
    <AnimatePresence>
      {noProducts ? (
        <NoProductsFound />
      ) : (
        products.map((item, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            whileHover={{ y: -10, transition: { duration: 0.2 } }}
            className="transform transition-all duration-300"
          >
            <Cards product={item} />
          </motion.div>
        ))
      )}
    </AnimatePresence>
  </motion.div>
    );
};
export default ProductGrid;