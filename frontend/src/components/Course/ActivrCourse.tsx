import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Sparkles, Loader2, AlertCircle, PackageOpen, X } from 'lucide-react';
import CourseCard from './CourseCard'; 
import { useCourse } from '../../context/CourseContext'; 

// --- TYPES ---
interface Section { lessons: any[] }
interface Course {
    _id: string;
    title: string;
    category: string;
    studentsEnrolled: number;
    rating: number;
    price: number;
    thumbnail: { url: string } | string;
    sections: Section[];
}

// --- CUSTOM HOOK: LOGIC SEPARATION ---
const useCourseListing = () => {
    const { courses, fetchCourses, loading, error } = useCourse();
    const [searchTerm, setSearchTerm] = useState('');
    const [isFiltering, setIsFiltering] = useState(false);

    // Initial Load
    useEffect(() => {
        fetchCourses();
    }, []);

    // Handlers
    const handleSearch = useCallback(async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setIsFiltering(true);
            await fetchCourses(searchTerm);
            setIsFiltering(false);
        }
    }, [searchTerm, fetchCourses]);

    const clearFilters = useCallback(() => {
        setSearchTerm('');
        fetchCourses('');
    }, [fetchCourses]);

    // Data Transformation (Memoized)
    const processedCourses = useMemo(() => {
        return (courses as Course[]).map(course => {
            const totalLessons = course.sections?.reduce((acc, sec) => acc + sec.lessons.length, 0) || 0;
            // Mock duration logic (replace with real data if available)
            const estimatedHours = Math.max(1, Math.round(totalLessons * 0.5)); 
            
            return {
                ...course,
                derived: {
                    lessons: totalLessons,
                    duration: `${estimatedHours}h 30m`,
                    thumbnailUrl: typeof course.thumbnail === 'string' 
                        ? course.thumbnail 
                        : course.thumbnail?.url || 'https://via.placeholder.com/600x400?text=Course'
                }
            };
        });
    }, [courses]);

    return {
        courses: processedCourses,
        loading: loading || isFiltering,
        error,
        searchTerm,
        setSearchTerm,
        handleSearch,
        clearFilters
    };
};

// --- SUB-COMPONENTS ---

const PageHeader = ({ searchTerm, onSearchChange, onSearchSubmit }: any) => (
    <div className="flex flex-col lg:flex-row justify-between items-end mb-10 gap-6">
        <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live & Trending
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                Explore Active Courses
            </h1>
            <p className="text-slate-500 mt-3 text-base lg:text-lg max-w-xl leading-relaxed">
                Unlock your potential with our most popular content. Expert-led, community-driven, and completely free.
            </p>
        </div>

        <div className="flex gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="Search for Python, React..." 
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-slate-700 font-medium placeholder:text-slate-400 shadow-sm transition-all" 
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={onSearchSubmit}
                />
            </div>
            <button className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 text-slate-600 shadow-sm transition-all active:scale-95">
                <Filter size={20} />
            </button>
        </div>
    </div>
);

const MarketingBanner = () => (
    <div className="mb-12 relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-white">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Sparkles size={24} className="text-yellow-300" fill="currentColor"/>
                </div>
                <div>
                    <h3 className="font-bold text-lg">Limited Time Offer</h3>
                    <p className="text-violet-100 text-sm opacity-90">All premium courses are currently unlocked for free access.</p>
                </div>
            </div>
            <button className="px-5 py-2.5 bg-white text-violet-700 font-bold rounded-lg text-sm hover:bg-violet-50 transition-colors shadow-md whitespace-nowrap">
                Start Learning
            </button>
        </div>
    </div>
);

const LoadingGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden h-[380px] shadow-sm">
                <div className="h-48 bg-slate-100 animate-pulse" />
                <div className="p-5 space-y-4">
                    <div className="h-6 w-3/4 bg-slate-100 rounded animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
                        <div className="h-4 w-2/3 bg-slate-100 rounded animate-pulse" />
                    </div>
                    <div className="pt-4 flex justify-between">
                        <div className="h-8 w-20 bg-slate-100 rounded animate-pulse" />
                        <div className="h-8 w-20 bg-slate-100 rounded animate-pulse" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const ErrorState = ({ error, onRetry }: { error: string, onRetry: () => void }) => (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-12 text-center text-red-600 flex flex-col items-center max-w-lg mx-auto">
        <div className="p-4 bg-red-100 rounded-full mb-4">
            <AlertCircle size={32} />
        </div>
        <h3 className="font-bold text-lg mb-2">Failed to load courses</h3>
        <p className="text-red-500/80 text-sm mb-6">{error}</p>
        <button onClick={onRetry} className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
            Retry Connection
        </button>
    </div>
);

const EmptyState = ({ onClear }: { onClear: () => void }) => (
    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <PackageOpen size={40} className="text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">No courses found</h3>
        <p className="text-slate-500 mt-1 mb-6">We couldn't find any courses matching your search.</p>
        <button onClick={onClear} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all">
            <X size={16} /> Clear Search
        </button>
    </div>
);

// --- MAIN COMPONENT ---

const ActiveCourses = () => {
    const { 
        courses, loading, error, 
        searchTerm, setSearchTerm, handleSearch, clearFilters 
    } = useCourseListing();
    const { fetchCourses } = useCourse(); // Access for retry

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-12 px-6 lg:px-12 font-sans selection:bg-violet-100 selection:text-violet-900">
            <div className="max-w-7xl mx-auto">
                
                <PageHeader 
                    searchTerm={searchTerm} 
                    onSearchChange={setSearchTerm} 
                    onSearchSubmit={handleSearch} 
                />

                <MarketingBanner />

                {/* --- CONTENT AREA --- */}
                <div className="min-h-[400px]">
                    {loading ? (
                        <LoadingGrid />
                    ) : error ? (
                        <ErrorState error={error} onRetry={() => fetchCourses()} />
                    ) : courses.length === 0 ? (
                        <EmptyState onClear={clearFilters} />
                    ) : (
                        <motion.div 
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                            }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {courses.map((course) => (
                                <motion.div 
                                    key={course._id}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
                                    }}
                                >
                                    <CourseCard course={{
                                        id: course._id,
                                        title: course.title,
                                        category: course.category,
                                        students: course.studentsEnrolled || 0,
                                        rating: course.rating || 0,
                                        price: course.price === 0 ? 'Free' : `$${course.price}`,
                                        lessons: course.derived.lessons,
                                        duration: course.derived.duration,
                                        thumbnail: course.derived.thumbnailUrl
                                    }} />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ActiveCourses;