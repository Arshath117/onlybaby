import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToyStore } from "../context/ContextApi";
import Cards from "../cards/Cards";
import { Mosaic } from "react-loading-indicators";
import ProductGrid from "./ProductGrid";


// Animation variants
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

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"
    />
  </div>
);


// Filter Button Component
const FilterButton = ({ selected, onClick, children }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`px-4 py-2 rounded-full transition-all duration-200 ${
      selected
        ? "bg-purple-600 text-white shadow-lg"
        : "bg-white text-gray-700 hover:bg-purple-50 border border-gray-200"
    }`}
  >
    {children}
  </motion.button>
);

// Main Component
const AllProducts = () => {
  const { filteredProducts, handleAgeRangeClick, handlePriceRangeClick, loading } =
    useContext(ToyStore);
  const [products, setProducts] = useState([]);
  const [isloading, setLoading] = useState(true);
  const [selectedAgeRange, setSelectedAgeRange] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const ageRanges = [
    { label: "All Ages", value: "" },
    { label: "0-1 Years", value: "0-1" },
    { label: "1-3 Years", value: "1-3" },
    { label: "3-6 Years", value: "3-6" },
    { label: "6-11 Years", value: "6-11" },
    { label: "11-19 Years", value: "11-19" },
  ];

  const priceRanges = [
    { label: "All Prices", value: "" },
    { label: "₹0 - ₹200", value: "0-200" },
    { label: "₹200 - ₹500", value: "200-500" },
    { label: "₹500 - ₹1000", value: "500-1000" },
    { label: "₹1000 - ₹2000", value: "1000-2000" },
    { label: "₹2000 - above", value: "2000-200000" }
  ];

  useEffect(() => {
    const loadData = setTimeout(() => {
      setProducts(filteredProducts);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(loadData);
  }, [filteredProducts]);

  const handleAgeChange = (value) => {
    setSelectedAgeRange(value);
    handleAgeRangeClick(value);
  };

  const handlePriceChange = (value) => {
    setSelectedPriceRange(value);
    handlePriceRangeClick(value);
  };

  if (isloading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Filter Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="md:hidden fixed bottom-6 right-6 z-40 bg-purple-600 text-white p-4 rounded-full shadow-lg"
        onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      </motion.button>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            className="fixed inset-0 z-30 md:hidden"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileFiltersOpen(false)}
            />
            <motion.div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 pb-8">
              <div className="space-y-6 ">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Age Range</h3>
                  <div className="flex flex-wrap gap-2">
                    {ageRanges.map((range) => (
                      <FilterButton
                        key={range.value}
                        selected={selectedAgeRange === range.value}
                        onClick={() => handleAgeChange(range.value)}
                      >
                        {range.label}
                      </FilterButton>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Price Range</h3>
                  <div className="flex flex-wrap gap-2">
                    {priceRanges.map((range) => (
                      <FilterButton
                        key={range.value}
                        selected={selectedPriceRange === range.value}
                        onClick={() => handlePriceChange(range.value)}
                      >
                        {range.label}
                      </FilterButton>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row">
        {/* Desktop Sidebar */}
        <motion.aside
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="hidden md:block w-64 md:3/12 lg:w-[280px] bg-gradient-to-b from-white to-gray-50 p-8  space-y-8 sticky top-0 h-screen border-r border-gray-100 overflow-auto "
        >
          <div className="pt-20 space-y-10">
            {/* Filter Header */}
            <div className="text-center">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
                Filters
              </h2>
              <div className="mt-2 h-1 w-20 mx-auto bg-gradient-to-r from-purple-600 to-pink-500 rounded-full" />
            </div>

            {/* Age Range Section */}
            <div className="bg-white rounded-2xl p-6 shadow-lg ">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-purple-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Age Range
              </h2>
              <div className="space-y-3">
                {ageRanges.map((range) => (
                  <label
                    key={range.value}
                    className="flex items-center p-2 cursor-pointer hover:bg-purple-50 rounded-lg transition-all duration-200"
                  >
                    <motion.div whileTap={{ scale: 0.95 }} className="relative">
                      <input
                        type="radio"
                        name="age-range"
                        value={range.value}
                        checked={selectedAgeRange === range.value}
                        onChange={() => handleAgeChange(range.value)}
                        className="peer hidden"
                      />
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-purple-500 peer-checked:border-8 transition-all duration-200" />
                    </motion.div>
                    <motion.span
                      className={`ml-3 ${
                        selectedAgeRange === range.value
                          ? "text-purple-600 font-medium"
                          : "text-gray-600"
                      } transition-colors duration-200`}
                    >
                      {range.label}
                    </motion.span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Section */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-purple-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Price Range
              </h2>
              <div className="space-y-3">
                {priceRanges.map((range) => (
                  <label
                    key={range.value}
                    className="flex items-center p-2 cursor-pointer hover:bg-purple-50 rounded-lg transition-all duration-200"
                  >
                    <motion.div whileTap={{ scale: 0.95 }} className="relative">
                      <input
                        type="radio"
                        name="price-range"
                        value={range.value}
                        checked={selectedPriceRange === range.value}
                        onChange={() => handlePriceChange(range.value)}
                        className="peer hidden"
                      />
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-purple-500 peer-checked:border-8 transition-all duration-200" />
                    </motion.div>
                    <motion.span
                      className={`ml-3 ${
                        selectedPriceRange === range.value
                          ? "text-purple-600 font-medium"
                          : "text-gray-600"
                      } transition-colors duration-200`}
                    >
                      {range.label}
                    </motion.span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reset Filters Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedAgeRange("");
                setSelectedPriceRange("");
                handleAgeRangeClick("");
                handlePriceRangeClick("");
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Reset Filters</span>
            </motion.button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 pt-20">
          {loading ? (
             <div className="flex items-center justify-center min-h-screen">
             <Mosaic color="#6B21A8" size="medium" text="" textColor="" />
           </div> 
          ) : (
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-purple-800 my-4 md:my-14"
            >
              All Products
            </motion.h1>
              <ProductGrid products={products} />
          </motion.div>
          )}
         
        </main>
      </div>
    </div>
  );
};

export default AllProducts;
