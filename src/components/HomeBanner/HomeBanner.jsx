// src/components/HeroSleek.jsx
import React, { useEffect, useRef, useState } from "react";
import { FaSearch, FaArrowRight } from "react-icons/fa"; 
import { Link } from "react-router-dom";
import img1 from "../../assets/hero.png"; 

export default function HeroSleek() {
  const wrapRef = useRef(null);
  const bgRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [isLoaded, setIsLoaded] = useState(false);

  // Trigger entrance animation on mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    function onMove(e) {
      const r = el.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      const x = (clientX - r.left) / r.width;
      const y = (clientY - r.top) / r.height;
      
      setMouse({ x, y });
      el.style.setProperty("--mx", `${x}`);
      el.style.setProperty("--my", `${y}`);
    }

    function onLeave() {
      setMouse({ x: 0.5, y: 0.5 });
      el.style.setProperty("--mx", `0.5`);
      el.style.setProperty("--my", `0.5`);
    }

    el.addEventListener("mousemove", onMove);
    el.addEventListener("touchmove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchend", onLeave);

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("touchend", onLeave);
    };
  }, []);

  const maxTranslate = 20; 
  const tx = (mouse.x - 0.5) * 2 * maxTranslate;
  const ty = (mouse.y - 0.5) * 2 * (maxTranslate * 0.55);

  return (
    <div className="relative w-full overflow-hidden bg-gray-900 text-white perspective-1000">
      <div
        ref={wrapRef}
        className="relative flex min-h-[90vh] w-full items-center justify-center overflow-hidden"
        style={{ "--mx": 0.5, "--my": 0.5 }}
      >
        
        {/* 1. BACKGROUND IMAGE LAYER */}
        <div
          ref={bgRef}
          className="absolute inset-0 z-0 h-[110%] w-[110%] -left-[5%] -top-[5%]"
          style={{
            transform: `translate3d(${tx * 0.6}px, ${ty * 0.6}px, 0) scale(1.05)`,
            transition: "transform 400ms cubic-bezier(.2,.9,.25,1)",
          }}
        >
          <img
            src={img1}
            alt="City Parking"
            className="h-full w-full object-cover opacity-80"
          />
          {/* Dark Gradient Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* 2. ANIMATED SVG LINES (Traffic/Data Flow) - NOW GOLDEN */}
        <svg
          className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-60 mix-blend-screen"
          viewBox="0 0 1590 900"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="gFlow" x1="0" x2="1">
              {/* Changed stops to Golden Yellows (Amber-400 to Yellow-200) */}
              <stop offset="0%" stopColor="#d97706" stopOpacity="0" />
              <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
              <stop offset="100%" stopColor="#fde047" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 600 C 400 550, 800 500, 1600 550"
            stroke="url(#gFlow)"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
            style={{ animationDuration: '4s' }}
          />
           <path
            d="M0 620 C 300 650, 900 680, 1600 600"
            stroke="url(#gFlow)"
            strokeWidth="1"
            fill="none"
            opacity="0.5"
            className="animate-pulse"
            style={{ animationDuration: '6s' }}
          />
        </svg>

        {/* 3. MAIN CONTENT CARD */}
        <div 
            className={`relative z-20 mx-4 max-w-4xl transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div 
            className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl md:p-12 text-center md:text-left overflow-hidden relative group"
            style={{
                transform: `translate3d(${-tx * 0.2}px, ${-ty * 0.2}px, 0)`,
                transition: "transform 100ms linear",
            }}
          >
            {/* Glossy sheen effect */}
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center gap-10">
                
                {/* Text Content */}
                <div className="flex-1 space-y-6">
                    {/* Badge: Golden Yellow */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-300 uppercase tracking-wider backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                        </span>
                        Live Availability
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl">
                        Smart Parking. <br />
                        {/* Gradient Text: Metallic Gold effect */}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-600">
                            Zero Hassle.
                        </span>
                    </h1>

                    <p className="max-w-lg text-lg text-gray-300 md:text-xl leading-relaxed">
                        Join ParkKing to instantly find and book secure spots near you. Save time, save money, and park with confidence.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                         <Link to="/cars">
                            {/* Primary Button: Yellow background with DARK text for contrast */}
                            <button className="group relative flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-8 py-4 text-lg font-bold text-gray-900 transition-all hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/25 active:scale-95 w-full sm:w-auto">
                                Find a Spot
                                <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                            </button>
                         </Link>
                         <Link to="/Contact">
                            <button className="rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 w-full sm:w-auto">
                                Contact
                            </button>
                         </Link>
                    </div>
                </div>

                {/* Interactive Search/Visual Element (Desktop only) */}
                <div className="hidden md:block w-80 shrink-0">
                    <div className="rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 p-1 shadow-2xl border border-gray-700">
                        <div className="rounded-xl bg-gray-900 p-5 space-y-4">
                            <div className="flex items-center justify-between text-gray-400 text-sm mb-2">
                                <span>Find Location</span>
                                <span>Filter</span>
                            </div>
                            
                            {/* Search Input Mockup */}
                            <div className="flex items-center gap-3 rounded-lg bg-gray-800 p-3 border border-gray-700">
                                <FaSearch className="text-yellow-500" />
                                <div className="h-2 w-24 rounded bg-gray-600 animate-pulse"></div>
                            </div>
                            
                            {/* Map/List items Mockup */}
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 transition-colors cursor-default">
                                        <div className="h-8 w-8 rounded bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold text-xs">P{i}</div>
                                        <div className="flex-1 space-y-1">
                                            <div className="h-2 w-16 rounded bg-gray-600"></div>
                                            <div className="h-2 w-10 rounded bg-gray-700"></div>
                                        </div>
                                        <div className="text-xs text-green-400 font-mono">$2/h</div>
                                    </div>
                                ))}
                            </div>
                             <div className="pt-2">
                                <div className="w-full h-1 bg-gray-700 rounded overflow-hidden">
                                    <div className="h-full bg-yellow-500 w-2/3"></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                                    <span>Loading spots...</span>
                                    <span>76%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}