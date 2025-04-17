import { emailTemplates } from "./emailTemplates.js";
import { sendMail, transporter } from "./mailGenerate.js";
import dotenv from "dotenv";

dotenv.config();

export const sendVerificationEmail = async(email,name,verificationToken) => {
    try{
        const recipient = email;
        const mailOptions = {
            from : {
                name : "Only Baby",
                address:"onlybaby7999@gmail.com",
            },
            to : recipient,
            subject : "Verify your email address",
            html: emailTemplates.verifyEmail({
                name : name,
                otp: verificationToken,  
            })
        }
        await sendMail(transporter,mailOptions);  
    }catch(error){
        console.log("Error in sending verification email",error.message);
        throw new Error(error.message);
    }
}

export const sendWelcomeEmail = async(email,name) => {
    try{
        const recipient = email;
        const mailOptions = {
            from : {
                name : "Only Baby",
                address:"onlybaby7999@gmail.com",
            },
            to : email,
            subject : "Welcome to Only Baby",
            html: emailTemplates.welcome({
                name : name,
                shopUrl : process.env.CLIENT_URL,
            })
        }
        await sendMail(transporter,mailOptions);
    }catch(error){
        console.log("Error in sending welcome email",error.message);
        throw new Error(error.message);
    }
}

export const sendResetPasswordEmail = async(email,resetURL) => {
    try{
        const recipient = email;
        const mailOptions ={
            from : {
                name : "Only Baby",
                address:"onlybaby7999@gmail.com",
            },
            to : email,
            subject : "Reset your password",
            html: emailTemplates.resetPasswordButton({
                name: "Champion",	
                resetURL : resetURL,
            }),
        }
        await sendMail(transporter,mailOptions);
    }catch(error){
        console.log("Error in sending reset password email",error.message);
        throw new Error(error.message);
    }
}


export const sendResetSuccessEmail = async(email) => {
    try{
        const recipient = email;
        const mailOptions = {
            from : {
                name : "Only Baby",
                address:"onlybaby7999@gmail.com",
            },
            to : email,
            subject : "Password Reset Successful",
            html: emailTemplates.resetSuccess({
                name : "Champion",
            })
        }
        await sendMail(transporter,mailOptions);
    }catch(error){
        console.log("Error in sending reset success email",error.message);
        throw new Error(error.message);
    }   
}

export const sendOrderSuccessEmail = async (orderDetails) => {
    try {
      const recipient = orderDetails.shippingAddress.email;
      
      const itemsList = orderDetails.orderItems
        .map(
          (item) => `${item.name} (x${item.quantity}): ₹${item.price.toFixed(2)}`
        )
        .join("<br>");
  
      const mailOptions = {
        from: {
          name: "Only Baby",
          address: "onlybaby7999@gmail.com",
        },
        to: recipient,
        subject: "Your Order Confirmation",
        html: `
          <h2>Thank you for your order!</h2>
          <p><strong>Order ID:</strong> ${orderDetails.payment.razorpayOrderId}</p>
          <p><strong>Shipping Address:</strong><br>
             ${orderDetails.shippingAddress.firstName} ${orderDetails.shippingAddress.lastName}<br>
             ${orderDetails.shippingAddress.streetAddress}<br>
             ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} - ${orderDetails.shippingAddress.postcode}
          </p>
          <p><strong>Order Details:</strong><br>
             ${itemsList}
          </p>
          <p><strong>Total Price:</strong> ₹${orderDetails.totalPrice.toFixed(2)}</p>
          <p>We will notify you once your order is shipped. Thank you for shopping with Only Baby!</p>
        `,
      };
  
      await sendMail(transporter, mailOptions);
    } catch (error) {
      console.log("Error in sending order success email", error.message);
      throw new Error(error.message);
    }
  };
  

  export const sendOrderToOwnerEmail = async (orderDetails) => {
    try {
      const ownerEmail = "onlybaby7999@gmail.com"; // Owner's email address
      const itemsList = orderDetails.orderItems
        .map(
          (item) => `${item.name} (x${item.quantity}): ₹${item.price.toFixed(2)}`
        )
        .join("<br>");
  
      const mailOptions = {
        from: {
          name: "Only Baby Orders",
          address: "onlybaby7999@gmail.com",
        },
        to: ownerEmail, // Send the email to the owner
        subject: `New Order Received: ${orderDetails.payment.razorpayOrderId}`,
        html: `
          <h2>New Order Received</h2>
          <p><strong>Order ID:</strong> ${orderDetails.payment.razorpayOrderId}</p>
          <p><strong>Customer Name:</strong> ${orderDetails.shippingAddress.firstName} ${orderDetails.shippingAddress.lastName}</p>
          <p><strong>Shipping Address:</strong><br>
             ${orderDetails.shippingAddress.firstName} ${orderDetails.shippingAddress.lastName}<br>
             ${orderDetails.shippingAddress.streetAddress}<br>
             ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} - ${orderDetails.shippingAddress.postcode}
          </p>
          <p><strong>Order Details:</strong><br>
             ${itemsList}
          </p>
          <p><strong>Total Price:</strong> ₹${orderDetails.totalPrice.toFixed(2)}</p>
          <p>Thank you for managing the orders efficiently!</p>
        `,
      };
  
      await sendMail(transporter, mailOptions);
      console.log("Order email sent to owner successfully.");
    } catch (error) {
      console.log("Error in sending order email to owner:", error.message);
      throw new Error(error.message);
    }
  };
  