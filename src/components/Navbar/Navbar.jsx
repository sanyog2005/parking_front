// src/components/Navbar.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaParking } from "react-icons/fa";
// import logo from "../../assets/logocar.png"; // Replaced with Icon for better UI, uncomment if needed
import axios from "axios";

// Constants (Kept exactly as requested)
const LOGOUT_ENDPOINT = "/api/auth/logout";
const ME_ENDPOINT = "/api/auth/me"; // Added this const based on your validateToken logic

const Navbar = () => {
  // --- EXISTING STATE & LOGIC (UNCHANGED) ---
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("token")
  );
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const abortRef = useRef(null);

  const base = "http://localhost:1000";
  const api = axios.create({
    baseURL: base,
    headers: { Accept: "application/json" },
  });

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/cars", label: "Parking Spots" }, // Updated label for UI context
    { to: "/contact", label: "contact" },        // Added for UI completeness
    { to: "/bookings", label: "My Spots" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const validateToken = useCallback(
    async (signal) => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
        setUser(null);
        return;
      }

      try {
        // Note: Ensure ME_ENDPOINT is defined or replace with string "/api/auth/me"
        const res = await api.get("/api/auth/me", {
          signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const profile = res?.data?.user ?? res?.data ?? null;
        if (profile) {
          setIsLoggedIn(true);
          setUser(profile);
          try {
            localStorage.setItem("user", JSON.stringify(profile));
          } catch {}
        } else {
          setIsLoggedIn(true);
          setUser(null);
        }
      } catch (err) {
        if (
          axios.isAxiosError(err) &&
          err.response &&
          err.response.status === 401
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsLoggedIn(false);
          setUser(null);
        } else {
          setUser(null);
        }
      }
    },
    [api]
  );

  useEffect(() => {
    if (abortRef.current) {
      try {
        abortRef.current.abort();
      } catch {}
    }
    const controller = new AbortController();
    abortRef.current = controller;
    validateToken(controller.signal);

    return () => {
      try {
        controller.abort();
      } catch {}
      abortRef.current = null;
    };
  }, [validateToken]);

  useEffect(() => {
    const handleStorageChange = (ev) => {
      if (ev.key === "token" || ev.key === "user") {
        if (abortRef.current) {
          try {
            abortRef.current.abort();
          } catch {}
        }
        const controller = new AbortController();
        abortRef.current = controller;
        validateToken(controller.signal);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [validateToken]);

  const handleLogout = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await api.post(
          LOGOUT_ENDPOINT,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 2000,
          }
        );
      } catch {}
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setIsOpen(false);

    navigate("/", { replace: true });
  }, [api, navigate]);

  useEffect(() => {
    setIsOpen(false);
    setIsLoggedIn(!!localStorage.getItem("token"));
    try {
      const raw = localStorage.getItem("user");
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // --- NEW UI RENDERING (Tailwind) ---

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ease-in-out ${
        scrolled
          ? "bg-gray-900/95 backdrop-blur-md shadow-lg py-3 border-b border-white/10"
          : "bg-transparent py-5"
      }`}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group">
             <div className="bg-yellow-500 p-2 rounded-lg text-gray-900 transition-transform group-hover:scale-105 shadow-lg shadow-yellow-500/20">
                <FaParking className="text-xl" />
             </div>
             <span className="text-2xl font-bold tracking-tight text-white">
               Park<span className="text-yellow-500">King</span>
             </span>
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden lg:flex items-center gap-1 bg-white/5 rounded-full px-2 py-1 backdrop-blur-sm border border-white/10">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive(link.to)
                    ? "bg-yellow-500 text-gray-900 shadow-md shadow-yellow-500/20 font-bold"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* DESKTOP AUTH BUTTONS */}
          <div className="hidden lg:flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <div className="text-right hidden xl:block">
                    <p className="text-xs text-white">Welcome back,</p>
                    <p className="text-sm font-semibold text-yellow-500">{user?.name || ""}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                  aria-label="Logout"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:-translate-y-0.5"
                aria-label="Login"
              >
                <FaUser />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="lg:hidden flex items-center">
            <button
              ref={buttonRef}
              onClick={() => setIsOpen((p) => !p)}
              className="text-gray-300 hover:text-yellow-500 p-2 focus:outline-none transition-colors"
              aria-expanded={isOpen}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      <div
        id="mobile-menu"
        ref={menuRef}
        className={`lg:hidden absolute top-full left-0 w-full bg-gray-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="px-4 py-6 space-y-4">
          <div className="grid gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  isActive(link.to)
                    ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="h-px bg-white/10 my-4" />

          <div>
            {isLoggedIn ? (
              <div className="space-y-3">
                 <div className="px-4 text-gray-400 text-sm">
                    Logged in as <span className="text-yellow-500 font-semibold">{user?.name}</span>
                 </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white py-3 rounded-xl font-medium transition-all"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-gray-900 hover:bg-yellow-400 py-3 rounded-xl font-bold shadow-lg shadow-yellow-500/20 transition-all"
              >
                <FaUser />
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;