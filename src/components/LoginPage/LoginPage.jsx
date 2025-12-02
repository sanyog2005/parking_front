// src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { FaUser, FaLock, FaArrowLeft, FaEye, FaEyeSlash, FaParking, FaSignInAlt } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const base = "https://parking-backend-3tgb.onrender.com";
      const url = `${base}/api/auth/login`;

      const res = await axios.post(url, credentials, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.status >= 200 && res.status < 300) {
        const { token, user, message } = res.data || {};

        if (token) localStorage.setItem("token", token);
        if (user) localStorage.setItem("user", JSON.stringify(user));

        toast.success(message || "Login Successful!", {
          position: "top-right",
          autoClose: 1000,
          theme: "dark",
          onClose: () => navigate("/", { replace: true }),
        });
      } else {
        toast.error("Unexpected response", { theme: "dark" });
      }
    } catch (err) {
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed";
      toast.error(serverMessage, { theme: "dark" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-yellow-500/30">
      
      {/* --- Ambient Background --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[100px] opacity-50 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>
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

      {/* --- Login Card --- */}
      <div className="relative z-10 w-full max-w-md bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-fadeInUp">
        
        {/* Decorative Top Border */}
        <div className="h-1.5 w-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600"></div>

        <div className="p-8 md:p-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 shadow-lg mb-4 group hover:scale-105 transition-transform">
              <FaParking className="text-3xl text-yellow-500" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
              Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Back</span>
            </h1>
            <p className="text-gray-400 text-sm">Access your premium parking dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-yellow-500 transition-colors">
                  <FaUser />
                </div>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-950/50 border border-gray-700 text-white rounded-xl py-3.5 pl-11 pr-4 placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-yellow-500 transition-colors">
                  <FaLock />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={credentials.password}
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
                "Verifying..."
              ) : (
                <>
                  <FaSignInAlt /> Login to Account
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm mb-3">New to ParkKing?</p>
            <Link
              to="/signup"
              className="inline-block w-full py-3.5 rounded-xl border border-white/10 bg-white/5 text-white font-bold text-sm hover:bg-white/10 hover:border-white/20 transition-all"
            >
              CREATE ACCOUNT
            </Link>
          </div>

        </div>
      </div>

      <ToastContainer position="top-right" theme="dark" />
      
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

export default LoginPage;