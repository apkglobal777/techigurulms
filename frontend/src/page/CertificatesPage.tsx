import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Award, ExternalLink, Layers, User, Calendar, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

// --- TYPES ---
interface CertificateData {
    _id: string;
    title: string;
    description: string;
    genre: string;
    link: string;
    status: string;
    thumbnail: string | null;
    createdAt?: string;
    instructor?: { name: string; title: string; avatar?: string };
}

// --- HELPER ---
const getImageUrl = (url: string | null) => {
    if (!url) return 'https://via.placeholder.com/640x360?text=No+Cover';
    if (url.startsWith('/uploads') || url.startsWith('\\uploads')) {
        // Adjust port if needed based on your backend
        return `http://localhost:5000${url.replace(/\\/g, '/')}`; 
    }
    return url;
};

// --- SKELETON LOADER COMPONENT ---
const CertificateSkeleton = () => (
    <div className="bg-white rounded-[1.5rem] border border-slate-100 overflow-hidden shadow-sm h-full flex flex-col">
        <div className="aspect-video bg-slate-200 animate-pulse relative">
            <div className="absolute top-4 left-4 w-20 h-6 bg-slate-300 rounded-full"></div>
        </div>
        <div className="p-6 flex flex-col flex-1 space-y-4">
            <div className="h-6 bg-slate-200 rounded w-3/4 animate-pulse"></div>
            <div className="space-y-2 flex-1">
                <div className="h-3 bg-slate-100 rounded w-full animate-pulse"></div>
                <div className="h-3 bg-slate-100 rounded w-5/6 animate-pulse"></div>
                <div className="h-3 bg-slate-100 rounded w-4/6 animate-pulse"></div>
            </div>
            <div className="pt-4 border-t border-slate-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>
                <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-200 rounded w-24 animate-pulse"></div>
                    <div className="h-2 bg-slate-100 rounded w-16 animate-pulse"></div>
                </div>
            </div>
            <div className="h-10 bg-slate-200 rounded-xl w-full animate-pulse"></div>
        </div>
    </div>
);

const CertificatesPage = () => {
    const location = useLocation();
    
    const isInactiveRoute = location.pathname.includes('inactive');
    const pageStatus = isInactiveRoute ? 'Inactive' : 'Active';

    const [certificates, setCertificates] = useState<CertificateData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCertificates = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/certificates?status=${pageStatus}`);
                setCertificates(data);
            } catch (error) {
                console.error("Error fetching certificates:", error);
            } finally {
                // Small artificial delay to show off the smooth skeleton (optional)
                setTimeout(() => setLoading(false), 300);
            }
        };

        fetchCertificates();
    }, [pageStatus]);

    const filteredCertificates = certificates.filter(cert => 
        cert.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        cert.genre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-600 relative overflow-hidden selection:bg-violet-200 selection:text-violet-900">
            
            {/* --- AMBIENT BACKGROUND --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/40 rounded-full blur-[100px] mix-blend-multiply opacity-70 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-[100px] mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-200/40 rounded-full blur-[100px] mix-blend-multiply opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 space-y-12">
                
                {/* --- HERO HEADER --- */}
                <div className="flex flex-col lg:flex-row justify-between items-end gap-8">
                    <div className="space-y-4 max-w-2xl">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-500 uppercase tracking-wider"
                        >
                            <Sparkles size={14} className="text-violet-500" />
                            {isInactiveRoute ? 'Legacy Collection' : 'Professional Growth'}
                        </motion.div>
                        
                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight"
                        >
                            {isInactiveRoute ? (
                                <span>Archived <span className="text-slate-400">Certificates</span></span>
                            ) : (
                                <span>Active <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Certificates</span></span>
                            )}
                        </motion.h1>
                        
                        <motion.p 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            transition={{ delay: 0.2 }}
                            className="text-lg text-slate-500 font-medium leading-relaxed"
                        >
                            {isInactiveRoute 
                                ? 'Browse through our extensive library of past certification programs and legacy courses.' 
                                : 'Elevate your skills with our top-tier, currently active external certification programs tailored for you.'}
                        </motion.p>
                    </div>

                    {/* Search Bar */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        transition={{ delay: 0.2 }}
                        className="w-full lg:w-96 relative group"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-200 to-indigo-200 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                        <div className="relative bg-white rounded-2xl shadow-sm">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search by title or technology..."
                                className="w-full pl-12 pr-4 py-4 bg-transparent border-none rounded-2xl focus:ring-0 text-slate-700 placeholder:text-slate-400 font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </motion.div>
                </div>

                {/* --- CONTENT GRID --- */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((n) => <CertificateSkeleton key={n} />)}
                    </div>
                ) : filteredCertificates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredCertificates.map((cert, idx) => (
                                <motion.div 
                                    key={cert._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                    className="group flex flex-col bg-white rounded-[1.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-violet-900/5 hover:-translate-y-1 transition-all duration-300"
                                >
                                    {/* Card Image */}
                                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                                        <img 
                                            src={getImageUrl(cert.thumbnail)} 
                                            alt={cert.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                                        
                                        <div className="absolute top-4 left-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-md text-slate-800 shadow-sm uppercase tracking-wide border border-white/20">
                                                {cert.genre}
                                            </span>
                                        </div>

                                        {isInactiveRoute && (
                                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                                                <span className="bg-white/10 border border-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl font-bold tracking-widest uppercase text-sm shadow-xl flex items-center gap-2">
                                                    <Layers size={16}/> Archived
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Body */}
                                    <div className="flex flex-col flex-1 p-6 lg:p-7 relative">
                                        <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 leading-snug group-hover:text-violet-700 transition-colors">
                                            {cert.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                                            {cert.description}
                                        </p>

                                        {/* Instructor Info */}
                                        {cert.instructor && (
                                            <div className="flex items-center gap-3 mb-6 pt-5 border-t border-slate-50">
                                                <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-br from-violet-200 to-indigo-200 shrink-0">
                                                    {cert.instructor.avatar ? (
                                                        <img src={cert.instructor.avatar} alt={cert.instructor.name} className="w-full h-full rounded-full object-cover border-2 border-white"/>
                                                    ) : (
                                                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-violet-600 border-2 border-white">
                                                            <User size={14} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-800">{cert.instructor.name}</span>
                                                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{cert.instructor.title || 'Instructor'}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Call to Action */}
                                        <a 
                                            href={cert.link} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className={`relative w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all overflow-hidden group/btn ${
                                                isInactiveRoute 
                                                    ? 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700' 
                                                    : 'bg-slate-900 text-white hover:shadow-lg hover:shadow-violet-500/25'
                                            }`}
                                        >
                                            {!isInactiveRoute && (
                                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                                            )}
                                            <span className="relative z-10 flex items-center gap-2">
                                                View Certification 
                                                <ExternalLink size={14} className="group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                            </span>
                                        </a>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm text-center px-4"
                    >
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
                            <Award size={48} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">No Certificates Found</h3>
                        <p className="text-slate-500 font-medium max-w-md mx-auto">
                            {searchTerm 
                                ? `We couldn't find any ${pageStatus.toLowerCase()} certificates matching "${searchTerm}". Try adjusting your search.` 
                                : `There are currently no ${pageStatus.toLowerCase()} certificates available. Check back soon for updates.`}
                        </p>
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="mt-6 px-6 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors"
                            >
                                Clear Search
                            </button>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default CertificatesPage;