import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

const api_url = "https://onlybaby.co.in";

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  isAuthenticated: !!localStorage.getItem("user"),
  error: null,
  isCheckingAuth: false,
  message: null,

  isVerified: async (email) => {
    set({ error: null });
    try {
      const response = await axios.post(
        `${api_url}/api/auth/isVerify`,
        {email},
        {headers:{
          "Content-Type" : "application/json",
        }}
      );

      return response.data;
    } catch (error) {
      set({ error: error.response.data.message || "Error verifying email" });
      throw error;
    }
  },
  verifyUnverified: async (email) => {
    set({ error: null });
    try{
        const response = await axios.post(
        `${api_url}/api/auth/verify`,
        {email},
        {headers : {
          "Content-type" : "application/json",
        }}
      );

      toast.success(response.data.message || "OTP sent successfully")
    }catch(error){
      set({ error: error.response.data.message || "Error verifying email" });
      throw error;
    }
  },

  signup: async (email, name, password) => {
    set({ error: null });

    try {
      const response = await axios.post(
        `https://onlybaby.co.in/api/auth/signup`,
        {
          name,
          email,
          password,
          likedItems: JSON.parse(localStorage.getItem("likedItems")) || [],
          cartItems: JSON.parse(localStorage.getItem("cartItems")) || [],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const user = response.data.user;
      localStorage.setItem("user", JSON.stringify(user)); // Store user in localStorage
      set({ user, isAuthenticated: true });
      localStorage.removeItem("likedItems");
      localStorage.removeItem("cartItems");
    } catch (error) {
      set({ error: error.response.data.message || "Error signing up" });
      throw error;
    }
  },

  verifyEmail: async (code) => {
    set({ error: null });
    try {
      const response = await axios.post(`https://onlybaby.co.in/api/auth/verifyEmail`, { code });
      const user = response.data.user;
      localStorage.setItem("user", JSON.stringify(user)); // Store user in localStorage
      set({ user, isAuthenticated: true });
    } catch (error) {
      set({ error: error.response.data.message || "Error verifying email" });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await axios.get(`https://onlybaby.co.in/api/auth/check-Auth`);
      const user = response.data.user;
      localStorage.setItem("user", JSON.stringify(user)); // Store user in localStorage
      set({ user, isAuthenticated: true, isCheckingAuth: false });
    } catch (error) {
      localStorage.removeItem("user"); // Clear user on error
      set({ error: null, isCheckingAuth: false, isAuthenticated: false });
    }
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const response = await axios.post(`https://onlybaby.co.in/api/auth/login`, {
        email,
        password,
      });
      const user = response.data.user;
      
      localStorage.setItem("user", JSON.stringify(user)); // Store user in localStorage
      set({ user, isAuthenticated: true });
      return user; // Return the user object
    } catch (error) {
      set({ error: error.response.data.message || "Error logging in" });
      throw error;
    }
  },

  logout: async () => {
    try {
      await axios.post(`${api_url}/api/auth/logout`); // Send a simple logout request
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      set({ error: "Error logging out" });
      throw error;
    }
  },

  forgotPassword: async (email) => {
    set({ error: null });
    try {
      const response = await axios.post(`${api_url}/api/auth/forgotPassword`, { email });
      set({ message: response.data.message });
    } catch (error) {
      set({
        error:
          error.response.data.message ||
          "Error in sending the password reset mail",
      });
      throw error;
    }
  },

  resetPassword: async (token, password) => {
    set({ error: null });
    try {
      const response = await axios.post(`${api_url}/api/auth/resetPassword/${token}`, {
        password,
      });
      set({ message: response.data.message });
    } catch (error) {
      set({
        error: error.response.data.message || "Error in resetting password",
      });
      throw error;
    }
  },
}));
