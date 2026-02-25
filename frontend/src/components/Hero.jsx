/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import hero from "../../public/hero.png";
import { ArrowRight, Monitor, Plus } from 'lucide-react';

const Hero = () => {
  // Animation for the floating cards (bouncing effect)
  const floatAnimation = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const floatAnimationDelayed = {
    animate: {
      y: [0, 10, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.5
      }
    }
  };

  return (
    <section className="relative w-full min-h-screen bg-[#FDF8FD] flex items-center justify-center overflow-hidden pt-20 lg:pt-0">
      
      {/* Background Decor: Faint blurred blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-5%] w-[300px] h-[300px] bg-purple-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      {/* Floating Diamond Decor (Top Center) */}
      <motion.div 
        animate={{ y: [0, -15, 0], rotate: 45 }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-[45%] w-12 h-12 bg-purple-200/50 rounded-lg blur-[1px]"
      />

      <div className="max-w-[1250px] mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* LEFT SIDE: Text Content */}
        <div className="z-10 order-2 lg:order-1">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[42px] md:text-[56px] lg:text-[64px] font-bold text-[#1a1a2e] leading-[1.15] mb-6 font-sans"
          >
            Best <span className="relative inline-block mx-1">
              {/* The Purple Skewed Background */}
              <span className="absolute inset-0 bg-[#8B3DFF] -skew-x-6 transform rounded-sm h-full w-full block"></span>
              {/* The Text */}
              <span className="relative z-10 text-white px-2">Online</span>
            </span> Courses <br /> From Edupath
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-500 text-lg leading-relaxed max-w-lg mb-10"
          >
            Discover a world of knowledge and opportunities with our online education platform pursue a new career.
          </motion.p>

          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#8B3DFF] text-white px-8 py-4 rounded-lg font-semibold text-base shadow-lg shadow-purple-200 flex items-center gap-2 hover:bg-[#7b35e3] transition-colors"
          >
            View Courses <ArrowRight size={20} />
          </motion.button>
        </div>

        {/* RIGHT SIDE: Image & Floating Elements */}
        <div className="relative order-1 lg:order-2 flex justify-center items-center h-[500px] lg:h-[700px]">
          
          {/* Main Purple Circle Background */}
          <div className="absolute w-[400px] h-[400px] lg:w-[550px] lg:h-[550px] bg-[#AA3DFF] rounded-full overflow-hidden">
             {/* Honeycomb Pattern Overlay (CSS approximation) */}
             <div className="absolute inset-0 opacity-10" style={{
                 backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)',
                 backgroundSize: '30px 30px'
             }}></div>
             <div className="absolute inset-0 bg-gradient-to-tr from-purple-800/30 to-transparent"></div>
          </div>

     
          <motion.img 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            src={hero} 
         
            className="relative z-10 w-[85%] lg:w-[90%] max-w-[600px] drop-shadow-2xl"
            alt="Student Learning"
          />

          <motion.div 
            variants={floatAnimation}
            animate="animate"
            className="absolute top-[15%] right-[5%] lg:right-[0%] z-20 bg-white p-4 rounded-xl shadow-xl shadow-purple-100 border border-gray-50 flex items-center gap-4 min-w-[180px]"
          >
            <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center text-[#8B3DFF]">
              <Monitor size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-medium mb-0.5">Online Course</p>
              <h3 className="text-xl font-bold text-slate-900">100+</h3>
            </div>
          </motion.div>

          {/* FLOAT CARD 2: Our Instructors (Bottom Left) */}
          <motion.div 
            variants={floatAnimationDelayed}
            animate="animate"
            className="absolute bottom-[15%] left-[0%] lg:left-[-5%] z-20 bg-white p-5 rounded-xl shadow-xl shadow-purple-100 border border-gray-50 min-w-[200px]"
          >
            <p className="text-slate-800 font-bold text-sm mb-3">Our Instructors</p>
            <div className="flex items-center">
              {/* Avatar Stack */}
              <div className="flex -space-x-3">
                <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?u=1" alt="Instr 1" />
                <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?u=2" alt="Instr 2" />
                <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?u=3" alt="Instr 3" />
                <div className="w-10 h-10 rounded-full border-2 border-white bg-[#8B3DFF] flex items-center justify-center text-white">
                  <Plus size={14} strokeWidth={3} />
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;