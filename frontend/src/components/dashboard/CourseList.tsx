import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Edit2, Trash2, PlusCircle, Loader, Users, Clock } from 'lucide-react';
import { getImageUrl } from '../../config';



interface CourseListProps {
    courses: any[];
    onEdit: (course: any) => void;
    onDelete: (id: string) => void;
    onCreateClick: () => void;
    isLoading: boolean;
}

const STATUSES = ['All', 'Active', 'Draft', 'Inactive'];
const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
    Active: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
    Draft: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    Inactive: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
};

const CourseList: React.FC<CourseListProps> = ({ courses, onEdit, onDelete, onCreateClick, isLoading }) => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');

    const filtered = courses.filter(c => {
        const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'All' || c.status === filter;
        return matchSearch && matchFilter;
    });

    return (
        <div className="space-y-5 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
                    <p className="text-sm text-gray-500 mt-0.5">{courses.length} course{courses.length !== 1 ? 's' : ''} in your library</p>
                </div>
                <button
                    onClick={onCreateClick}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, #a435f0, #7c3aed)' }}
                >
                    <PlusCircle size={15} /> New Course
                </button>
            </div>

            {/* Filters + Search bar */}
            <div className="bg-white rounded-xl border border-gray-200 px-5 py-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex gap-1 flex-wrap">
                    {STATUSES.map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === s ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                        >{s}</button>
                    ))}
                </div>
                <div className="relative sm:ml-auto w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-20">
                    <Loader className="animate-spin text-purple-600 mb-3" size={28} />
                    <p className="text-gray-400 text-sm">Loading your courses...</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <div className="col-span-4">Course</div>
                        <div className="col-span-2">Category</div>
                        <div className="col-span-1">Price</div>
                        <div className="col-span-2">Students</div>
                        <div className="col-span-1">Status</div>
                        <div className="col-span-1">Approval</div>
                        <div className="col-span-1 text-right">Actions</div>
                    </div>

                    {filtered.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {filtered.map((course: any, i: number) => {
                                const sc = STATUS_CONFIG[course.status] || STATUS_CONFIG['Inactive'];
                                return (
                                    <motion.div
                                        key={course._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50/70 transition-colors group"
                                    >
                                        {/* Course */}
                                        <div className="col-span-4 flex items-center gap-3 min-w-0">
                                            <div className="w-16 h-11 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                                <img src={getImageUrl(course.thumbnail?.url || course.thumbnail)} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">{course.title}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{course.sections?.length || 0} sections · {course.sections?.reduce((a: number, s: any) => a + (s.lessons?.length || 0), 0)} lessons</p>
                                            </div>
                                        </div>
                                        {/* Category */}
                                        <div className="col-span-2">
                                            <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{course.category || 'General'}</span>
                                        </div>
                                        {/* Price - ₹ INR */}
                                        <div className="col-span-1">
                                            <span className="text-sm font-bold text-gray-800">
                                                {course.price === 0 ? 'Free' : `₹${Number(course.price).toLocaleString('en-IN')}`}
                                            </span>
                                        </div>
                                        {/* Students */}
                                        <div className="col-span-2 flex items-center gap-1.5 text-sm text-gray-600">
                                            <Users size={13} className="text-gray-400" /> {course.studentsEnrolled || 0}
                                        </div>
                                        {/* Status */}
                                        <div className="col-span-1">
                                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                                {course.status}
                                            </span>
                                        </div>
                                        {/* Approval */}
                                        <div className="col-span-1">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${course.approvalStatus === 'approved' ? 'bg-green-50 text-green-700' :
                                                    course.approvalStatus === 'rejected' ? 'bg-red-50 text-red-700' :
                                                        'bg-amber-50 text-amber-700'
                                                }`}>
                                                {course.approvalStatus === 'approved' ? '✓ Live' : course.approvalStatus === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                                            </span>
                                        </div>
                                        {/* Actions */}
                                        <div className="col-span-1 flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => onEdit(course)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all" title="Edit">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => onDelete(course._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-3 border border-gray-100">
                                <Search size={24} className="opacity-30" />
                            </div>
                            <p className="font-semibold text-sm">{search ? `No results for "${search}"` : 'No courses yet'}</p>
                            {!search && (
                                <button onClick={onCreateClick} className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, #a435f0, #7c3aed)' }}>
                                    <PlusCircle size={14} /> Create your first course
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CourseList;
