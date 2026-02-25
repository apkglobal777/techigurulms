import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Archive, History, AlertCircle, PackageOpen, X } from 'lucide-react';
import CourseCard from './CourseCard'; 
import api from '../../api/axios'; 

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
const useArchivedCourses = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFiltering, setIsFiltering] = useState(false);

    const fetchArchivedCourses = useCallback(async (keyword = '') => {
        setLoading(true);
        try {
            const { data } = await api.get(`/courses?status=Inactive&keyword=${keyword}`);
            setCourses(data.courses);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load archived courses');
        } finally {
            setLoading(false);
            setIsFiltering(false);
        }
    }, []);

    // Initial Load
    useEffect(() => {
        fetchArchivedCourses();
    }, [fetchArchivedCourses]);

    // Handlers
    const handleSearch = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setIsFiltering(true);
            fetchArchivedCourses(searchTerm);
        }
    }, [searchTerm, fetchArchivedCourses]);

    const clearFilters = useCallback(() => {
        setSearchTerm('');
        fetchArchivedCourses('');
    }, [fetchArchivedCourses]);

    // Data Transformation (Memoized)
    const processedCourses = useMemo(() => {
        return courses.map(course => {
            const totalLessons = course.sections?.reduce((acc, sec) => acc + sec.lessons.length, 0) || 0;
            // Mock duration logic (replace with real data if available)
            const estimatedHours = Math.max(1, Math.round(totalLessons * 0.5)); 
            
            return {
                ...course,
                derived: {
                    lessons: totalLessons,
                    duration: `${estimatedHours}h 00m`,
                    thumbnailUrl: typeof course.thumbnail === 'string' 
                        ? course.thumbnail 
                        : course.thumbnail?.url || 'https://via.placeholder.com/600x400?text=Archive'
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
        clearFilters,
        retry: () => fetchArchivedCourses(searchTerm)
    };
};

// --- SUB-COMPONENTS ---

const ArchiveHeader = ({ searchTerm, onSearchChange, onSearchSubmit }: any) => (
    <div className="flex flex-col lg:flex-row justify-between items-end mb-10 gap-6">
        <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider mb-4">
                <Archive size={14} className="text-purple-600" />
                Legacy & Archives
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                Course Library Archive
            </h1>
            <p className="text-slate-500 mt-3 text-base lg:text-lg max-w-xl leading-relaxed">
                Access our older content and previous workshops. These courses are no longer updated but remain open for reference.
            </p>
        </div>

        <div className="relative w-full lg:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={18} />
            <input 
                type="text" 
                placeholder="Search archives..." 
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-700 font-medium placeholder:text-slate-400 shadow-sm transition-all" 
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={onSearchSubmit}
            />
        </div>
    </div>
);

const InfoBanner = () => (
    <div className="mb-12 bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-5 shadow-sm">
        <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600 ring-1 ring-blue-100">
            <History size={24} />
        </div>
        <div>
            <h4 className="font-bold text-lg text-slate-800 mb-1">Did you know?</h4>
            <p className="text-slate-600 text-sm leading-relaxed">These courses are free to watch! While they may use older software versions, the core concepts remain valuable for building strong fundamentals.</p>
        </div>
    </div>
);

const LoadingGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden h-[380px] shadow-sm animate-pulse">
                <div className="h-48 bg-slate-100" />
                <div className="p-5 space-y-4">
                    <div className="h-6 w-3/4 bg-slate-100 rounded" />
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-slate-100 rounded" />
                        <div className="h-4 w-2/3 bg-slate-100 rounded" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const ErrorState = ({ error, onRetry }: { error: string, onRetry: () => void }) => (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center flex flex-col items-center">
        <AlertCircle size={32} className="text-red-500 mb-3" />
        <p className="text-red-600 font-medium mb-4">{error}</p>
        <button onClick={onRetry} className="px-5 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors">
            Try Again
        </button>
    </div>
);

const EmptyState = ({ onClear }: { onClear: () => void }) => (
    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <PackageOpen size={40} className="text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">No archived courses found</h3>
        {/* <p className="text-slate-500 mt-1 mb-6">Try adjusting your search terms.</p>
        <button onClick={onClear} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all">
            <X size={16} /> Clear Search
        </button> */}
    </div>
);

// --- MAIN COMPONENT ---

const InactiveCourses = () => {
    const { 
        courses, loading, error, 
        searchTerm, setSearchTerm, handleSearch, clearFilters, retry 
    } = useArchivedCourses();

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-12 px-6 lg:px-12 font-sans selection:bg-purple-100 selection:text-purple-900">
            <div className="max-w-7xl mx-auto">
                
                <ArchiveHeader 
                    searchTerm={searchTerm} 
                    onSearchChange={setSearchTerm} 
                    onSearchSubmit={handleSearch} 
                />

                <InfoBanner />

                {/* --- CONTENT AREA --- */}
                <div className="min-h-[400px]">
                    {loading ? (
                        <LoadingGrid />
                    ) : error ? (
                        <ErrorState error={error} onRetry={retry} />
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
                                    <CourseCard 
                                        course={{
                                            id: course._id,
                                            title: course.title,
                                            category: course.category,
                                            students: course.studentsEnrolled || 0,
                                            rating: course.rating || 0,
                                            price: 'Free', // Force Free for archive
                                            lessons: course.derived.lessons,
                                            duration: course.derived.duration,
                                            thumbnail: course.derived.thumbnailUrl
                                        }} 
                                        isInactive={true} 
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default InactiveCourses;