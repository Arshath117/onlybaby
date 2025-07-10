import Order from "../models/orderSchema.model.js";
import Member from "../models/membership.model.js";
import crypto from "crypto";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import twilio from "twilio";
import Product from "../models/product.model.js";
import mongoose from "mongoose";
import { sendOrderSuccessEmail, sendOrderToOwnerEmail } from "../Mail/mail.js";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER; 
const storeOwnerNumber = process.env.STORE_OWNER_WHATSAPP;
const messageTemplate = process.env.TWILIO_MESSAGE_TEMPLATE;
const client = twilio(accountSid, authToken);

export const saveOrUpdateDraftOrder = async (req, res) => {
  try {
    const { user, orderItems, shippingAddress, itemsPrice } = req.body;
    const totalPrice = itemsPrice;

    // Find the user's order document
    let userOrder = await Order.findOne({ user });


    if (!userOrder) {
      // Create a new order document for the user if it doesn't exist
      userOrder = await Order.create({
        user,
        orders: [],
      });
    }

    console.log(" orders for shipping fee", userOrder)

    // Check if the user has a purchase history
    const hasPurchasedBefore = userOrder.orders.length > 0;

    console.log(" orders for shipping fee", userOrder.orders)


    // Determine the shipping fee
    const shippingFee = hasPurchasedBefore ? 50 : 0;

    // Check for an existing draft order
    const draftOrderIndex = userOrder.orders.findIndex(
      (order) => order.isDraft
    );

    const newOrder = {
      orderItems: orderItems.map((item) => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        image: item.image,
        color: item.color,
        quantity: item.cartQuantity || item.quantity,
        discount: item.discount || 0,
      })),
      shippingAddress: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        country: shippingAddress.country || "India", // Default value
        streetAddress: shippingAddress.streetAddress,
        apartment: shippingAddress.apartment || "",
        city: shippingAddress.city,
        state: shippingAddress.state,
        postcode: shippingAddress.postcode,
        phone: shippingAddress.phone,
        email: shippingAddress.email,
      },
      totalPrice: totalPrice + shippingFee, // Include shipping fee in total price
      shippingFee, // Add shipping fee to the order object
      isDraft: true,
      draftExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
    };

    if (draftOrderIndex !== -1) {
      // Update existing draft order
      userOrder.orders[draftOrderIndex] = {
        ...userOrder.orders[draftOrderIndex],
        ...newOrder,
      };
    } else {
      // Add new draft order
      userOrder.orders.push(newOrder);
    }

    await userOrder.save();

    res.status(200).json({
      success: true,
      order: userOrder.orders[userOrder.orders.length - 1],
      shippingFee,
    });
  } catch (error) {
    console.error("Error in saveOrUpdateDraftOrder:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const initiatePayment = async (req, res) => {
  try {
    const { user, itemsPrice, shippingPrice, orderItems, addressId } = req.body; // Add shippingPrice

    // Validate inputs
    if (!user || !itemsPrice || !orderItems || !addressId || typeof shippingPrice === 'undefined') {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: user, itemsPrice, shippingPrice, orderItems, or addressId.",
      });
    }

    let member = await Member.findOne({ userId : user });
    let userOrder = await Order.findOne({ user });

    if (!userOrder) {
      userOrder = await Order.create({ user, orders: [] });
    }

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid orderItems format. Must be a non-empty array.",
      });
    }

    const draftOrder = userOrder.orders.find((order) => order.isDraft);
    const storedShippingFee = draftOrder?.shippingFee || 0; // Use stored value
    
    // Use received shippingPrice from frontend, not stored, for current calculation
    const baseTotal = itemsPrice + shippingPrice; // Calculate base

    let finalTotal = baseTotal;

    if(member && member.paymentStatus){
      finalTotal = baseTotal - (0.1 * baseTotal); // Apply discount
    }

    // Init Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Order options
    const options = {
      amount: Math.round(finalTotal * 100), // Amount paisa
      currency: "INR",
      receipt: `r${Date.now().toString().slice(-8)}_${user.slice(-8)}`, // Shorten receipt
    };

    let razorpayOrder;

    try {
      razorpayOrder = await razorpay.orders.create(options);
    } catch (err) {
      console.error("Razorpay order creation failed:", err?.message, err?.error);
      return res.status(err?.statusCode || 400).json({ // Handle Razorpay's specific status codes
        success: false,
        message: "Razorpay order creation failed: " + err?.message,
        details: err?.error,
      });
    }

    // Moved check inside try-catch to ensure razorpayOrder exists
    if (!razorpayOrder || !razorpayOrder.id) {
        console.error("Failed to create Razorpay order: Order object invalid.");
        return res.status(500).json({
          success: false,
          message: "Unable to create payment order. Invalid Razorpay order response.",
        });
    }

    const draftOrderIndex = userOrder.orders.findIndex(
      (order) => order.isDraft
    );

    if (draftOrderIndex !== -1) {
      userOrder.orders[draftOrderIndex].payment = {
        razorpayOrderId: razorpayOrder.id,
        paymentStatus: "pending",
      };
      userOrder.orders[draftOrderIndex].totalPrice = finalTotal; // Update price
    } else {
      const newOrder = {
        orderItems: orderItems.map((item) => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          image: item.image,
          color: item.color,
          quantity: item.cartQuantity || item.quantity || 1,
          discount: item.discount || 0,
        })),
        shippingAddress: {
          firstName: addressId.firstName,
          lastName: addressId.lastName,
          country: addressId.country || "India",
          streetAddress: addressId.streetAddress,
          apartment: addressId.apartment || "",
          city: addressId.city,
          state: addressId.state,
          postcode: addressId.postcode,
          phone: addressId.phone,
          email: addressId.email,
        },
        totalPrice: finalTotal, // Use final total
        isDraft: true,
        payment: {
          razorpayOrderId: razorpayOrder.id,
          paymentStatus: "pending",
        },
      };

      userOrder.orders.push(newOrder);
    }

    // Save order
    await userOrder.save();

    // Send response
    res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error("Error in initiatePayment:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};


export const sendWhatsappMessage = async (orderDetails) => {
  try {

  const order_id = orderDetails._id.toString();  
  const customer_first_name = orderDetails.shippingAddress?.firstName || "N/A"; 
  const customer_last_name = orderDetails.shippingAddress?.lastName || "N/A"; 
  const address = orderDetails.shippingAddress?.streetAddress || "N/A"; 
  const city = orderDetails.shippingAddress?.city || "N/A"; 
  const state = orderDetails.shippingAddress?.state || "N/A"; 
  const postal_code = orderDetails.shippingAddress?.postcode || "N/A"; 
  const items = orderDetails.orderItems
    .map((item) => ` ${item.quantity}x ${item.name}, Color : ${item.color} `)
    .join(", "); 
  const purchaser_number = orderDetails.shippingAddress?.phone || "N/A"; 
  const total_price = orderDetails.totalPrice?.toString() || "0.00"; 
  const paid_at = orderDetails.payment?.paidAt?.toISOString() || new Date().toISOString(); 

    const response = await client.messages.create({
      from: whatsappNumber,
      to: storeOwnerNumber,
      contentSid: messageTemplate,
      contentVariables: JSON.stringify({
        1: order_id,
        2: customer_first_name,
        3: customer_last_name,
        4: address,
        5: city,
        6: state,
        7: postal_code,
        8: items,
        9: purchaser_number,
        10: total_price,
        11: paid_at
      })
     
    }).then(message => console.log("Message Sent! SID:", message.sid))
    .catch(error => console.error("Error Sending Message:", error));
  
    
  } catch (error) {
    console.log(`Error caught ${error}`);
  }
}

export const verifyPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    console.log("Verifying payment:", { razorpayOrderId, razorpayPaymentId, razorpaySignature });

    const userOrder = await Order.findOne({
      "orders.payment.razorpayOrderId": razorpayOrderId,
    }).session(session);

    if (!userOrder) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const orderIndex = userOrder.orders.findIndex(
      (order) => order.payment.razorpayOrderId === razorpayOrderId
    );

    if (orderIndex === -1) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Draft order not found" });
    }


    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    console.log("Generated Signature:", generatedSignature);

    if (generatedSignature !== razorpaySignature) {
      userOrder.orders[orderIndex].payment = {
        ...userOrder.orders[orderIndex].payment,
        paymentStatus: "failed",
        paymentMessage: "Invalid payment signature",
      };
      await userOrder.save({ session });
      await session.commitTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    userOrder.orders[orderIndex].payment = {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      isPaid: true,
      paidAt: new Date(),
      paymentStatus: "successful",
      paymentMethod: "razorpay",
    };
    userOrder.orders[orderIndex].isDraft = false;

    await userOrder.save({ session });

    const orderDetails = userOrder.orders[orderIndex];

    for (const item of orderDetails.orderItems) {
      const product = await Product.findById(item._id).session(session);
      if (!product) throw new Error(`Product not found: ${item._id}`);
      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.name}`);
      }
      await Product.findByIdAndUpdate(
        item._id,
        { $inc: { quantity: -item.quantity } },
        { new: true, session }
      );
    }
    console.log(orderDetails)
        // If the user closes Razorpay without completing the payment, handle it gracefully
        if (!orderDetails.payment.isPaid) {
          console.log("Payment not completed. Order remains in draft state.");
          return res.status(400).json({
          success: false,
          message: "Payment not completed. Please try again.",
          });
        }

    await sendOrderSuccessEmail(orderDetails);
    await sendOrderToOwnerEmail(orderDetails);
    await sendWhatsappMessage(orderDetails);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order: orderDetails,
    });
  } catch (error) {
    console.error("Error in verifyPayment:", error.message, error.stack);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getOrderHistory = async (req, res) => {
  try {
    // Read the user ID from the query parameters for GET requests
    const { user } = req.query;
    console.log(user);

    // Ensure the user is provided
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Find all orders related to the user
    const userOrders = await Order.find({ user }).sort({ createdAt: -1 });

    if (!userOrders || userOrders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this user",
      });
    }

    const orderHistory = userOrders
      .map((userOrder) => userOrder.orders) 
      .flat() // Flatten the array to get all individual orders
      ?.filter((order) => !order.isDraft) // Filter out draft orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by creation date

    res.status(200).json({ success: true, orders: orderHistory });
  } catch (error) {
    console.error("Error in getOrderHistory:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getCurrentDraftOrder = async (req, res) => {
  try {
    const { user } = req.query;
    const userOrder = await Order.findOne({ user });

    if (!userOrder) {
      return res.status(404).json({
        success: false,
        message: "No draft order found", 
      });
    }

    const draftOrder = userOrder.orders.find((order) => order.isDraft);

    if (!draftOrder) {
      return res.status(404).json({
        success: false,
        message: "No draft order found",
      });
    }

    res.status(200).json({ success: true, order: draftOrder });
  } catch (error) {
    console.error("Error in getCurrentDraftOrder:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
