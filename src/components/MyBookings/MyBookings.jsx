// src/pages/MyBookings.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaCar,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaFilter,
  FaTimes,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaUser,
  FaCreditCard,
  FaReceipt,
  FaArrowRight,
  FaParking,
} from "react-icons/fa";

const API_BASE = "https://parking-backend-3tgb.onrender.com";
const TIMEOUT = 15000;

// ---------- Helpers (UNCHANGED) ----------
const safeAccess = (fn, fallback = "") => {
  try {
    const v = fn();
    return v === undefined || v === null ? fallback : v;
  } catch {
    return fallback;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  return Number.isNaN(d.getTime())
    ? String(dateString)
    : d.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

const formatPrice = (price) => {
  const num = typeof price === "number" ? price : Number(price) || 0;
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
};

const daysBetween = (start, end) => {
  try {
    const a = new Date(start);
    const b = new Date(end);
    if (Number.isNaN(a) || Number.isNaN(b)) return 0;
    return Math.ceil((b - a) / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

const normalizeBooking = (booking) => {
  const getCarData = () => {
    if (!booking) return {};
    if (typeof booking.car === "string") return { name: booking.car };
    if (booking.car && typeof booking.car === "object") {
      const snapshot = { ...booking.car };
      if (snapshot.id && typeof snapshot.id === "object") {
        const populated = { ...snapshot.id };
        delete snapshot.id;
        return { ...snapshot, ...populated };
      }
      return snapshot;
    }
    return {};
  };

  const carObj = getCarData();
  const details = booking.details || {};
  const address = booking.address || {};

  const image =
    safeAccess(() => booking.carImage) ||
    safeAccess(() => carObj.image) ||
    "https://via.placeholder.com/800x450.png?text=No+Image";

  const pickupDate =
    safeAccess(() => booking.pickupDate) ||
    safeAccess(() => booking.dates?.pickup) ||
    booking.pickup ||
    null;

  const returnDate =
    safeAccess(() => booking.returnDate) ||
    safeAccess(() => booking.dates?.return) ||
    booking.return ||
    null;

  const normalized = {
    id: booking._id || booking.id || String(Math.random()).slice(2, 8),
    car: {
      make: carObj.make || carObj.name || "Unnamed Space",
      image,
      year: carObj.year || carObj.modelYear || "",
      category: carObj.category || "Standard",
      seats: details.seats || carObj.seats || 4,
      transmission: details.transmission || carObj.transmission || "",
      fuelType: details.fuelType || carObj.fuelType || "",
      mileage: details.mileage || carObj.mileage || "",
    },
    user: {
      name: booking.customer || safeAccess(() => booking.user?.name) || "Guest",
      email: booking.email || safeAccess(() => booking.user?.email) || "",
      phone: booking.phone || safeAccess(() => booking.user?.phone) || "",
      address:
        address.street || address.city || address.state
          ? `${address.street || ""}${address.city ? ", " + address.city : ""}${
              address.state ? ", " + address.state : ""
            }`
          : safeAccess(() => booking.user?.address) || "",
    },
    dates: { pickup: pickupDate, return: returnDate },
    location:
      address.city || booking.location || carObj.location || "Pickup location",
    price: Number(booking.amount || booking.price || booking.total || 0),
    status:
      booking.status ||
      (booking.paymentStatus === "paid" ? "active" : "") ||
      (booking.paymentStatus === "pending" ? "pending" : "") ||
      "pending",
    bookingDate:
      booking.bookingDate ||
      booking.createdAt ||
      booking.updatedAt ||
      Date.now(),
    paymentMethod: booking.paymentMethod || booking.payment?.method || "",
    paymentId:
      booking.paymentIntentId || booking.paymentId || booking.sessionId || "",
    raw: booking,
  };

  try {
    const now = new Date();
    const _return = new Date(normalized.dates.return);
    if (normalized.status === "active" || normalized.status === "pending") {
      normalized.status = _return > now ? "upcoming" : "completed";
    }
  } catch {
    normalized.status = normalized.status || "upcoming";
  }

  return normalized;
};

// ---------- UI Components (TAILWIND ONLY) ----------

const FilterButton = ({ filterKey, currentFilter, icon, label, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(filterKey)}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border ${
      currentFilter === filterKey
        ? "bg-yellow-500 border-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/20"
        : "bg-gray-900/50 border-white/10 text-gray-400 hover:text-white hover:border-white/20 hover:bg-gray-800"
    }`}
  >
    {icon} {label}
  </button>
);

const StatusBadge = ({ status }) => {
  const map = {
    completed: {
      text: "Completed",
      styles: "bg-green-500/10 text-green-400 border-green-500/20",
      icon: <FaCheckCircle />,
    },
    upcoming: { 
      text: "Upcoming", 
      styles: "bg-blue-500/10 text-blue-400 border-blue-500/20", 
      icon: <FaClock /> 
    },
    cancelled: {
      text: "Cancelled",
      styles: "bg-red-500/10 text-red-400 border-red-500/20",
      icon: <FaTimesCircle />,
    },
    default: { 
      text: "Pending", 
      styles: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", 
      icon: <FaClock /> 
    },
  };
  const { text, styles, icon } = map[status] || map.default;
  return (
    <div className={`px-3 py-1 rounded-lg inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider border ${styles}`}>
      {icon}
      <span>{text}</span>
    </div>
  );
};

const BookingCard = ({ booking, onViewDetails }) => {
  const days = daysBetween(booking.dates.pickup, booking.dates.return);
  
  return (
    <div className="group relative bg-gray-900/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden hover:border-yellow-500/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      
      {/* Image Header */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10" />
        <img
          src={booking.car.image}
          alt={booking.car.make}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => { e.target.src = "https://via.placeholder.com/800x450?text=Image+Unavailable"; }}
        />
        <div className="absolute top-4 right-4 z-20">
          <StatusBadge status={booking.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-white truncate pr-2">{booking.car.make}</h3>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              {booking.car.category} • {booking.car.year}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-yellow-500">{formatPrice(booking.price)}</p>
            <p className="text-[10px] text-gray-400 uppercase font-medium">
              {days} Day{days > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="text-blue-400 text-lg"><FaCalendarAlt /></div>
            <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Schedule</p>
                <p className="text-sm text-gray-200 font-medium">
                    {formatDate(booking.dates.pickup)} - {formatDate(booking.dates.return)}
                </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="text-red-400 text-lg"><FaMapMarkerAlt /></div>
            <div className="truncate">
                <p className="text-[10px] text-gray-500 uppercase font-bold">Location</p>
                <p className="text-sm text-gray-200 font-medium truncate">{booking.location}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onViewDetails(booking)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 text-gray-300 font-bold text-sm hover:bg-white/10 hover:text-white transition-colors border border-white/10"
          >
            <FaReceipt /> Details
          </button>
          <Link 
            to="/cars" 
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-yellow-500 text-gray-900 font-bold text-sm hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20"
          >
            <FaParking /> {booking.status === "upcoming" ? "Modify" : "Rebook"}
          </Link>
        </div>
      </div>
    </div>
  );
};

const BookingModal = ({ booking, onClose, onCancel }) => {
  const days = daysBetween(booking.dates.pickup, booking.dates.return);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-gray-900/95 backdrop-blur border-b border-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FaReceipt className="text-yellow-500" /> Receipt #{booking.id.toString().slice(-6)}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full bg-gray-800 text-gray-400 hover:bg-red-500 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left: Visuals & Basic Info */}
                <div>
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 mb-6">
                        <img
                            src={booking.car.image}
                            alt={booking.car.make}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 left-4">
                            <span className="px-3 py-1 bg-black/60 backdrop-blur rounded-lg text-white text-xs font-bold uppercase border border-white/10">
                                {booking.car.category}
                            </span>
                        </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-1">{booking.car.make}</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                        <span className="px-2 py-1 rounded bg-white/5 text-xs text-gray-400 border border-white/5">{booking.car.year}</span>
                        <span className="px-2 py-1 rounded bg-white/5 text-xs text-gray-400 border border-white/5">{booking.car.transmission}</span>
                        <span className="px-2 py-1 rounded bg-white/5 text-xs text-gray-400 border border-white/5">{booking.car.fuelType}</span>
                        <span className="px-2 py-1 rounded bg-white/5 text-xs text-gray-400 border border-white/5">{booking.car.seats} Seats</span>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-800/50 border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400 text-sm">Total Amount</span>
                            <span className="text-xl font-bold text-yellow-500">{formatPrice(booking.price)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Payment Method</span>
                            <span className="uppercase font-medium">{booking.paymentMethod || "Card"}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Details & Timeline */}
                <div className="space-y-6">
                    
                    {/* Timeline */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Timeline</h4>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className="mt-1 text-green-400"><FaCalendarAlt /></div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold">Pickup</p>
                                    <p className="text-white font-medium">{formatDate(booking.dates.pickup)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className="mt-1 text-red-400"><FaCalendarAlt /></div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold">Return</p>
                                    <p className="text-white font-medium">{formatDate(booking.dates.return)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Location</h4>
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="mt-1 text-yellow-500"><FaMapMarkerAlt /></div>
                            <p className="text-sm text-gray-300">{booking.location}</p>
                        </div>
                    </div>

                    {/* User Info */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Customer</h4>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                            <div className="flex items-center gap-3">
                                <FaUser className="text-gray-500" />
                                <span className="text-sm text-white">{booking.user.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <FaCreditCard className="text-gray-500" />
                                <span className="text-sm text-gray-400">{booking.user.email}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-wrap justify-end gap-4 mt-8 pt-6 border-t border-white/5">
                {booking.status === "upcoming" && (
                    <button
                        type="button"
                        onClick={() => onCancel(booking.id)}
                        className="px-6 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500 hover:text-white transition-all"
                    >
                        Cancel Booking
                    </button>
                )}
                <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm font-bold hover:bg-gray-800 transition-all"
                >
                    Close
                </button>
                <Link 
                    to="/cars" 
                    className="px-6 py-2.5 rounded-xl bg-yellow-500 text-gray-900 text-sm font-bold hover:bg-yellow-400 shadow-lg shadow-yellow-500/20 transition-all flex items-center gap-2"
                >
                    Book Again <FaArrowRight />
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Main Page Component ----------

const StatsCard = ({ value, label, color }) => (
  <div className="bg-gray-900/60 backdrop-blur border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center hover:border-yellow-500/20 transition-colors">
    <div className={`text-3xl font-extrabold mb-1 ${color}`}>{value}</div>
    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
  </div>
);

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  const isMounted = useRef(true);
  useEffect(() => () => (isMounted.current = false), []);

  const fetchBookings = useCallback(async () => {
    setError(null);
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await axios.get(`${API_BASE}/api/bookings/mybooking`, {
        headers,
        signal: controller.signal,
      });

      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.bookings || [];

      const normalized = (Array.isArray(rawData) ? rawData : []).map(normalizeBooking);

      if (!isMounted.current) return;
      setBookings(normalized);
      setLoading(false);
    } catch (err) {
      if (!isMounted.current) return;
      if (err?.name === "CanceledError" || err?.message === "canceled") {
        setError("Request cancelled / timed out");
      } else {
        setError(err.response?.data?.message || "Failed to load bookings");
      }
      setLoading(false);
    } finally {
      clearTimeout(timeoutId);
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const cancelBooking = useCallback(
    async (bookingId) => {
      if (!window.confirm("Are you sure you want to cancel this booking?")) return;
      try {
        const token = localStorage.getItem("token");
        const headers = {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        };
        const response = await axios.patch(
          `${API_BASE}/api/bookings/${bookingId}/status`,
          { status: "cancelled" },
          { headers }
        );

        const updated = normalizeBooking(
          response.data || response.data?.data || { _id: bookingId, status: "cancelled" }
        );
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? updated : b))
        );
        if (selectedBooking?.id === bookingId) setSelectedBooking(updated);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to cancel booking");
      }
    },
    [selectedBooking]
  );

  const filteredBookings = useMemo(
    () =>
      filter === "all" ? bookings : bookings.filter((b) => b.status === filter),
    [bookings, filter]
  );

  const filterButtons = [
    { key: "all", label: "All", icon: <FaFilter /> },
    { key: "upcoming", label: "Upcoming", icon: <FaClock /> },
    { key: "completed", label: "Completed", icon: <FaCheckCircle /> },
    { key: "cancelled", label: "Cancelled", icon: <FaTimes /> },
  ];

  const openDetails = (b) => {
    setSelectedBooking(b);
    setShowModal(true);
  };
  const closeModal = () => {
    setSelectedBooking(null);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans pb-20 selection:bg-yellow-500/30">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/5 text-yellow-500 text-xs font-bold tracking-widest uppercase">
            User Dashboard
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Bookings</span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-400 text-lg">
            Track your active sessions, view history, and manage upcoming reservations.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {filterButtons.map((btn) => (
            <FilterButton
              key={btn.key}
              filterKey={btn.key}
              currentFilter={filter}
              icon={btn.icon}
              label={btn.label}
              onClick={setFilter}
            />
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 rounded-2xl bg-gray-900 border border-gray-800 animate-pulse" />
             ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-20 bg-red-500/5 border border-red-500/10 rounded-3xl">
            <p className="text-red-400 font-medium mb-4">{error}</p>
            <button
              type="button"
              onClick={fetchBookings}
              className="px-6 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredBookings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-gray-800 rounded-3xl bg-gray-900/30 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center text-gray-600 mb-6">
              <FaParking size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No bookings found</h3>
            <p className="text-gray-400 mb-8 max-w-sm">
              {filter === "all"
                ? "You haven't made any bookings yet. Start your journey today!"
                : `You don't have any ${filter} bookings at the moment.`}
            </p>
            <Link to="/cars" className="px-8 py-3 rounded-xl bg-yellow-500 text-gray-900 font-bold hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20">
              Find a Parking Spot
            </Link>
          </div>
        )}

        {/* Bookings Grid */}
        {!loading && !error && filteredBookings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onViewDetails={openDetails}
              />
            ))}
          </div>
        )}

        {/* Statistics */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-white/5">
          <StatsCard
            value={bookings.length}
            label="Total Bookings"
            color="text-yellow-500"
          />
          <StatsCard
            value={bookings.filter((b) => b.status === "completed").length}
            label="Completed Sessions"
            color="text-green-400"
          />
          <StatsCard
            value={bookings.filter((b) => b.status === "upcoming").length}
            label="Upcoming Reservations"
            color="text-blue-400"
          />
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={closeModal}
          onCancel={cancelBooking}
        />
      )}
    </div>
  );
};

export default MyBookings;