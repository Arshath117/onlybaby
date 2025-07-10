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
  const { memberShip, shippingPrice: contextShippingPrice, singleProduct, removeCart } = useContext(ToyStore);
  const [PaymentDone, setPaymentDone] = useState(false);

  const { orderItems = [], shippingAddress = {}, itemsPrice: initialItemsPriceFromState } = state?.orderData || {};
  console.log(`order items : ${orderItems.map((item) => item._id)}`);
  const { firstName, lastName, email, phone, streetAddress, city, state: region, country } = shippingAddress;

  const calculateEffectiveItemsPrice = () => {
    return orderItems.reduce((total, item) => {
      const itemPriceAfterDiscount = item.discount && typeof item.discount === 'number' && item.discount > 0
        ? item.price * (1 - item.discount / 100)
        : item.price;
      return total + (itemPriceAfterDiscount * item.quantity);
    }, 0);
  };

  const actualItemsPrice = calculateEffectiveItemsPrice();
  const shippingPrice = state?.orderData?.shippingPrice !== undefined ? state.orderData.shippingPrice : contextShippingPrice;
  const memberShipStatus = memberShip; 

  const subtotal = actualItemsPrice + shippingPrice;
  const discount = memberShipStatus ? 0.1 * subtotal : 0;
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
    // Initiate order
    const paymentResponse = await axios.post(`${import.meta.env.VITE_API}/api/orders/initiate`, {
      itemsPrice: actualItemsPrice, 
      shippingPrice, 
      totalPrice: grandTotal, // Frontend total
      addressId: shippingAddress,
      user: user._id, 
      orderItems,
    });

    const razorpayOrder = paymentResponse.data;

    console.log("Backend Order ID:", razorpayOrder.razorpayOrderId);

    // Razorpay options
    const options = {
      key: "rzp_live_LGA3iThZiQagH7", 
      amount: razorpayOrder.amount, // Backend amount
      currency: "INR",
      order_id: razorpayOrder.razorpayOrderId, 
      handler: async (response) => {
        if (!response) {
          toast.error("Payment failed! No response received.");
          return;
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response || {};
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
          toast.error("Invalid Razorpay response!");
          return;
        }

        console.log("Razorpay Response:", response);

        try {
          // Verify payment
          const res = await axios.post(`${import.meta.env.VITE_API}/api/orders/verify`, {
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
          });

          if (res.data.success) { 
            setPaymentDone(true); 
            toast.success("Payment successful! Order placed.");
            navigate("/");
            if (!singleProduct) { 
              removeCart();
            }
          } else {
            setPaymentDone(false);
            toast.error("Payment failed! Please try again.");
          }
        } catch (error) {
          setPaymentDone(false);
          toast.error("Payment verification failed! Please try again.");
          console.error("Verification error:", error.response?.data || error);
        }
      },
      prefill: { 
        name: `${user.firstName} ${user.lastName}`, 
        email: user.email, 
        contact: user.phone 
      },
      theme: { color: "#F37254" },
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.open(); // Open checkout
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
                    <td className="text-right py-4 px-2 text-gray-700">
                      {item.discount && typeof item.discount === 'number' && item.discount > 0 ? (
                        <div className="flex flex-col items-end">
                          <span className="line-through text-gray-500 text-sm">
                            ₹{item.price.toFixed(2)}
                          </span>
                          <span className="font-semibold">
                            ₹{(item.price * (1 - item.discount / 100)).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span>₹{item.price.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="text-right py-4 px-2 text-gray-700">
                      {item.discount && typeof item.discount === 'number' && item.discount > 0 ? (
                        <span>
                          ₹{((item.price * (1 - item.discount / 100)) * item.quantity).toFixed(2)}
                        </span>
                      ) : (
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      )}
                    </td>
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
                  <span>₹{actualItemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shippingPrice === 0 ? "Free" : `₹${shippingPrice.toFixed(2)}`}</span>
                </div>
                {memberShipStatus && (
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
              type="button" 
              disabled={PaymentDone}
              className={`w-full flex justify-center items-center px-1 py-3 rounded-md text-white text-lg font-medium transition-colors duration-200 ${
                PaymentDone
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
              onClick={() => { 
                setPaymentDone(true);
                handlePayment();
              }}
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
                <> 
                  <span>Proceed to Payment</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;