import Order from "../models/orderSchema.model.js";
import Membership from "../models/membership.model.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

// Backend: Membership Payment Initiation
export const initiateMembershipPayment = async (req, res) => {

  try {
    const { user } = req.body;

    // Validate the user ID
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Find user details (you can fetch more info if needed)
    const userRecord = await User.findById(user);

    if (!userRecord) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Set up Razorpay payment options for membership
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const membershipAmount = 1000; // Example membership amount in INR

    const options = {
      amount: membershipAmount * 100, // Amount in paise
      currency: "INR",
      receipt: `membership_receipt_${Date.now()}`,
    };

    // Create a Razorpay order for membership payment
    const razorpayOrder = await razorpay.orders.create(options);

    if (!razorpayOrder || !razorpayOrder.id) {
      return res.status(500).json({
        success: false,
        message: "Unable to create payment order. Please try again later.",
      });
    }

    // Create or update user's membership
    const membership = {
      userId: userRecord._id.toString(),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Membership valid for 30 days
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: "pending",
    };


    // Save membership information in the database (assumes you have a Membership model)
    await Membership.create(membership);

    res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error("Error in initiateMembershipPayment:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

export const verifyMembershipPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      membershipDuration,
      userId,
    } = req.body;

    // Verify the Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("base64");

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Calculate the membership expiration date
    const membershipDurationInMs =
      membershipDuration * 30 * 24 * 60 * 60 * 1000; // duration in days
    const expiresAt = new Date(Date.now() + membershipDurationInMs);

    const updateMembership = await Membership.findOneAndUpdate(
      { razorpayOrderId, userId },
      {
        $set: {
          razorpayPaymentId,
          razorpaySignature,
          paymentStatus: "successful",
          paymentMethod: "razorpay",
          isPaid: true,
          paidAt: new Date(),
          expiresAt,
        },
      },
      { new: true }
    );

    if (!updateMembership) {
        return res.status(404).json({
          success: false,
          message: "Membership not found for the given Razorpay order ID",
        });
      }

    res.status(200).json({
      success: true,
      message: "Payment verified and membership created successfully",
      updateMembership,
    });
  } catch (error) {
    console.error("Error in verifyMembershipPayment:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const checkMembershipStatus = async (req, res) => {
  const { userId } = req.body;

  try {
    const membership = await Membership.findOne({ userId });

    if (membership && membership.paymentStatus === "successful") {
      const currentDate = new Date();
      // Check if the membership is still valid
      if (
        currentDate >= membership.createdAt &&
        currentDate <= membership.expiresAt
      ) {
        return res.status(200).json({ active: true });
      }
    }

    res.status(200).json({ active: false });
  } catch (error) {
    console.error("Error fetching membership:", error);
    res.status(500).json({ error: "Failed to fetch membership status." });
  }
};
