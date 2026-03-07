import React from 'react';
import { motion } from 'framer-motion';
import {
    Users, BookOpen, Award, Clock, DollarSign, BarChart3,
    PlusCircle, ChevronRight, TrendingUp, ArrowUpRight
} from 'lucide-react';
import { getImageUrl } from '../../config';

interface DashboardOverviewProps {
    courses: any[];
    certificatesCount: number;
    onNavigate?: (tab: string) => void;
}

const StatCard = ({ label, value, icon: Icon, color, bg, delay, trend }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.3 }}
        className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-default"
    >
        <div className="flex items-start justify-between mb-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon size={20} style={{ color }} />
            </div>
            {trend && (
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <ArrowUpRight size={11} /> {trend}
                </div>
            )}
        </div>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
    </motion.div>
);


const DashboardOverview: React.FC<DashboardOverviewProps> = ({ courses, certificatesCount, onNavigate }) => {
    const activeCount = courses.filter(c => c.status === 'Active').length;
    const draftCount = courses.filter(c => c.status === 'Draft').length;
    const totalStudents = courses.reduce((sum, c) => sum + (c.studentsEnrolled || 0), 0);

    const quickActions = [
        { label: 'Create a New Course', desc: 'Build and publish course content', icon: BookOpen, tab: 'add_course', accent: '#a435f0' },
        { label: 'Add a Certificate', desc: 'Link your external certifications', icon: Award, tab: 'certificates', accent: '#6366f1' },
        { label: 'Edit Your Profile', desc: 'Update your instructor settings', icon: Users, tab: 'profile', accent: '#f59e0b' },
    ];

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Welcome back! Here's an overview of your content.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 shadow-sm">
                    <TrendingUp size={13} className="text-purple-600" /> February 2026
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Students" value={totalStudents} icon={Users} color="#3b82f6" bg="bg-blue-50" delay={0} trend="+8%" />
                <StatCard label="Active Courses" value={activeCount} icon={BookOpen} color="#a435f0" bg="bg-purple-50" delay={0.05} />
                <StatCard label="Certificates" value={certificatesCount} icon={Award} color="#6366f1" bg="bg-indigo-50" delay={0.1} />
                <StatCard label="Draft Courses" value={draftCount} icon={Clock} color="#f59e0b" bg="bg-amber-50" delay={0.15} />
            </div>

            {/* Quick Actions + Revenue */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Revenue Placeholder */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <DollarSign size={17} className="text-purple-600" /> Revenue Overview
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">Track your earnings over time</p>
                        </div>
                        <select className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 outline-none cursor-pointer bg-white">
                            <option>This Month</option>
                            <option>Last 3 Months</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    <div className="w-full h-52 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <BarChart3 size={36} className="opacity-20 mb-2" />
                        <p className="text-sm font-medium text-gray-400">No revenue data yet</p>
                        <p className="text-xs text-gray-300 mt-1">Publish a course to start earning</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 text-sm">Quick Start</h3>
                    <div className="space-y-2">
                        {quickActions.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => onNavigate?.(action.tab)}
                                className="w-full text-left p-3.5 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all group flex items-center gap-3"
                            >
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${action.accent}15` }}>
                                    <action.icon size={16} style={{ color: action.accent }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">{action.label}</p>
                                    <p className="text-xs text-gray-400 truncate">{action.desc}</p>
                                </div>
                                <ChevronRight size={14} className="text-gray-300 group-hover:text-purple-500 transition-colors shrink-0" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Courses */}
            {courses.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                            <BookOpen size={15} className="text-purple-600" /> Your Courses
                        </h3>
                        <button onClick={() => onNavigate?.('active_courses')} className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors">
                            View all <ChevronRight size={12} />
                        </button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {courses.slice(0, 5).map((course: any) => (
                            <div key={course._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                                <div className="w-14 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                    <img src={getImageUrl(course.thumbnail?.url || course.thumbnail)} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{course.title}</p>
                                    <p className="text-xs text-gray-400">{course.studentsEnrolled || 0} students enrolled · ${course.price}</p>
                                </div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${course.status === 'Active' ? 'bg-green-50 text-green-700' : course.status === 'Draft' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {course.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardOverview;
