// src/components/Testimonial.jsx
import React from 'react';
import { FaStar, FaQuoteLeft, FaParking, FaMapMarkerAlt, FaShieldAlt, FaUserCheck, FaCity } from 'react-icons/fa';
import testimonials from './Testimonialdata'; // Ensure this path matches your project

const Testimonial = () => (
  <div className="relative min-h-screen bg-gray-950 text-gray-100 py-24 overflow-hidden font-sans selection:bg-yellow-500/30">
    
    {/* --- Ambient Background Effects --- */}
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-[128px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[128px]"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
    </div>

    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* --- Header --- */}
      <div className="flex flex-col items-center text-center mb-20 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold tracking-widest uppercase">
          <FaUserCheck /> Client Stories
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
          Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Drivers</span>
        </h1>

        <div className="flex items-center justify-center gap-4 w-full max-w-xs opacity-50">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
          <FaParking className="text-yellow-500 text-xl" />
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
        </div>

        <p className="max-w-2xl text-gray-400 text-lg leading-relaxed">
          Discover why thousands of commuters and travelers rely on ParkKing for secure, convenient, and affordable parking solutions.
        </p>
      </div>

      {/* --- Testimonial Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="group relative flex flex-col h-full bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:border-yellow-500/30 transition-all duration-500 hover:-translate-y-2 shadow-xl"
          >
            {/* Quote Watermark */}
            <div className="absolute top-6 right-8 text-7xl text-white/5 font-serif leading-none pointer-events-none group-hover:text-yellow-500/10 transition-colors">
              &rdquo;
            </div>

            {/* Rating */}
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`w-4 h-4 ${i < t.rating ? 'text-yellow-500' : 'text-gray-800'}`}
                />
              ))}
            </div>

            {/* Content */}
            <blockquote className="flex-1 text-gray-300 text-lg leading-relaxed italic mb-8 relative z-10">
              "{t.comment}"
            </blockquote>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6"></div>

            {/* Author & Location */}
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-lg font-bold text-yellow-500 shadow-lg">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">{t.name}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{t.role}</p>
                </div>
              </div>
              
              {/* Location Tag */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 group-hover:border-yellow-500/20 group-hover:text-yellow-500 transition-all">
                <FaMapMarkerAlt />
                <span>{t.location || t.car || "City Center"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- Stats Section --- */}
      <div className="relative rounded-3xl bg-gray-900/80 border border-white/5 backdrop-blur-md p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-20 transform -skew-x-12"></div>
        
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { value: '10K+', label: 'Happy Drivers', icon: FaUserCheck },
            { value: '250+', label: 'Secure Spots', icon: FaParking },
            { value: '24/7', label: 'Support Team', icon: FaShieldAlt },
            { value: '50+', label: 'Prime Locations', icon: FaCity },
          ].map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center group">
              <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 text-yellow-500 group-hover:scale-110 group-hover:bg-yellow-500 group-hover:text-gray-900 transition-all duration-300">
                <stat.icon size={24} />
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest group-hover:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- CTA Section --- */}
      <div className="mt-24 text-center space-y-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Ready to Secure Your Spot?
        </h2>
        <p className="text-gray-400 max-w-lg mx-auto">
          Join thousands of satisfied customers. Book your premium parking space today.
        </p>
        <a 
          href='/cars' 
          className="inline-flex items-center gap-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 text-lg font-bold py-4 px-10 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transform hover:-translate-y-1 transition-all duration-300"
        >
          <FaParking />
          Book Parking Now
        </a>
      </div>

    </div>
  </div>
);

export default Testimonial;