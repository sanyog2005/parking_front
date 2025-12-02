// src/components/CarPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCar,
  FaGasPump,
  FaArrowRight,
  FaTachometerAlt,
  FaUserFriends,
  FaShieldAlt,
  FaSearch,
  FaTimes
} from "react-icons/fa";
import axios from "axios";

// --- LOGIC CONSTANTS ---
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const daysBetween = (from, to) =>
  Math.ceil((startOfDay(to) - startOfDay(from)) / MS_PER_DAY);

const CarPage = () => {
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(""); // <--- NEW SEARCH STATE

  const abortControllerRef = useRef(null);
  const base = "https://parking-backend-3tgb.onrender.com";
  const limit = 12;
  const fallbackImage = `${base}/uploads/default-car.png`;

  // --- API FETCH LOGIC ---
  const fetchCars = async () => {
    setLoading(true);
    setError("");
    
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (e) {}
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await axios.get(`${base}/api/cars`, {
        params: { 
            limit, 
            search: search // <--- PASSING SEARCH TERM TO BACKEND
        },
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });

      const json = res.data;
      setCars(Array.isArray(json.data) ? json.data : json.data ?? json);
    } catch (err) {
      const isCanceled =
        err?.code === "ERR_CANCELED" ||
        (axios.isCancel && axios.isCancel(err)) ||
        err?.name === "CanceledError";
      if (isCanceled) return;

      console.error("Failed to fetch cars:", err);
      setError(
        err?.response?.data?.message || err.message || "Failed to load cars"
      );
    } finally {
      // Only turn off loading if this wasn't cancelled
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  };

  // --- EFFECT: DEBOUNCED SEARCH ---
  useEffect(() => {
    // Wait 500ms after user stops typing before fetching
    const delayDebounceFn = setTimeout(() => {
      fetchCars();
    }, 500);

    return () => {
      clearTimeout(delayDebounceFn);
      if (abortControllerRef.current) {
        try {
           abortControllerRef.current.abort(); 
        } catch(e) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]); // Re-run when 'search' changes

  // --- HELPER FUNCTIONS ---
  const buildImageSrc = (image) => {
    if (!image) return "";
    if (Array.isArray(image)) image = image[0];
    if (typeof image !== "string") return "";

    const trimmed = image.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    if (trimmed.startsWith("/")) {
      return `${base}${trimmed}`;
    }
    return `${base}/uploads/${trimmed}`;
  };

  const handleImageError = (e) => {
    const img = e?.target;
    if (!img) return;
    img.onerror = null;
    img.src = fallbackImage;
    img.alt = img.alt || "Image not available";
    img.style.objectFit = img.style.objectFit || "cover";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const opts =
        d.getFullYear() === now.getFullYear()
          ? { day: "numeric", month: "short" }
          : { day: "numeric", month: "short", year: "numeric" };
      return new Intl.DateTimeFormat("en-IN", opts).format(d);
    } catch {
      return dateStr;
    }
  };

  const plural = (n, singular, pluralForm) => {
    if (n === 1) return `1 ${singular}`;
    return `${n} ${pluralForm ?? singular + "s"}`;
  };

  const computeEffectiveAvailability = (car) => {
    const today = new Date();

    if (Array.isArray(car.bookings) && car.bookings.length) {
      const overlapping = car.bookings
        .map((b) => {
          const pickup = b.pickupDate ?? b.startDate ?? b.start ?? b.from;
          const ret = b.returnDate ?? b.endDate ?? b.end ?? b.to;
          if (!pickup || !ret) return null;
          return { pickup: new Date(pickup), return: new Date(ret), raw: b };
        })
        .filter(Boolean)
        .filter(
          (b) =>
            startOfDay(b.pickup) <= startOfDay(today) &&
            startOfDay(today) <= startOfDay(b.return)
        );

      if (overlapping.length > 0) {
        overlapping.sort((a, b) => b.return - a.return);
        return {
          state: "booked",
          until: overlapping[0].return.toISOString(),
          source: "bookings",
        };
      }
    }

    if (car.availability) {
      if (car.availability.state === "booked" && car.availability.until) {
        return {
          state: "booked",
          until: car.availability.until,
          source: "availability",
        };
      }

      if (
        car.availability.state === "available_until_reservation" &&
        Number(car.availability.daysAvailable ?? -1) === 0
      ) {
        return {
          state: "booked",
          until: car.availability.until ?? null,
          source: "availability-res-starts-today",
          nextBookingStarts: car.availability.nextBookingStarts,
        };
      }

      return { ...car.availability, source: "availability" };
    }

    return { state: "fully_available", source: "none" };
  };

  const computeAvailableMeta = (untilIso) => {
    if (!untilIso) return null;
    try {
      const until = new Date(untilIso);
      const available = new Date(until);
      available.setDate(available.getDate() + 1);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysUntilAvailable = daysBetween(today, available);
      return { availableIso: available.toISOString(), daysUntilAvailable };
    } catch {
      return null;
    }
  };

  // --- RENDER FUNCTIONS ---
  const renderAvailabilityBadge = (rawAvailability, car) => {
    const effective = computeEffectiveAvailability(car);
    const badgeBase = "px-3 py-1 text-xs font-bold rounded-full border backdrop-blur-md shadow-lg";
    const availableStyle = "bg-green-500/10 text-green-400 border-green-500/20";
    const bookedStyle = "bg-red-500/10 text-red-400 border-red-500/20";
    const warningStyle = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

    if (!effective) {
      return <span className={`${badgeBase} ${availableStyle}`}>Available</span>;
    }

    if (effective.state === "booked") {
      if (effective.until) {
        const meta = computeAvailableMeta(effective.until);
        if (meta && meta.availableIso) {
          return (
            <div className="flex flex-col items-end">
              <span className={`${badgeBase} ${bookedStyle}`}>
                Booked
              </span>
              <small className="text-[10px] text-yellow-500 font-medium mt-1 bg-gray-900/80 px-2 py-0.5 rounded border border-yellow-500/20">
                Free on {formatDate(meta.availableIso)}
              </small>
            </div>
          );
        }
        return (
          <div className="flex flex-col items-end">
            <span className={`${badgeBase} ${bookedStyle}`}>Booked</span>
            <small className="text-[10px] text-gray-400 mt-1 bg-black/50 px-2 rounded">
              until {formatDate(effective.until)}
            </small>
          </div>
        );
      }
      return <span className={`${badgeBase} ${bookedStyle}`}>Booked</span>;
    }

    if (effective.state === "available_until_reservation") {
      const days = Number(effective.daysAvailable ?? -1);
      if (!Number.isFinite(days) || days < 0) {
        return (
          <div className="flex flex-col items-end">
            <span className={`${badgeBase} ${warningStyle}`}>Available</span>
            {effective.nextBookingStarts && (
              <small className="text-[10px] text-gray-400 mt-1">
                Booked from {formatDate(effective.nextBookingStarts)}
              </small>
            )}
          </div>
        );
      }
      if (days === 0) {
        return (
          <div className="flex flex-col items-end">
            <span className={`${badgeBase} ${bookedStyle}`}>
              Booked (Starts Today)
            </span>
          </div>
        );
      }
      return (
        <div className="flex flex-col items-end">
          <span className={`${badgeBase} ${warningStyle}`}>
            Available ({plural(days, "day")})
          </span>
          {effective.nextBookingStarts && (
            <small className="text-[10px] text-gray-400 mt-1 bg-black/50 px-2 rounded">
              until {formatDate(effective.nextBookingStarts)}
            </small>
          )}
        </div>
      );
    }

    return <span className={`${badgeBase} ${availableStyle}`}>Available</span>;
  };

  const isBookDisabled = (car) => {
    const effective = computeEffectiveAvailability(car);
    if (car?.status && car.status !== "available") return true;
    if (!effective) return false;
    return effective.state === "booked";
  };

  const handleBook = (car, id) => {
    const disabled = isBookDisabled(car);
    if (disabled) return;
    navigate(`/cars/${id}`, { state: { car } });
  };

  // --- MAIN UI ---
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-yellow-500/30">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"></div>
         <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        
        {/* Header Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm font-semibold tracking-wide uppercase">
             <FaCar /> Premium Parking
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
             Find Your Perfect <span className="text-yellow-500">Spot</span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-400 text-lg">
             Discover our exclusive collection of premium vehicles and parking spots.
          </p>
        </div>

        {/* --- SEARCH BAR --- */}
        <div className="max-w-xl mx-auto mb-16 relative z-30 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
            </div>
            <input
                type="text"
                placeholder="Search by location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-900/80 backdrop-blur-xl border border-gray-700 text-white placeholder-gray-500 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all shadow-lg shadow-black/20"
            />
            {search && (
                <button 
                    onClick={() => setSearch("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                >
                    <FaTimes />
                </button>
            )}
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 h-[450px] animate-pulse flex flex-col gap-4">
                <div className="w-full h-48 bg-gray-800 rounded-xl" />
                <div className="h-6 bg-gray-800 rounded w-2/3" />
                <div className="h-4 bg-gray-800 rounded w-1/3" />
                <div className="flex gap-2 mt-4">
                    <div className="h-10 bg-gray-800 rounded flex-1" />
                    <div className="h-10 bg-gray-800 rounded flex-1" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-20 bg-red-500/5 border border-red-500/10 rounded-2xl">
            <p className="text-red-400 text-lg font-medium">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && cars.length === 0 && (
          <div className="text-center py-20 bg-gray-900/50 border border-gray-800 rounded-2xl">
             <FaSearch className="text-4xl text-gray-600 mx-auto mb-4" />
             <p className="text-gray-400 text-lg">
                {search ? `No cars found matching "${search}"` : "No parking spots available at the moment."}
             </p>
          </div>
        )}

        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {!loading &&
            cars.map((car, idx) => {
              const id = car._id ?? car.id ?? idx;
              const carName =
                `${car.make || car.name || ""} ${car.name || ""}`.trim() ||
                car.name ||
                "Unnamed";
              const imageSrc = buildImageSrc(car.image) || fallbackImage;
              const disabled = isBookDisabled(car);

              return (
                <div
                  key={id}
                  className="group relative bg-gray-900/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden hover:border-yellow-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/10 hover:-translate-y-1"
                >
                  {/* Image Section */}
                  <div className="relative h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10" />
                    <img
                      src={imageSrc}
                      alt={carName}
                      onError={handleImageError}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
                      {renderAvailabilityBadge(car.availability, car)}
                    </div>
                    
                    <div className="absolute top-4 left-4 z-20">
                         <span className="px-3 py-1 text-xs font-bold bg-gray-950/80 backdrop-blur text-white rounded-lg border border-white/10">
                            {car.category ?? "Standard"}
                         </span>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute bottom-4 left-4 z-20">
                      <div className="flex items-baseline gap-1 text-white">
                        <span className="text-lg font-bold text-yellow-500">₹{car.dailyRate ?? "—"}</span>
                        <span className="text-sm text-gray-400">/day</span>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-yellow-500 transition-colors truncate">
                        {carName}
                    </h3>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                        <FaUserFriends className="text-blue-400" />
                        <span className="text-xs text-gray-300 font-medium">{car.seats ?? "4"} Seater</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                        <FaGasPump className="text-yellow-400" />
                        <span className="text-xs text-gray-300 font-medium">{car.fuelType ?? "Petrol"}</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                        <FaTachometerAlt className="text-green-400" />
                        <span className="text-xs text-gray-300 font-medium">{car.mileage ? `${car.mileage} kmpl` : "—"}</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                        <FaShieldAlt className="text-purple-400" />
                        <span className="text-xs text-gray-300 font-medium">Insured</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleBook(car, id)}
                      disabled={disabled}
                      className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all duration-300 ${
                        disabled
                          ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                          : "bg-yellow-500 hover:bg-yellow-400 text-gray-900 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transform active:scale-95"
                      }`}
                      title={disabled ? "Currently unavailable" : "Book this spot"}
                    >
                      <span>{disabled ? "Unavailable" : "Book Now"}</span>
                      {!disabled && <FaArrowRight />}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default CarPage;