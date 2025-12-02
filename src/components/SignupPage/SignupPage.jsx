// src/pages/SignupPage.jsx
import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaParking,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!acceptedTerms) {
      toast.error("Please accept terms & conditions", { theme: "dark" });
      return;
    }

    setLoading(true);
    try {
      const base = "http://localhost:1000";
      const url = `${base}/api/auth/register`;

      const res = await axios.post(url, formData, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.status >= 200 && res.status < 300) {
        const { token, user } = res.data || {};
        if (token) localStorage.setItem("token", token);
        if (user) localStorage.setItem("user", JSON.stringify(user));

        toast.success("Account created! Redirecting...", {
          position: "top-right",
          autoClose: 1500,
          theme: "dark",
          onClose: () => navigate("/login"),
        });
        return;
      }
      toast.error("Unexpected response.", { theme: "dark" });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed";
      toast.error(msg, { theme: "dark" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-yellow-500/30">
      
      {/* --- Ambient Background --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[100px] opacity-50 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* --- Back Button --- */}
      <Link
        to="/"
        className="absolute top-6 left-6 md:top-8 md:left-8 z-20 flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition-colors group"
      >
        <div className="p-2 rounded-full bg-gray-900/50 border border-gray-800 group-hover:border-yellow-500/50 transition-colors">
            <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
        </div>
        <span className="text-sm font-bold tracking-wide">BACK TO HOME</span>
      </Link>

      {/* --- Main Card --- */}
      <div className="relative z-10 w-full max-w-md bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-fadeInUp">
        
        {/* Decorative Top Border */}
        <div className="h-1.5 w-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600"></div>

        <div className="p-8 md:p-10">
          
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 shadow-lg mb-4 group hover:scale-105 transition-transform">
              <FaParking className="text-3xl text-yellow-500" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
              Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">ParkKing</span>
            </h1>
            <p className="text-gray-400 text-sm">Create your premium account today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Name Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-yellow-500 transition-colors">
                <FaUser />
              </div>
              <input
                name="name"
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-gray-950/50 border border-gray-700 text-white rounded-xl py-3.5 pl-11 pr-4 placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
              />
            </div>

            {/* Email Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-yellow-500 transition-colors">
                <FaEnvelope />
              </div>
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-gray-950/50 border border-gray-700 text-white rounded-xl py-3.5 pl-11 pr-4 placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-yellow-500 transition-colors">
                <FaLock />
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-gray-950/50 border border-gray-700 text-white rounded-xl py-3.5 pl-11 pr-12 placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors focus:outline-none"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center gap-3 mt-2">
              <div className="relative flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={() => setAcceptedTerms(!acceptedTerms)}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-600 bg-gray-950 transition-all checked:border-yellow-500 checked:bg-yellow-500 focus:ring-2 focus:ring-yellow-500/50 focus:ring-offset-0"
                />
                <FaCheck className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-gray-900 opacity-0 transition-opacity peer-checked:opacity-100" />
              </div>
              <label htmlFor="terms" className="text-sm text-gray-400 cursor-pointer select-none">
                I agree to the <span className="text-yellow-500 hover:underline">Terms & Conditions</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide uppercase transition-all transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 ${
                loading
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 hover:shadow-yellow-500/25 hover:brightness-110"
              }`}
            >
              {loading ? (
                "Creating Account..."
              ) : (
                <>
                  Create Account <FaCheck />
                </>
              )}
            </button>
          </form>

          {/* Footer - Login Link */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm mb-3">Already have an account?</p>
            <Link
              to="/login"
              className="inline-block w-full py-3.5 rounded-xl border border-white/10 bg-white/5 text-white font-bold text-sm hover:bg-white/10 hover:border-white/20 transition-all"
            >
              LOGIN HERE
            </Link>
          </div>

        </div>
      </div>

      <ToastContainer position="top-right" theme="dark" />
      
      {/* Simple Fade In Animation */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SignupPage;