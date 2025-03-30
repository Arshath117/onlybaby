import React from "react";
import Home from "./components/Home";
import Footer from "./components/footer/Footer";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToyStoreProvider } from "./components/context/ContextApi";
import About from "./components/about/About.jsx";
import LoginPopup from "./components/popup/LoginPopup.jsx";
import Nav from "./components/Nav.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ResetPassword from "./components/registerLogin/ResetPassword.jsx";
import SingleProduct from "./components/product/SingleProduct.jsx";
import PaymentConfirmation from "./components/payment/PaymentConfirmation"; // Add the PaymentConfirmation import
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./components/ScrollToTop.jsx";
import AllProducts from "./components/allProducts/Index.jsx";
import UserPurchaseHistory from "./components/user/userPurchaseHistory.jsx";
const App = () => {
  return (
    <div>
      <Router>
        {/* hello dev */}
        <ScrollToTop />
        <ToyStoreProvider>
          <div className="bg-gradient-to-bl from-sky-50 via-violet-50 to-pink-50">
            <Nav />
            <LoginPopup />
            {/* <Payment /> */}
            <SingleProduct />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/product" element={<AllProducts />} />
                <Route
                  path="/resetPassword/:token"
                  element={<ResetPassword />}
                />
                <Route
                  path="/payment-confirmation"
                  element={<PaymentConfirmation />}
                />{" "}
                {/* Add route for payment confirmation */}
                <Route
                  path="/purchase-history"
                  element={<UserPurchaseHistory />}
                />{" "}
                {/* Add route for purchase history */}
              </Routes>
            </main>

            <Footer />
          </div>
        </ToyStoreProvider>
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
      <Toaster />
    </div>
  );
};

export default App;
