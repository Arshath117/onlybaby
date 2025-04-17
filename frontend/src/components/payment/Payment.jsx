import React, { useState, useContext } from "react";
import { ToyStore } from "../context/ContextApi";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const Payment = () => {
  const [billingDetails, setBillingDetails] = useState({
    firstName: "",
    lastName: "",
    streetAddress: "",
    city: "",
    state: "",
    postcode: "",
    phone: "",
    email: "",
  });

 
  const [isLoading, setIsLoading] = useState(false);

  const {
    cartItems,
    singleProduct,
    setShowPayment,
    setCartClicked,
    setShippingPrice,
  } = useContext(ToyStore);

 

  const navigate = useNavigate();
  const { user } = useAuthStore.getState();

  const isSingleProduct = singleProduct !== null;
  const orderItems = isSingleProduct
    ? [{ ...singleProduct, cartQuantity: 1 }]
    : cartItems;

  const calculateItemsPrice = (items) => {
    return items.reduce((total, item) => {
      const quantity = item.cartQuantity || item.quantity || 1;
      return total + item.price * quantity;
    }, 0);
  };

  const calculateShippingPrice = (address) => {
    return address.country === "USA" ? 30 : 50;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBillingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const itemsPrice = calculateItemsPrice(orderItems);
      const shippingPrice = calculateShippingPrice({
        ...billingDetails,
        country: "India",
      });

      const orderData = {
        user: user,
        orderItems: orderItems.map((item) => ({
          _id: item.productId,
          name: item.name,
          price: item.price,
          image: item.images,
          color: item.color,
          quantity: item.cartQuantity || 1,
          discount: item.discount || 0,
        })),
        shippingAddress: {
          ...billingDetails,
          country: "India",
          apartment: "",
        },
        itemsPrice,
        shippingPrice,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API}/api/orders/saveAddress`,
        orderData
      );

      if (!response.data.success || !response.data.order) {
        throw new Error("Failed to create order");
      }
      setShowPayment(false);
      setCartClicked(false);
      setShippingPrice(response.data.shippingFee);
      navigate("/payment-confirmation", {
        state: {
          orderData,
        },
      });
    } catch (error) {
      console.error("Error processing order:", error);
      toast.warning("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputFields = [
    { name: "firstName", type: "text", placeholder: "First Name" },
    { name: "lastName", type: "text", placeholder: "Last Name" },
    { name: "streetAddress", type: "text", placeholder: "Street Address" },
    { name: "city", type: "text", placeholder: "City" },
    { name: "state", type: "text", placeholder: "State" },
    { name: "postcode", type: "text", placeholder: "Postcode" },
    { name: "phone", type: "tel", placeholder: "Phone" },
    { name: "email", type: "email", placeholder: "Email" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto max-h-[80vh] overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl ">
          {/* Form Header */}
          <div className="bg-gray-800 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Billing Details</h2>
            <p className="mt-1 text-gray-300">
              Please fill in your delivery information
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="px-8 py-6">
            {/* Personal Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={billingDetails.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={billingDetails.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={billingDetails.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={billingDetails.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Delivery Address
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="streetAddress"
                    value={billingDetails.streetAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={billingDetails.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={billingDetails.state}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postcode
                    </label>
                    <input
                      type="text"
                      name="postcode"
                      value={billingDetails.postcode}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center px-1 py-3 rounded-md text-white text-lg font-medium transition-colors duration-200 ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Processing...</span>
                  </div>
                ) : (
                  "Continue to Payment"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Payment;
