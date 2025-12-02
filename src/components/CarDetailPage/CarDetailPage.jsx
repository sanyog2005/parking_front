// src/pages/CarDetailPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  FaUserFriends,
  FaGasPump,
  FaTachometerAlt,
  FaCheckCircle,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaArrowLeft,
  FaCreditCard,
  FaMapMarkerAlt,
  FaCity,
  FaGlobeAsia,
  FaMapPin,
  FaInfoCircle,
  FaShieldAlt,
  FaStar,
  
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import carsData from "../CarPage/carsData";

const API_BASE = "https://parking-backend-3tgb.onrender.com";
const api = axios.create({
  baseURL: API_BASE,
  headers: { Accept: "application/json" },
});

const todayISO = () => new Date().toISOString().split("T")[0];

// Helper functions
const buildImageSrc = (image) => {
  if (!image) return `${API_BASE}/uploads/default-car.png`;
  if (Array.isArray(image)) image = image[0];
  if (!image || typeof image !== "string")
    return `${API_BASE}/uploads/default-car.png`;
  const t = image.trim();
  if (!t) return `${API_BASE}/uploads/default-car.png`;
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  if (t.startsWith("/")) return `${API_BASE}${t}`;
  return `${API_BASE}/uploads/${t}`;
};

const handleImageError = (e, fallback = `${API_BASE}/uploads/default-car.png`) => {
  const img = e?.target;
  if (!img) return;
  img.onerror = null;
  img.src = fallback;
  img.alt = "Image not available";
};

const calculateDays = (from, to) => {
  if (!from || !to) return 1;
  const days = Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24));
  return Math.max(1, days);
};

const CarDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // State
  const [car, setCar] = useState(() => location.state?.car || null);
  const [loadingCar, setLoadingCar] = useState(false);
  const [carError, setCarError] = useState("");
  const [currentImage, setCurrentImage] = useState(0);
  const [formData, setFormData] = useState({
    pickupDate: "",
    returnDate: "",
    pickupLocation: "",
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [activeField, setActiveField] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [today, setToday] = useState(todayISO());

  const fetchControllerRef = useRef(null);
  const submitControllerRef = useRef(null);

  useEffect(() => setToday(todayISO()), []);

  // Fetch Logic
  useEffect(() => {
    if (car) {
      setCurrentImage(0);
      return;
    }

    const local = carsData.find((c) => String(c.id) === String(id));
    if (local) {
      setCar(local);
      setCurrentImage(0);
      return;
    }

    const controller = new AbortController();
    fetchControllerRef.current = controller;
    (async () => {
      setLoadingCar(true);
      setCarError("");
      try {
        const res = await api.get(`/api/cars/${id}`, { signal: controller.signal });
        const payload = res.data?.data ?? res.data ?? null;
        if (payload) setCar(payload);
        else setCarError("Slot not found.");
      } catch (err) {
        if (!axios.isCancel(err)) {
          setCarError("Failed to load parking details.");
        }
      } finally {
        setLoadingCar(false);
      }
    })();

    return () => {
      try { controller.abort(); } catch {}
    };
  }, [id, car]);

  if (loadingCar && !car) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-yellow-500 animate-pulse">Loading details...</div>;
  if (carError && !car) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-red-400">{carError}</div>;
  if (!car) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Parking slot unavailable.</div>;

  // Derived Data
  const carImages = [
    ...(Array.isArray(car.images) ? car.images : []),
    ...(car.image ? (Array.isArray(car.image) ? car.image : [car.image]) : []),
  ].filter(Boolean);

  const price = Number(car.price ?? car.dailyRate ?? 0) || 0;
  const days = calculateDays(formData.pickupDate, formData.returnDate);
  const calculateTotal = () => days * price;
  const transmissionLabel = car.transmission ? String(car.transmission).toLowerCase() : "standard";

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pickupDate || !formData.returnDate) {
      return toast.error("Please select dates.");
    }
    if (new Date(formData.returnDate) < new Date(formData.pickupDate)) {
      return toast.error("Invalid date range.");
    }

    setSubmitting(true);
    const controller = new AbortController();
    submitControllerRef.current = controller;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      
      const payload = {
        userId: user?.id,
        customer: formData.name,
        email: formData.email,
        phone: formData.phone,
        car: {
          id: car._id ?? car.id,
          name: car.name ?? `${car.make ?? ""} ${car.name ?? ""}`.trim(),
        },
        pickupDate: formData.pickupDate,
        returnDate: formData.returnDate,
        amount: calculateTotal(),
        details: { pickupLocation: formData.pickupLocation },
        address: { city: formData.city, state: formData.state, zipCode: formData.zipCode },
        carImage: carImages[0] ? buildImageSrc(carImages[0]) : undefined,
      };

      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await api.post(`/api/payments/create-checkout-session`, payload, { headers, signal: controller.signal });

      if (res?.data?.url) {
        toast.success("Redirecting...");
        window.location.href = res.data.url;
      } else {
        toast.success("Booking Created!");
        navigate("/bookings");
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        toast.error(err.response?.data?.message || "Booking failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-yellow-500/30 pb-20">
      <ToastContainer theme="dark" />

      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 border border-gray-800 hover:border-yellow-500/50 text-gray-400 hover:text-white transition-all"
          >
            <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-green-400">
              Live Availability
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT COLUMN: Visuals & Info (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Image Gallery */}
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-gray-900 border border-white/5 shadow-2xl group">
              <img
                src={buildImageSrc(carImages[currentImage] ?? car.image)}
                alt={car.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => handleImageError(e)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-transparent to-transparent pointer-events-none" />

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-lg bg-gray-950/60 backdrop-blur border border-white/10 text-xs font-bold uppercase text-white">
                  {car.category || "Premium"}
                </span>
              </div>

              {/* Title Overlay (Mobile/Desktop) */}
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
                  {car.make} <span className="text-yellow-500">{car.year}</span>
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <FaMapMarkerAlt className="text-yellow-500" />{" "}
                    {car.location || "City Center"}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaStar className="text-yellow-500" /> 4.9 (120 reviews)
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {carImages.length > 1 && (
                <div className="absolute bottom-6 right-6 flex gap-2">
                  {carImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentImage
                          ? "bg-yellow-500 w-6"
                          : "bg-white/50 hover:bg-white"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  icon: FaUserFriends,
                  label: "Capacity",
                  value: `${car.seats || "-"} Seats`,
                  color: "text-blue-400",
                },
                {
                  icon: FaGasPump,
                  label: "Type",
                  value: car.fuel || car.fuelType || "EV",
                  color: "text-green-400",
                },
                {
                  icon: FaTachometerAlt,
                  label: "Max Time",
                  value: car.mileage ? `${car.mileage} hrs` : "Unlimited",
                  color: "text-yellow-400",
                },
                {
                  icon: FaShieldAlt,
                  label: "Security",
                  value: "Gated",
                  color: "text-purple-400",
                },
              ].map((spec, i) => (
                <div
                  key={i}
                  className="bg-gray-900/50 border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center hover:border-yellow-500/30 transition-colors"
                >
                  <spec.icon className={`text-2xl mb-2 ${spec.color}`} />
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {spec.label}
                  </p>
                  <p className="text-white font-semibold">{spec.value}</p>
                </div>
              ))}
            </div>
            <div>
              <a
                href={car.model}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-medium hover:text-white hover:bg-white/10 hover:border-yellow-500/50 transition-all duration-300"
              >
                <FaMapMarkerAlt className="text-yellow-500 group-hover:animate-bounce" />
                <span>Location</span>
              </a>
            </div>

            {/* Description & Features */}
            <div className="bg-gray-900/30 rounded-3xl p-8 border border-white/5">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaInfoCircle className="text-yellow-500" /> About this Slot
              </h3>
              <p className="text-gray-400 leading-relaxed mb-8">
                {car.description ||
                  "Secure your vehicle in our premium monitored parking facility. Features wide spaces, excellent lighting, and 24/7 easy access."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "24/7 CCTV Surveillance",
                  "Covered Parking",
                  "EV Charging Available",
                  "Wheelchair Accessible",
                ].map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-950/50 border border-white/5"
                  >
                    <FaCheckCircle className="text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Booking Form (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-8 bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              {/* Price Header */}
              <div className="flex justify-between items-end mb-6 pb-6 border-b border-white/10">
                <div>
                  <p className="text-sm text-gray-400 font-medium">
                    Rate per day
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">
                      ${price}
                    </span>
                    <span className="text-sm text-gray-500">/ 24h</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-bold text-green-400 uppercase tracking-wide bg-green-500/10 px-2 py-1 rounded">
                    Best Value
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Date Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                      Check-in
                    </label>
                    <div
                      className={`relative ${
                        activeField === "pickup" ? "ring-1 ring-yellow-500" : ""
                      } rounded-xl bg-gray-950`}
                    >
                      <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-500" />
                      <input
                        type="date"
                        name="pickupDate"
                        min={today}
                        value={formData.pickupDate}
                        onChange={handleInputChange}
                        onFocus={() => setActiveField("pickup")}
                        onBlur={() => setActiveField(null)}
                        required
                        className="w-full bg-transparent border border-gray-700 rounded-xl py-3 pl-10 pr-2 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                      Check-out
                    </label>
                    <div
                      className={`relative ${
                        activeField === "return" ? "ring-1 ring-yellow-500" : ""
                      } rounded-xl bg-gray-950`}
                    >
                      <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-500" />
                      <input
                        type="date"
                        name="returnDate"
                        min={formData.pickupDate || today}
                        value={formData.returnDate}
                        onChange={handleInputChange}
                        onFocus={() => setActiveField("return")}
                        onBlur={() => setActiveField(null)}
                        required
                        className="w-full bg-transparent border border-gray-700 rounded-xl py-3 pl-10 pr-2 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="space-y-3">
                  {[
                    {
                      name: "name",
                      icon: FaUser,
                      placeholder: "Car Number",
                      type: "text",
                    },
                    {
                      name: "email",
                      icon: FaEnvelope,
                      placeholder: "email",
                      type: "email",
                    },
                    {
                      name: "phone",
                      icon: FaPhone,
                      placeholder: "Phone Number",
                      type: "tel",
                    },
                    {
                      name: "pickupLocation",
                      icon: FaMapMarkerAlt,
                      placeholder: "Pickup Location",
                      type: "text",
                    },
                  ].map((field) => (
                    <div
                      key={field.name}
                      className={`relative group ${
                        activeField === field.name
                          ? "ring-1 ring-yellow-500 rounded-xl"
                          : ""
                      }`}
                    >
                      <field.icon className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
                      <input
                        type={field.type}
                        name={field.name}
                        placeholder={field.placeholder}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        onFocus={() => setActiveField(field.name)}
                        onBlur={() => setActiveField(null)}
                        required
                        className="w-full bg-gray-950 border border-gray-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                      />
                    </div>
                  ))}
                </div>

                {/* Address Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {["city", "state", "zipCode"].map((f) => (
                    <input
                      key={f}
                      type="text"
                      name={f}
                      placeholder={
                        f === "zipCode"
                          ? "ZIP"
                          : f.charAt(0).toUpperCase() + f.slice(1)
                      }
                      value={formData[f]}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl py-3 px-3 text-white text-center placeholder-gray-600 text-xs focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                  ))}
                </div>

                {/* Calculation & Submit */}
                <div className="bg-gray-800/50 rounded-xl p-4 space-y-2 border border-white/5">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Duration</span>
                    <span>
                      {days} Day{days > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Service Fee</span>
                    <span>$0.00</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 mt-2 flex justify-between items-center">
                    <span className="text-white font-bold">Total Due</span>
                    <span className="text-xl font-bold text-yellow-500">
                      ${calculateTotal()}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-4 rounded-xl font-bold text-gray-900 shadow-lg shadow-yellow-500/20 transition-all flex items-center justify-center gap-2 ${
                    submitting
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-yellow-500 hover:bg-yellow-400 hover:shadow-yellow-500/40 hover:-translate-y-0.5 active:translate-y-0"
                  }`}
                >
                  {submitting ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <FaCreditCard /> Reserve & Pay
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-gray-500 mt-4">
                  You won't be charged until you confirm on the next step.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailPage;