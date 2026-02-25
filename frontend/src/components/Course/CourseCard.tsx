import React, { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, Users, BookOpen, Clock, PlayCircle, ArrowRight, ImageOff } from 'lucide-react';

// --- TYPES ---
export interface CourseSummary {
    id: string | number;
    title: string;
    category: string;
    price: string | number;
    thumbnail: string | { url: string };
    rating?: number;
    students?: number;
    lessons?: number;
    duration?: string;
}

interface CourseCardProps {
    course: CourseSummary;
    isInactive?: boolean;
}

// --- UTILITY (Local helper to keep single-file structure if preferred) ---
const getValidImageUrl = (thumbnail: string | { url: string } | null | undefined): string => {
    const placeholder = 'https://via.placeholder.com/600x400?text=No+Image';
    if (!thumbnail) return placeholder;
    const urlString = typeof thumbnail === 'string' ? thumbnail : thumbnail.url;
    if (!urlString) return placeholder;
    if (urlString.startsWith('/uploads') || urlString.startsWith('\\uploads')) {
        return `http://13.127.138.86:5000${urlString.replace(/\\/g, '/')}`;
    }
    return urlString;
};

// --- SUB-COMPONENTS ---

const CourseThumbnail: React.FC<{ src: string | { url: string }, alt: string, category: string }> = ({ src, alt, category }) => {
    const [imgError, setImgError] = useState(false);

    return (
        <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100">
            <motion.div 
                className="w-full h-full"
                whileHover={{ scale: 1.05 }} 
                transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            >
                {imgError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <ImageOff size={32} className="mb-2 opacity-50" />
                        <span className="text-xs font-medium">Image unavailable</span>
                    </div>
                ) : (
                    <img 
                        src={getValidImageUrl(src)} 
                        alt={alt} 
                        className="w-full h-full object-cover transition-opacity duration-300"
                        loading="lazy"
                        onError={() => setImgError(true)}
                    />
                )}
            </motion.div>

            {/* Category Badge */}
            <div className="absolute top-3 left-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/95 text-slate-800 shadow-sm backdrop-blur-md">
                    {category || 'General'}
                </span>
            </div>

            {/* Hover Play Overlay */}
            <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileHover={{ scale: 1.1 }}
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-violet-600 shadow-xl"
                >
                    <PlayCircle size={24} fill="currentColor" />
                </motion.div>
            </div>
        </div>
    );
};

const CourseMeta: React.FC<{ lessons?: number, duration?: string, students?: number }> = ({ lessons = 0, duration = '0h', students = 0 }) => (
    <div className="flex items-center justify-between text-xs font-medium text-slate-500 pt-4 border-t border-slate-100 mt-auto">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5" title={`${lessons} Lessons`}>
                <BookOpen size={14} className="text-violet-500/80" />
                <span>{lessons} Lsns</span>
            </div>
            <div className="flex items-center gap-1.5" title={`Duration: ${duration}`}>
                <Clock size={14} className="text-violet-500/80" />
                <span>{duration}</span>
            </div>
        </div>
        <div className="flex items-center gap-1.5" title={`${students} Students enrolled`}>
            <Users size={14} className="text-slate-400" />
            <span>{students}</span>
        </div>
    </div>
);

// --- MAIN COMPONENT ---

const CourseCard: React.FC<CourseCardProps> = ({ course, isInactive = false }) => {
    const navigate = useNavigate();

    const handleNavigation = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/course/${course.id}`);
    };

    const displayPrice = course.price === 0 || course.price === 'Free' ? 'Free' : `$${course.price}`;
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={handleNavigation}
            className="group flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 hover:border-violet-100 transition-all duration-300"
            role="article"
            aria-label={`View course: ${course.title}`}
        >
            <CourseThumbnail 
                src={course.thumbnail} 
                alt={course.title} 
                category={course.category} 
            />

            <div className="flex flex-col flex-1 p-5">
                {/* Header: Rating & Price */}
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded text-xs font-bold text-amber-600">
                        <Star size={12} className="fill-amber-500 text-amber-500" />
                        <span>{course.rating || 0}</span>
                    </div>
                    
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                        isInactive 
                            ? 'bg-slate-100 text-slate-500' 
                            : 'bg-emerald-50 text-emerald-700'
                    }`}>
                        {isInactive ? 'Archived' : displayPrice}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-[17px] font-bold text-slate-900 leading-tight mb-3 line-clamp-2 group-hover:text-violet-600 transition-colors">
                    {course.title}
                </h3>

                {/* Stats */}
                <CourseMeta 
                    lessons={course.lessons} 
                    duration={course.duration} 
                    students={course.students} 
                />

                {/* Mobile/Hover Action Hint */}
                <div className="mt-4 pt-4 border-t border-slate-50 block animate-in fade-in zoom-in duration-200">
                    <button className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 group-hover:bg-violet-600 transition-colors">
                        {isInactive ? 'View Details' : 'Start Learning'}
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default memo(CourseCard);