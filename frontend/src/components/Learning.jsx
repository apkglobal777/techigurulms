/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight } from 'lucide-react';

const LearningSection = () => {
  // Logo Data (Using text for cleanliness, can be replaced with SVGs)
  const logos = [
    { name: 'amazon', opacity: 'opacity-60' },
    { name: 'Google', opacity: 'opacity-60' },
    { name: 'Lenovo', opacity: 'opacity-60' },
    { name: 'PayPal', opacity: 'opacity-60' },
    { name: 'Shopify', opacity: 'opacity-60' },
    { name: 'Spotify', opacity: 'opacity-60' },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#FDFEFE] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
        
        {/* --- 1. PARTNER LOGOS (Moved to Top as per Design) --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24 flex flex-wrap justify-center lg:justify-between items-center gap-8 lg:gap-12"
        >
          {logos.map((logo, index) => (
            <span 
              key={index}
              className={`text-2xl lg:text-3xl font-bold text-slate-400 ${logo.opacity} hover:opacity-100 hover:text-slate-600 transition-all cursor-pointer select-none`}
            >
              {logo.name}
            </span>
          ))}
        </motion.div>

        {/* --- 2. MAIN CONTENT GRID --- */}
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* LEFT: Image Composition (Exact Overlap Style) */}
          <div className="lg:w-1/2 relative w-full flex justify-center lg:justify-start">
            
            {/* Main Image (Girl Pointing) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10 w-[85%] lg:w-[450px] aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop" 
                alt="Student with headphones" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </motion.div>

            {/* Small Overlap Image (Girl Working) */}
            <motion.div 
              initial={{ opacity: 0, x: 20, y: 20 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="absolute bottom-[-20px] right-4 lg:right-[15%] lg:bottom-[-40px] z-20 w-[180px] lg:w-[240px] aspect-square rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-4 border-white"
            >
               <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop" 
                alt="Students learning" 
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Play Button (Centered on Intersection) */}
            <motion.div
               initial={{ scale: 0 }}
               whileInView={{ scale: 1 }}
               whileHover={{ scale: 1.1 }}
               transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
               className="absolute bottom-[100px] right-[100px] lg:bottom-[140px] lg:right-[35%] z-30"
            >
              <button className="w-16 h-16 lg:w-20 lg:h-20 bg-[#8B3DFF] rounded-full flex items-center justify-center text-white shadow-xl shadow-purple-400/40 border-[6px] border-white cursor-pointer hover:bg-[#7a35e0] transition-colors">
                <Play size={28} fill="currentColor" className="ml-1" />
              </button>
            </motion.div>
          </div>

          {/* RIGHT: Text Content */}
          <div className="lg:w-1/2 text-left">
             <motion.div 
               initial={{ opacity: 0, x: 20 }} 
               whileInView={{ opacity: 1, x: 0 }} 
               viewport={{ once: true }}
             >
              <h2 className="text-4xl lg:text-[52px] font-bold text-slate-900 leading-[1.15] mb-6 font-sans tracking-tight">
                Access to Learning <br className="hidden lg:block"/>
                Anytime & Anywhere
              </h2>
              
              <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-xl">
                Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy.
              </p>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-12 mb-10">
                {["Flexible Timing", "Affordable", "Easy Learning", "World Class"].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8B3DFF]"></div>
                    <span className="text-slate-700 font-semibold text-lg">{item}</span>
                  </div>
                ))}
              </div>

              {/* Button */}
              <button className="group bg-purple-50 text-[#8B3DFF] px-9 py-4 rounded-xl font-bold text-sm hover:bg-[#8B3DFF] hover:text-white transition-all duration-300 flex items-center gap-2">
                Learn More 
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LearningSection;