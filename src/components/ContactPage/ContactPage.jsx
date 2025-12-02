// src/components/ContactPage.jsx
import React, { useState } from 'react';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCar,
  FaComment,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
} from 'react-icons/fa';
import { IoIosSend } from 'react-icons/io';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', carType: '', message: '' });
  const [activeField, setActiveField] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFocus = (field) => {
    setActiveField(field);
  };

  const handleBlur = () => {
    setActiveField(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const whatsappMessage =
      `Name: ${formData.name}%0A` +
      `Email: ${formData.email}%0A` +
      `Phone: ${formData.phone}%0A` +
      `Car Type: ${formData.carType}%0A` +
      `Message: ${formData.message}`;
    window.open(`https://wa.me/+919560231025?text=${whatsappMessage}`, '_blank');

    setFormData({ name: '', email: '', phone: '', carType: '', message: '' });
  };

  return (
    <div className="relative min-h-screen w-full bg-gray-950 overflow-hidden font-sans text-gray-100 py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      
      {/* --- BACKGROUND PATTERNS --- */}
      
      {/* 1. Diamond Grid Pattern (Golden/Amber Tint) */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(30deg, rgba(251, 191, 36, 0.05) 12%, transparent 12.5%, transparent 87%, rgba(251, 191, 36, 0.05) 87.5%, rgba(251, 191, 36, 0.05)),
            linear-gradient(150deg, rgba(251, 191, 36, 0.05) 12%, transparent 12.5%, transparent 87%, rgba(251, 191, 36, 0.05) 87.5%, rgba(251, 191, 36, 0.05)),
            linear-gradient(30deg, rgba(251, 191, 36, 0.05) 12%, transparent 12.5%, transparent 87%, rgba(251, 191, 36, 0.05) 87.5%, rgba(251, 191, 36, 0.05)),
            linear-gradient(150deg, rgba(251, 191, 36, 0.05) 12%, transparent 12.5%, transparent 87%, rgba(251, 191, 36, 0.05) 87.5%, rgba(251, 191, 36, 0.05)),
            linear-gradient(60deg, rgba(245, 158, 11, 0.05) 25%, transparent 25.5%, transparent 75%, rgba(245, 158, 11, 0.05) 75%, rgba(245, 158, 11, 0.05)),
            linear-gradient(60deg, rgba(245, 158, 11, 0.05) 25%, transparent 25.5%, transparent 75%, rgba(245, 158, 11, 0.05) 75%, rgba(245, 158, 11, 0.05))`
          ,
          backgroundSize: '80px 140px',
          backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px'
        }}></div>
      </div>

      {/* 2. Floating Triangles (Amber Theme) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i}
            className="absolute opacity-10 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 40 + 20}px`,
              height: `${Math.random() * 40 + 20}px`,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              background: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#d97706' : '#f59e0b',
              transform: `rotate(${Math.random() * 360}deg)`,
              animationDuration: `${Math.random() * 5 + 3}s`
            }}
          ></div>
        ))}
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
        
        {/* Title Section */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
             Get in <span className="text-yellow-500">Touch</span>
          </h1>
          <div className="h-1 w-24 bg-yellow-500 mx-auto rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)]"></div>
          <p className="text-gray-400 max-w-2xl text-lg mx-auto leading-relaxed">
            Have questions about parking spots or long-term leases? Our support team is ready to assist you instantly.
          </p>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 w-full">
          
          {/* LEFT: Info Card (2 columns wide) */}
          <div className="lg:col-span-2 relative bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 overflow-hidden shadow-2xl group hover:border-yellow-500/30 transition-all duration-500">
            {/* Decorative background blurs */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-yellow-500/20 transition-all"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10 space-y-8">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                   <FaMapMarkerAlt /> 
                </div>
                Contact Info
              </h2>

              <div className="space-y-6">
                {[
                  { icon: FaWhatsapp, label: 'WhatsApp', value: '+91 9560231025', color: 'text-green-400' },
                  { icon: FaEnvelope, label: 'Email', value: 'contact@parkking.com', color: 'text-yellow-400' },
                  { icon: FaClock, label: 'Hours', value: 'Mon-Sat: 8AM-8PM', color: 'text-blue-400' },
                ].map((info, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className={`mt-1 text-xl ${info.color}`}>
                      <info.icon />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{info.label}</h3>
                      <p className="text-white font-medium mt-1">
                        {info.value}
                        {i === 2 && <span className="block text-gray-500 text-sm mt-1">Sunday: 10AM-6PM</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Special Offer Box */}
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/20 rounded-xl p-5 mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <FaCalendarAlt className="text-yellow-500" />
                  <span className="font-bold text-yellow-100">Monthly Pass Deal</span>
                </div>
                <p className="text-sm text-yellow-200/80">
                  Book a spot for 3+ months and get a 10% discount on your first billing cycle.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Form Card (3 columns wide) */}
          <div className="lg:col-span-3 relative bg-gray-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
            {/* Form Decoration */}
            <div className="absolute top-10 right-10 w-20 h-20 border-4 border-white/5 rounded-full pointer-events-none"></div>
            
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <IoIosSend className="text-yellow-500" /> 
                Send Inquiry
              </h2>
              <p className="text-gray-400 mt-2">Fill out the form and we'll get back to you promptly via WhatsApp.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inputs Loop */}
                {['name', 'email', 'phone', 'carType'].map((field) => {
                  const icons = { name: FaUser, email: FaEnvelope, phone: FaPhone, carType: FaCar };
                  const placeholders = { name: 'Full Name', email: 'Email Address', phone: 'Phone Number', carType: 'Vehicle Type' };
                  
                  return (
                    <div key={field} className="relative group">
                      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${activeField === field ? 'text-yellow-500' : 'text-gray-500 group-hover:text-gray-400'}`}>
                        {React.createElement(icons[field])}
                      </div>

                      {field !== 'carType' ? (
                        <input
                          type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                          name={field}
                          value={formData[field]}
                          onChange={handleChange}
                          onFocus={() => handleFocus(field)}
                          onBlur={handleBlur}
                          required
                          placeholder={placeholders[field]}
                          className={`w-full bg-gray-900/50 border rounded-xl px-4 py-4 pl-12 text-white placeholder-gray-500 outline-none transition-all duration-300 ${
                            activeField === field 
                              ? 'border-yellow-500 ring-1 ring-yellow-500 bg-gray-900' 
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                        />
                      ) : (
                        <div className="relative">
                            <select
                            name="carType"
                            value={formData.carType}
                            onChange={handleChange}
                            onFocus={() => handleFocus(field)}
                            onBlur={handleBlur}
                            required
                            className={`w-full bg-gray-900/50 border rounded-xl px-4 py-4 pl-12 text-white outline-none appearance-none cursor-pointer transition-all duration-300 ${
                                activeField === field 
                                ? 'border-yellow-500 ring-1 ring-yellow-500 bg-gray-900' 
                                : 'border-gray-700 hover:border-gray-600'
                            }`}
                            >
                            <option value="" className="bg-gray-900 text-gray-400">Select Vehicle</option>
                            {["Premium", "Affordable", "Moderate", "Economy", "Luxury"].map((opt) => (
                                <option key={opt} value={opt} className="bg-gray-800 text-white">
                                {opt}
                                </option>
                            ))}
                            </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Message Area */}
              <div className="relative group">
                <div className={`absolute left-4 top-5 transition-colors duration-300 ${activeField === 'message' ? 'text-yellow-500' : 'text-gray-500 group-hover:text-gray-400'}`}>
                  <FaComment />
                </div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => handleFocus('message')}
                  onBlur={handleBlur}
                  required
                  rows="4"
                  placeholder="Tell us about your requirements..."
                  className={`w-full bg-gray-900/50 border rounded-xl px-4 py-4 pl-12 text-white placeholder-gray-500 outline-none resize-none transition-all duration-300 ${
                    activeField === 'message'
                      ? 'border-yellow-500 ring-1 ring-yellow-500 bg-gray-900' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-4 rounded-xl shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 text-lg"
              >
                Send via WhatsApp
                <FaWhatsapp className="text-2xl" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;