import React from 'react';
import { motion } from 'framer-motion';
import { Star, Users, BookOpen, Clock, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CourseProps {
  course: {
    id: string | number; // MongoDB uses string IDs
    title: string;
    category: string;
    students?: number;
    rating?: number;
    price: string | number;
    thumbnail: string | { url: string } | any; // 🔥 FIXED: Allow object or string
    lessons?: number;
    duration?: string;
  };
  isInactive?: boolean;
}

const CourseCard: React.FC<CourseProps> = ({ course, isInactive }) => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    // Navigate to the specific course detail page
    navigate(`/course/${course.id}`);
  };

  // --- HELPER: Fix Broken URLs & Handle Data Types ---
  const getThumbnailUrl = (thumb: any) => {
    if (!thumb) return 'https://via.placeholder.com/600x400?text=No+Image';
    
    // 🔥 Extract the string whether the backend sends a String or an Object { url: '...' }
    const urlString = typeof thumb === 'string' ? thumb : thumb.url;
    
    if (!urlString) return 'https://via.placeholder.com/600x400?text=No+Image';

    // Check if it's a local upload from the backend
    if (urlString.startsWith('/uploads') || urlString.startsWith('\\uploads')) {
      // Replace backslashes with forward slashes for URL compatibility
      return `http://13.127.138.86:5000${urlString.replace(/\\/g, '/')}`;
    }
    
    // Return external URLs (e.g. Unsplash) as is
    return urlString;
  };

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col h-full"
    >
      {/* Thumbnail Section - Clickable */}
      <div 
        onClick={handleNavigation}
        className="relative h-52 overflow-hidden cursor-pointer"
      >
        <motion.img 
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6 }}
          src={getThumbnailUrl(course.thumbnail)} 
          alt={course.title} 
          className="w-full h-full object-cover"
          // Fallback if image fails to load entirely
          onError={(e: any) => {
            e.target.onerror = null; 
            e.target.src = "https://via.placeholder.com/600x400?text=Image+Error";
          }}
        />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 uppercase tracking-wide shadow-sm">
          {course.category || 'Course'}
        </div>

        {/* Play Overlay (appears on hover) */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-purple-600 shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
            <PlayCircle size={24} fill="currentColor" className="text-purple-600" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
            <Star size={16} fill="currentColor" />
            <span>{course.rating || 0}</span>
          </div>
          {/* Price / Access Badge */}
          <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${
              isInactive ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700'
          }`}>
            {isInactive ? 'Archived' : (course.price === 0 || course.price === 'Free' ? 'Free' : `$${course.price}`)}
          </span>
        </div>

        {/* Title - Clickable */}
        <h3 
          onClick={handleNavigation}
          className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 leading-snug group-hover:text-purple-600 transition-colors cursor-pointer"
        >
          {course.title}
        </h3>

        {/* Meta Details */}
        <div className="flex items-center gap-4 text-slate-500 text-xs font-medium mb-6 mt-auto pt-4 border-t border-slate-50">
          <div className="flex items-center gap-1.5">
            <BookOpen size={14} className="text-purple-400"/> {course.lessons || 0} Lsns
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-purple-400"/> {course.duration || '0h'}
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <Users size={14} className="text-slate-400"/> {course.students || 0}
          </div>
        </div>

        {/* Action Button - Clickable */}
        <button 
          onClick={handleNavigation}
          className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-slate-900 text-white hover:bg-purple-600 shadow-md hover:shadow-purple-200"
        >
          {isInactive ? 'Watch Archive' : 'Start Learning'} 
          <PlayCircle size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default CourseCard;