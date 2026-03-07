import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCourse } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    Search, Filter, Loader2, PackageOpen, PlayCircle, BookOpen,
    Clock, Users, Star, ArrowRight, CheckCircle
} from 'lucide-react';
import { getImageUrl } from '../../config';


const CATEGORIES = ['All', 'Development', 'Business', 'Design', 'Marketing', 'Lifestyle', 'IT & Software'];

const ActiveCourses = () => {
    const { fetchCourses, loading } = useCourse();
    const { user, getMyEnrollments } = useAuth();
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [enrolledIds, setEnrolledIds] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('All');
    const [fetching, setFetching] = useState(false);

    // Load courses and enrolled status
    useEffect(() => {
        const load = async () => {
            setFetching(true);
            try {
                const data = await fetchCourses('', '', '', '','Active');
                // console.log(data)
                if (data?.courses) {
                    // Only Active (status=Active from getCourses default)
                        const active = data.courses.filter(c => c.status === 'Active');
                    setCourses(active.length > 0 ? active : data.courses); // fallback: show all if no active
                }
                if (user) {
                    const res = await getMyEnrollments();
                    if (res.success) {
                        const ids = new Set(res.data.map(c => c._id.toString()));
                        setEnrolledIds(ids);
                    }
                }
            } finally {
                setFetching(false);
            }
        };
        load();
    }, [user]);

    const handleSearch = async () => {
        setFetching(true);
        const data = await fetchCourses(searchTerm, '', category !== 'All' ? category : '');
        if (data?.courses) setCourses(data.courses);
        setFetching(false);
    };

    const filteredCourses = courses.filter(c => {
        const matchCat = category === 'All' || c.category === category;
        const matchSearch = !searchTerm || c.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCat && matchSearch;
    });

    return (
        <div className="min-h-screen bg-slate-50 px-4 lg:px-8 py-12">
            {/* Page Header */}
            <div className="max-w-7xl mx-auto mb-10">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900">Active Trainings</h1>
                        <p className="text-slate-500 mt-2 text-lg">Explore our live courses and start your learning journey today</p>
                    </div>
                    {user && enrolledIds.size > 0 && (
                        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
                            <CheckCircle size={16} /> {enrolledIds.size} course{enrolledIds.size > 1 ? 's' : ''} enrolled
                        </div>
                    )}
                </div>

                {/* Search + Filters */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            placeholder="Search courses..."
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 shadow-sm transition-all"
                        />
                    </div>
                    <button onClick={handleSearch} className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm">
                        Search
                    </button>
                </div>

                {/* Category Tabs */}
                <div className="mt-4 flex gap-2 flex-wrap">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${category === cat ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto">
                {fetching || loading ? (
                    <div className="flex flex-col items-center py-24 text-slate-400">
                        <Loader2 size={40} className="animate-spin mb-4 text-indigo-500" />
                        <p>Loading courses...</p>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="flex flex-col items-center py-24 text-slate-400">
                        <PackageOpen size={52} className="mb-4 opacity-40" />
                        <p className="text-lg font-semibold">No courses found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCourses.map((course, i) => {
                            const enrolled = enrolledIds.has(course._id.toString());
                            const totalLessons = course.sections?.reduce((a, s) => a + (s.lessons?.length || 0), 0) || 0;
                            const thumbUrl = getImageUrl(course.thumbnail?.url || course.thumbnail);
                            return (
                                <motion.div
                                    key={course._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative h-44 overflow-hidden bg-slate-100">
                                        <img src={thumbUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        {enrolled && (
                                            <div className="absolute top-2.5 left-2.5 bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                                                <CheckCircle size={10} /> Enrolled
                                            </div>
                                        )}
                                        <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                                            {course.category}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 flex flex-col p-5">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-1 text-amber-500">
                                                <Star size={12} fill="currentColor" />
                                                <span className="text-xs font-bold">{course.rating?.toFixed(1) || '0.0'}</span>
                                            </div>
                                            <span className="text-xs text-slate-400 font-medium">{course.level || 'All Levels'}</span>
                                        </div>

                                        <h3 className="font-bold text-slate-900 leading-snug line-clamp-2 text-[15px] mb-3 group-hover:text-indigo-600 transition-colors">{course.title}</h3>

                                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-auto mb-4">
                                            <span className="flex items-center gap-1"><BookOpen size={11} /> {totalLessons} lessons</span>
                                            <span className="flex items-center gap-1"><Users size={11} /> {course.studentsEnrolled || 0}</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="font-extrabold text-slate-900">{course.price === 0 ? <span className="text-green-600">Free</span> : `₹${Number(course.price).toLocaleString('en-IN')}`}</span>
                                        </div>

                                        {/* CTA */}
                                        {enrolled ? (
                                            <button
                                                onClick={() => navigate(`/course/${course._id}/learn`)}
                                                className="mt-4 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <PlayCircle size={16} /> Continue Learning
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => navigate(`/course/${course._id}`)}
                                                className="mt-4 w-full py-2.5 bg-slate-900 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors group-hover:bg-indigo-600"
                                            >
                                                View Course <ArrowRight size={15} />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveCourses;
