import React, { useContext, useState } from "react";
import { X, CreditCard, Gift, Shield, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import CryptoJS from "crypto-js";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { ToyStore } from "../context/ContextApi";

const MembershipSidebar = ({ onClose, userId }) => {
  const { setVerifyMembership } = useContext(ToyStore);
  const navigate = useNavigate();

  const { user } = useAuthStore();

 
  const membershipDetails = {
    name: "Premium Membership",
    credits: "10% discount on every purchase",
    additionalBenefits: [
      "Priority Customer Support",
      "Early Access to New Products",
      "10% discount on All Orders",
      "Exclusive Member-Only Events",
    ],
    amount: "₹1000",
    duration: "1 Year",
  };

  const handlePayNow = async () => {
    try {
      const paymentResponse = await axios.post(
        `http://localhost:5001/api/membership/initiate`, // Endpoint to initiate payment
        {
          user: user._id, // Send user ID for membership
        }
      );

      if (paymentResponse.data.success) {
        // Successful initiation
        toast.success("Payment initiation successful!");

        const razorpayOrder = paymentResponse.data;
        const options = {
          key: "rzp_test_VChoBnFDlKAiHL", // Razorpay key
          amount: razorpayOrder.amount,
          currency: "INR",
          order_id: razorpayOrder.razorpayOrderId,
          handler: async (response) => {
            const razorpay_order_id = response.razorpay_order_id;
            const razorpay_payment_id = response.razorpay_payment_id;

            const generateSignature = (order_id, payment_id, secret) => {
              const data = order_id + "|" + payment_id;
              const signature = CryptoJS.HmacSHA256(data, secret).toString(
                CryptoJS.enc.Base64
              );
              return signature;
            };

            const razorpaySecretKey = "aW7400zinaUgRUcCIQiTUqUy";
            const generatedSignature = generateSignature(
              razorpay_order_id,
              razorpay_payment_id,
              razorpaySecretKey
            );

            const verifyResponse = await axios.post(
              `http://localhost:5001/api/membership/verify`, // Verify payment
              {
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: generatedSignature,
                userId: user._id, // Send userId for membership creation
                membershipDuration: 12, // Assuming the membership is 12 months
              }
            );

            if (verifyResponse.data.success) {
              setVerifyMembership(true);
            }

            navigate("/"); // Navigate after success
          },
          prefill: {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            contact: user.phone,
          },
          theme: { color: "#F37254" },
        };

        const rzp1 = new Razorpay(options);
        rzp1.open();
      } else {
        toast.error("Payment initiation failed.");
      }
    } catch (error) {
      toast.error("Error initiating payment. Please try again.");
      console.error("Payment initiation error", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="w-full bg-white h-full overflow-y-auto animate-slide-left">
        <div className="sticky top-0 bg-white z-10">
          <div className="px-6 py-3 border-b flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <h2 className="text-xl font-bold">Membership Details</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Membership Header */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800">
              {membershipDetails.name}
            </h3>
            <p className="text-gray-600 mt-2">
              Valid for {membershipDetails.duration}
            </p>
          </div>

          {/* Price Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center">
            <span className="text-4xl font-bold text-blue-800">
              {membershipDetails.amount}
            </span>
            <p className="text-blue-600 mt-1">One-time payment</p>
          </div>

          {/* Benefits */}
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <CreditCard className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800">Credits</h4>
                <p className="text-gray-600">{membershipDetails.credits}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Gift className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800">
                  Additional Benefits
                </h4>
                <ul className="mt-2 space-y-2">
                  {membershipDetails.additionalBenefits.map(
                    (benefit, index) => (
                      <li
                        key={index}
                        className="flex items-center space-x-2 text-gray-600"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{benefit}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800">Secure Payment</h4>
                <p className="text-gray-600">
                  Your payment is protected with industry-standard encryption
                </p>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <div className="sticky bottom-0 bg-white pt-4">
            <button
              onClick={handlePayNow}
              className={`w-full py-4 rounded-lg text-white font-semibold transition bg-blue-600 hover:bg-blue-700 active:bg-blue-800`}
            >
              "Pay Now"
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipSidebar;
