import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useContext, useState } from "react";
import { ToyStore } from "../context/ContextApi";
import SingleProduct from "../product/SingleProduct";

const PaymentConfirmation = () => {
  const { state } = useLocation();
  const { user } = useAuthStore.getState();
  const navigate = useNavigate();
  const { orders, memberShip, shippingPrice, singleProduct, removeCart } = useContext(ToyStore);
  const [PaymentDone, setPaymentDone] = useState(false);

  const { orderItems = [], shippingAddress = {}, itemsPrice } = state?.orderData || {};
  console.log(`order items : ${orderItems.map((item) => item._id)}`);
  const { firstName, lastName, email, phone, streetAddress, city, state: region, country } = shippingAddress;

  const subtotal = itemsPrice + shippingPrice;
  const discount = memberShip ? 0.1 * subtotal : 0;
  const grandTotal = subtotal - discount;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delayChildren: 0.3, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  };

  const handlePayment = async () => {
    try {
      
      
      const paymentResponse = await axios.post(`https://onlybaby.onrender.com/api/orders/initiate`, {
        
        itemsPrice, // Base price
        shippingPrice, // Explicitly send shipping
        addressId: shippingAddress,
        user: user._id, // Ensure user is an ID if server expects it
        orderItems,
      });

      const razorpayOrder = paymentResponse.data;
      const options = {
        key: "rzp_live_lojTiGeQfU4eAN", // Replace with your Razorpay key
        amount: razorpayOrder.amount,
        currency: "INR",
        order_id: razorpayOrder.razorpayOrderId,
        handler: async (response) => {
          const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;
          console.log("Razorpay Response:", response);
          try {
           const res= await axios.post(`https://onlybaby.onrender.com/api/orders/verify`, {
              razorpayOrderId: razorpay_order_id,
              razorpayPaymentId: razorpay_payment_id,
              razorpaySignature: razorpay_signature,
            });
            if(res.data.status === "success") {
            toast.success("Payment successful! Order placed.");
            navigate("/");
            if(!singleProduct){
              removeCart();
            }
          }else{
            setPaymentDone(false);
            toast.error("Payment failed! Please try again.");
          }
            
          } catch (error) {
            setPaymentDone(false);
            toast.error("Payment failed! Please try again.");
            console.error("Verification error:", error.response?.data || error);
          }finally{
            setPaymentDone(false);
          }
        },
        prefill: { name: `${user.firstName} ${user.lastName}`, email: user.email, contact: user.phone },
        theme: { color: "#F37254" },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      toast.error("Error initiating payment!");
      console.error("Error during payment process:", error);
    }
  };

  const handleExit = () => {
    toast.success("Order cancelled successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden overflow-y-auto scrollbar-none">
        <div className="bg-gray-800 text-white px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">INVOICE</h1>
              <p className="text-gray-300 mt-1">Order Summary</p>
            </div>
            <button onClick={handleExit} className="text-gray-300 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="px-8 py-6">
          <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Bill To:</h2>
              <p className="font-medium text-gray-700">{`${firstName || user.firstName} ${lastName || user.lastName}`}</p>
              <p className="text-gray-600">{email || user.email}</p>
              <p className="text-gray-600">{phone || "N/A"}</p>
              <p className="text-gray-600">{streetAddress || "N/A"}</p>
              <p className="text-gray-600">{`${city || "N/A"}, ${region || "N/A"}`}</p>
              <p className="text-gray-600">{country || "N/A"}</p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Details:</h2>
              <p className="text-gray-600">Date: {new Date().toLocaleDateString()}</p>
              <p className="text-gray-600">Order ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>
          </div>
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-gray-600">Item</th>
                  <th className="text-center py-3 px-2 text-gray-600">Qty</th>
                  <th className="text-right py-3 px-2 text-gray-600">Price</th>
                  <th className="text-right py-3 px-2 text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item) => (
                  
                  <tr key={item._id} className="border-b border-gray-100">
                    <td className="py-4 px-2">
                      <div className="flex items-center">
                        <img src={item.image[0]} alt={item.name} className="w-16 h-16 object-contain rounded mr-4" />
                        <div>
                          <p className="font-medium text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-600">Color: {item.color}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-4 px-2 text-gray-700">{item.quantity}</td>
                    <td className="text-right py-4 px-2 text-gray-700">₹{item.price}</td>
                    <td className="text-right py-4 px-2 text-gray-700">₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-200 pt-8">
            <div className="w-full md:w-1/2 ml-auto">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{itemsPrice}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shippingPrice === 0 ? "Free" : `₹${shippingPrice}`}</span>
                </div>
                {memberShip && (
                  <div className="flex justify-between text-green-600">
                    <span>Membership Discount</span>
                    <span>- ₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-800 pt-3 border-t">
                  <span>Total</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-8 py-6 bg-gray-50">
        <div className="mt-2">
              <button
                type="submit"
                disabled={PaymentDone}
                className={`w-full flex justify-center items-center px-1 py-3 rounded-md text-white text-lg font-medium transition-colors duration-200 ${
                  PaymentDone
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                {PaymentDone ? (
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
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  <button
                  onClick={()=>{
                    setPaymentDone(true);
                    handlePayment();
                  }}
                  className="w-full bg-gray-800 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Proceed to Payment</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </button>
                )}
              </button>
            </div>
         
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;
