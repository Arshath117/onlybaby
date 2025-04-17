import React, { useContext, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ToyStore } from "../context/ContextApi";
import { motion } from "framer-motion";
import axios from "axios";

const Login = ({ onClickAccount }) => {
  const { login, verifyUnverified, isVerified } = useAuthStore();
  const { setCartItems, setShowForgetPage, setLikedItems, } =
    useContext(ToyStore);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setShowOTP } = useContext(ToyStore);
 
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    try {
      const loginResponse = await login(email, password);
      const loggedInUser = loginResponse;
      const user = await isVerified(email);
      if (user.success && user.message === "User is verified") {
        toast.success("Login successful");
        navigate("/"); 
      }else{
        await verifyUnverified(email);
        setShowOTP(true);
        
      }
      

      if (loggedInUser) {
        const storedCartItems = localStorage.getItem("cartItems");
        let mergedCartItems = loggedInUser.cartItems || [{}];

        

        // Merge stored cart items with logged-in user's cart items
        if (storedCartItems) {
          try {
            const parsedStoredCartItems = JSON.parse(storedCartItems);

            // Use a Map to ensure uniqueness and store only full product data
            const existingCartItemsMap = new Map();

            // Add existing full product data to the Map
            mergedCartItems.forEach((item) => {
              if (typeof item === "object" && item._id) {
                existingCartItemsMap.set(item._id, item);
              }
            });

            // Add parsed stored cart items, overwriting or adding only full objects
            parsedStoredCartItems.forEach((storedItem) => {
              if (typeof storedItem === "object" && storedItem._id) {
                existingCartItemsMap.set(storedItem._id, storedItem);
              }
            });

            // Convert the Map back to an array
            mergedCartItems = Array.from(existingCartItemsMap.values());
          } catch (parseError) {
            console.error("Error parsing stored cart items:", parseError);
            localStorage.removeItem("cartItems");
          }
        }

        // Merge liked items similarly
        const storedLikedItems = localStorage.getItem("likedItems");
        let mergedLikedItems = loggedInUser.likedItems || [];

        if (storedLikedItems) {
          try {
            const parsedStoredLikedItems = JSON.parse(storedLikedItems);

            // Use a Map to ensure uniqueness for liked items
            const existingLikedItemsMap = new Map();

            mergedLikedItems.forEach((item) => {
              if (typeof item === "object" && item._id) {
                existingLikedItemsMap.set(item._id, item);
              }
            });

            parsedStoredLikedItems.forEach((storedItem) => {
              if (typeof storedItem === "object" && storedItem._id) {
                existingLikedItemsMap.set(storedItem._id, storedItem);
              }
            });

            mergedLikedItems = Array.from(existingLikedItemsMap.values());
          } catch (parseError) {
            console.error("Error parsing stored liked items:", parseError);
            localStorage.removeItem("likedItems");
          }
        }


        // Update loggedInUser with merged items
        loggedInUser.cartItems = mergedCartItems;
        loggedInUser.likedItems = mergedLikedItems;

        // Save updated user data to localStorage
        localStorage.setItem("user", JSON.stringify(loggedInUser));

        // Update application state
        setCartItems(mergedCartItems); // Update cart state
        setLikedItems(mergedLikedItems); // Update liked items state (if you have one)

        // Update server with merged cart and liked items
        const userId = loggedInUser._id;

        await axios.put(
          `${import.meta.env.VITE_API}/api/auth/updateUserItems`, // Combined Endpoint
          {
            userId,
            cartItems: mergedCartItems,
            likedItems: mergedLikedItems,
          }
        );


        localStorage.setItem(
          "cartItems",
          JSON.stringify(loggedInUser.cartItems)
        );
        localStorage.setItem(
          "likedItems",
          JSON.stringify(loggedInUser.likedItems)
        );
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error);
      toast.error("Error logging in");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8 overflow-y-auto"
    >
      <div className="flex  items-center justify-center ">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-rose-500 to-pink-500">
              <h2 className="text-2xl font-bold text-white text-center">
                Welcome Back
              </h2>
              <p className="mt-2 text-blue-100 text-center">
                Please sign in to your account
              </p>
            </div>

            <div className="px-8 py-6">
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full outline-none px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-pink-500 transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full outline-none px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-pink-500 transition-colors"
                      placeholder="Enter your password"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-between"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className={`px-6 py-2 ${
                      isLoading ? "bg-gray-400" : "bg-rose-500"
                    } text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          ></path>
                        </svg>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => setShowForgetPage(true)}
                    className="text-sm text-rose-600 hover:text-pink-700 hover:underline transition-colors"
                  >
                    Forgot Password?
                  </button>
                </motion.div>
              </form>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 text-center"
              >
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={onClickAccount}
                    className="text-rose-500 hover:text-rose-700 font-medium hover:underline transition-colors"
                  >
                    Create New Account
                  </motion.button>
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;
