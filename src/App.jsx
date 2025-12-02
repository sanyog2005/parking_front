// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { FaArrowUp } from "react-icons/fa";

import Home from "./pages/Home/Home";
import Cars from "./pages/Cars/Cars";
import CarDetail from "./pages/CarDetail/CarDetail";
import Login from "./pages/Login/Login";
import SignUp from "./pages/SignUp/SignUp";
import Contact from "./pages/Contact/Contact";
import MyBookings from "./pages/Mybookings/MyBookings";
import VerifyPaymentPage from "../VerifyPaymentPage"; // <- fixed import path

// ProtectedRoute Component
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const authToken = localStorage.getItem("token");

  if (!authToken) {
    // keep the attempted path so you can redirect back after login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

// Optional: redirect authenticated users away from auth pages like /login or /signup
const RedirectIfAuthenticated = ({ children }) => {
  const authToken = localStorage.getItem("token");
  if (authToken) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  const [showButton, setShowButton] = useState(false);
  const location = useLocation();

  // Scroll to top on route change (smooth)
  useEffect(() => {
    // use a short timeout to allow in-page anchors to behave better, if needed
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [location.pathname]);

  // Show/hide button on scroll
  useEffect(() => {
    const handleScroll = () => setShowButton(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll, { passive: true });
    // initialize state
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cars" element={<Cars />} />
        <Route
          path="/cars/:id"
          element={
            <ProtectedRoute>
              <CarDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        <Route path="/contact" element={<Contact />} />

        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <Login />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectIfAuthenticated>
              <SignUp />
            </RedirectIfAuthenticated>
          }
        />

        {/* Stripe success/cancel both handled by VerifyPaymentPage */}
        <Route path="/success" element={<VerifyPaymentPage />} />
        <Route path="/cancel" element={<VerifyPaymentPage />} />

        {/* Fallback route — simple 404 behavior */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showButton && (
        <button
          type="button"
          onClick={scrollUp}
          title="Scroll to top"
          aria-label="Scroll to top"
          className="fixed cursor-pointer bottom-8 right-8 p-3 rounded-full bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg transition-colors focus:outline-none"
        >
          <FaArrowUp size={20} aria-hidden="true" />
        </button>
      )}
    </>
  );
};

export default App;
