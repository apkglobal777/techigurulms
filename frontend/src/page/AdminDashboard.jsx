import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    Users, BookOpen, TrendingUp, Clock, CheckCircle, XCircle, Eye,
    BarChart3, GraduationCap, AlertCircle, RefreshCw, Medal, ChevronRight,
    IndianRupee, Shield, UserCheck, Search, Filter, LogOut, Menu, X,
    Upload, Award, Star, FileText, ExternalLink, MailCheck, Send, ShieldAlert
} from 'lucide-react';
import { getImageUrl } from '../config';

const ADMIN_EMAILS = ['vc2802204@gmail.com', 'techiguru.in@gmail.com'];

// ─── Subcomponents ───────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, bg, sub }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon size={20} style={{ color }} />
            </div>
            {sub && <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">{sub} pending</span>}
        </div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
);

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [pendingInstructors, setPendingInstructors] = useState([]);
    const [pendingCourses, setPendingCourses] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [studentCerts, setStudentCerts] = useState([]);
    const [certNote, setCertNote] = useState({});
    const [unverifiedUsers, setUnverifiedUsers] = useState([]);
    const [resendStatus, setResendStatus] = useState({}); // per-user status
    const [bulkLoading, setBulkLoading] = useState(false);
    const [bulkResult, setBulkResult] = useState(null);
    const [showBulkConfirm, setShowBulkConfirm] = useState(false);

    // Auth guard
    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (!ADMIN_EMAILS.includes(user.email) && user.role !== 'admin') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [statsRes, pendingInstRes, pendingCoursesRes, usersRes, coursesRes, certRes, unverifiedRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/instructors/pending'),
                api.get('/admin/courses/pending'),
                api.get('/admin/users'),
                api.get('/admin/courses'),
                api.get('/admin/student-certs'),
                api.get('/admin/users/unverified'),
            ]);
            setStats(statsRes.data);
            setPendingInstructors(pendingInstRes.data);
            setPendingCourses(pendingCoursesRes.data);
            setAllUsers(usersRes.data);
            setAllCourses(coursesRes.data);
            setStudentCerts(certRes.data);
            setUnverifiedUsers(unverifiedRes.data.users || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleApproveInstructor = async (id) => {
        setActionLoading(id);
        try { await api.put(`/admin/instructors/${id}/approve`); await loadData(); } catch (e) { }
        setActionLoading(null);
    };

    const handleRejectInstructor = async (id) => {
        setActionLoading(id + 'r');
        try { await api.put(`/admin/instructors/${id}/reject`); await loadData(); } catch (e) { }
        setActionLoading(null);
    };

    const handleApproveCourse = async (id) => {
        setActionLoading(id);
        try { await api.put(`/admin/courses/${id}/approve`); await loadData(); } catch (e) { }
        setActionLoading(null);
    };

    const handleRejectCourse = async (id, reason) => {
        setActionLoading(id + 'r');
        try { await api.put(`/admin/courses/${id}/reject`, { reason }); await loadData(); } catch (e) { }
        setActionLoading(null);
    };

    const handleApproveStudentCert = async (id) => {
        setActionLoading(id + '_ca');
        try {
            await api.put(`/admin/student-certs/${id}/approve`, { note: certNote[id] || '' });
            await loadData();
        } catch (e) { console.error(e); }
        setActionLoading(null);
    };

    const handleRejectStudentCert = async (id) => {
        setActionLoading(id + '_cr');
        try {
            await api.put(`/admin/student-certs/${id}/reject`, { note: certNote[id] || 'Does not meet requirements' });
            await loadData();
        } catch (e) { console.error(e); }
        setActionLoading(null);
    };

    const handleResendLink = async (userId) => {
        setResendStatus(p => ({ ...p, [userId]: 'loading' }));
        try {
            await api.post(`/admin/users/${userId}/resend-verification`);
            setResendStatus(p => ({ ...p, [userId]: 'sent' }));
        } catch (err) {
            setResendStatus(p => ({ ...p, [userId]: 'error' }));
        }
    };

    const handleBulkResend = async () => {
        setShowBulkConfirm(false);
        setBulkLoading(true);
        setBulkResult(null);
        try {
            const res = await api.post('/admin/users/resend-verification-all');
            setBulkResult(res.data);
            await loadData(); // refresh list
        } catch (err) {
            setBulkResult({ message: 'Bulk resend failed: ' + (err.response?.data?.message || err.message), sent: 0, failed: 0, results: [] });
        }
        setBulkLoading(false);
    };

    const TABS = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'instructors', label: 'Instructors', icon: UserCheck, badge: pendingInstructors.length },
        { id: 'courses', label: 'Courses', icon: BookOpen, badge: pendingCourses.length },
        { id: 'students', label: 'Students', icon: Users },
        { id: 'unverified', label: 'Unverified', icon: ShieldAlert, badge: unverifiedUsers.length },
        { id: 'student-certs', label: 'Student Certs', icon: Award, badge: studentCerts.filter(c => c.status === 'pending').length },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    ];

    const sidebarContent = (
        <div className="flex flex-col min-h-screen" style={{ background: '#1c1d1f', borderRight: '1px solid #2d2f31' }}>
            <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: '#2d2f31' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#a435f0' }}>
                    <Shield size={16} className="text-white" />
                </div>
                <div>
                    <p className="text-[15px] font-bold text-white">Admin Panel</p>
                    <p className="text-[11px]" style={{ color: '#9ca3af' }}>TechiGuru Control</p>
                </div>
                <button onClick={() => setMobileOpen(false)} className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-white/10 text-gray-500"><X size={17} /></button>
            </div>
            <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: '#2d2f31' }}>
                <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-sm" style={{ background: '#a435f0' }}>
                    {user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                    <p className="text-xs truncate" style={{ color: '#9ca3af' }}>Administrator</p>
                </div>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5">
                {TABS.map(tab => {
                    const active = activeTab === tab.id;
                    return (
                        <button key={tab.id} onClick={() => { setActiveTab(tab.id); setMobileOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left"
                            style={{ background: active ? 'rgba(164,53,240,0.15)' : 'transparent', color: active ? '#c084fc' : '#9ca3af', borderLeft: active ? '3px solid #a435f0' : '3px solid transparent' }}
                        >
                            <tab.icon size={17} className="flex-shrink-0" />
                            <span>{tab.label}</span>
                            {tab.badge ? <span className="ml-auto w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full text-[10px] font-bold">{tab.badge}</span> : null}
                        </button>
                    );
                })}
            </nav>
            <div className="px-3 py-4 border-t" style={{ borderColor: '#2d2f31' }}>
                <button onClick={() => { logout(); navigate('/login'); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                ><LogOut size={16} /> Sign Out</button>
            </div>
        </div>
    );

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#f7f8fa' }}>
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading admin data...</p>
            </div>
        </div>
    );

    const students = allUsers.filter(u => u.role === 'student');
    const filteredStudents = students.filter(s => (s.name || '').toLowerCase().includes(search.toLowerCase()) || (s.email || '').toLowerCase().includes(search.toLowerCase()));
    const filteredCourses = allCourses.filter(c => (c.title || '').toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="flex min-h-screen" style={{ background: '#f7f8fa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            {/* Sidebar - Desktop */}
            <div className="hidden lg:block w-[220px] min-h-screen fixed left-0 top-0 z-50">{sidebarContent}</div>

            {/* Sidebar - Mobile */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/60 z-40 lg:hidden" />
                        <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 26, stiffness: 220 }} className="fixed inset-y-0 left-0 w-[220px] z-50 lg:hidden">{sidebarContent}</motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main */}
            <div className="flex-1 lg:pl-[220px] flex flex-col min-h-screen">
                {/* Mobile topbar */}
                <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-30" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                    <button onClick={() => setMobileOpen(true)} className="p-2 text-gray-600"><Menu size={20} /></button>
                    <span className="font-bold text-gray-900">Admin Panel</span>
                    <button onClick={loadData} className="ml-auto p-2 text-gray-400 hover:text-purple-600"><RefreshCw size={16} /></button>
                </div>

                <div className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 capitalize">{activeTab === 'overview' ? 'Dashboard' : activeTab}</h1>
                            <p className="text-sm text-gray-500 mt-0.5">TechiGuru Admin Control Panel</p>
                        </div>
                        <button onClick={loadData} className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                            <RefreshCw size={14} /> Refresh
                        </button>
                    </div>

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6 max-w-6xl">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard label="Total Students" value={stats?.users?.students || 0} icon={Users} color="#3b82f6" bg="bg-blue-50" />
                                <StatCard label="Total Instructors" value={stats?.users?.instructors || 0} icon={UserCheck} color="#a435f0" bg="bg-purple-50" sub={stats?.users?.pendingInstructors > 0 ? stats.users.pendingInstructors : null} />
                                <StatCard label="Total Courses" value={stats?.courses?.total || 0} icon={BookOpen} color="#6366f1" bg="bg-indigo-50" sub={stats?.courses?.pending > 0 ? stats.courses.pending : null} />
                                <StatCard label="Published Courses" value={stats?.courses?.approved || 0} icon={CheckCircle} color="#10b981" bg="bg-green-50" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                {/* Pending Instructors */}
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                        <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2"><AlertCircle size={15} className="text-amber-500" /> Instructor Approvals</h3>
                                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">{pendingInstructors.length} pending</span>
                                    </div>
                                    <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                                        {pendingInstructors.length === 0 ? (
                                            <div className="py-8 text-center text-gray-400 text-sm">
                                                <CheckCircle size={24} className="mx-auto mb-2 text-green-400" /> All caught up!
                                            </div>
                                        ) : pendingInstructors.map(inst => (
                                            <div key={inst._id} className="flex items-center gap-3 px-5 py-3">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-100 text-purple-700 font-bold text-sm flex-shrink-0">
                                                    {(inst.name || inst.email || "?")[0].toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">{inst.name}</p>
                                                    <p className="text-xs text-gray-400 truncate">{inst.email}</p>
                                                </div>
                                                <div className="flex gap-1.5">
                                                    <button onClick={() => handleApproveInstructor(inst._id)} disabled={actionLoading === inst._id}
                                                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                                                        {actionLoading === inst._id ? '...' : 'Approve'}
                                                    </button>
                                                    <button onClick={() => handleRejectInstructor(inst._id)} disabled={actionLoading === inst._id + 'r'}
                                                        className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50">
                                                        {actionLoading === inst._id + 'r' ? '...' : 'Reject'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Pending Courses */}
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                        <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2"><BookOpen size={15} className="text-purple-600" /> Course Approvals</h3>
                                        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">{pendingCourses.length} pending</span>
                                    </div>
                                    <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                                        {pendingCourses.length === 0 ? (
                                            <div className="py-8 text-center text-gray-400 text-sm"><CheckCircle size={24} className="mx-auto mb-2 text-green-400" /> All caught up!</div>
                                        ) : pendingCourses.map(course => (
                                            <div key={course._id} className="flex items-center gap-3 px-5 py-3">
                                                <div className="w-12 h-8 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                                                    {course.thumbnail?.url && <img src={course.thumbnail.url} className="w-full h-full object-cover" alt="" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">{course.title}</p>
                                                    <p className="text-xs text-gray-400">by {course.instructor?.name} · ₹{course.price}</p>
                                                </div>
                                                <div className="flex gap-1.5">
                                                    <button onClick={() => handleApproveCourse(course._id)} disabled={actionLoading === course._id}
                                                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                                                        {actionLoading === course._id ? '...' : 'Approve'}
                                                    </button>
                                                    <button onClick={() => handleRejectCourse(course._id, 'Does not meet quality standards')} disabled={actionLoading === course._id + 'r'}
                                                        className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50">
                                                        {actionLoading === course._id + 'r' ? '...' : 'Reject'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Users */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100">
                                    <h3 className="font-semibold text-gray-900 text-sm">Recent Registrations</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                                            <th className="px-5 py-3 text-left font-semibold">User</th>
                                            <th className="px-5 py-3 text-left font-semibold">Role</th>
                                            <th className="px-5 py-3 text-left font-semibold">Joined</th>
                                        </tr></thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {(stats?.recentUsers || []).map((u) => (
                                                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">{(u.name || u.email || '?')[0].toUpperCase()}</div>
                                                            <div><p className="font-medium text-gray-800">{u.name || <span className="text-gray-400 italic text-xs">No name</span>}</p><p className="text-xs text-gray-400">{u.email}</p></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === 'student' ? 'bg-blue-50 text-blue-700' : u.role === 'instructor' ? 'bg-purple-50 text-purple-700' : 'bg-red-50 text-red-700'}`}>{u.role}</span>
                                                    </td>
                                                    <td className="px-5 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* INSTRUCTORS TAB */}
                    {activeTab === 'instructors' && (
                        <div className="space-y-5 max-w-6xl">
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900 text-sm">All Instructors</h3>
                                    <span className="text-xs text-gray-500">{allUsers.filter(u => u.role === 'instructor').length} total</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                                            <th className="px-5 py-3 text-left font-semibold">Instructor</th>
                                            <th className="px-5 py-3 text-left font-semibold">Status</th>
                                            <th className="px-5 py-3 text-left font-semibold">Courses</th>
                                            <th className="px-5 py-3 text-left font-semibold">Joined</th>
                                            <th className="px-5 py-3 text-right font-semibold">Actions</th>
                                        </tr></thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {allUsers.filter(u => u.role === 'instructor').map(inst => (
                                                <tr key={inst._id} className="hover:bg-gray-50">
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-3">
                                                            {inst.avatar ? (
                                                                <img src={inst.avatar} alt={inst.name} className="w-8 h-8 rounded-full object-cover" />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">{(inst.name || inst.email || "?")[0].toUpperCase()}</div>
                                                            )}
                                                            <div><p className="font-semibold text-gray-800">{inst.name}</p><p className="text-xs text-gray-400">{inst.email}</p></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${inst.instructorStatus === 'approved' ? 'bg-green-50 text-green-700' : inst.instructorStatus === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                                                            {inst.instructorStatus || 'pending'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-gray-600 font-medium">{allCourses.filter(c => c.instructor?._id === inst._id || c.instructor === inst._id).length}</td>
                                                    <td className="px-5 py-3 text-gray-400 text-xs">{new Date(inst.createdAt).toLocaleDateString('en-IN')}</td>
                                                    <td className="px-5 py-3 text-right">
                                                        {inst.instructorStatus !== 'approved' && (
                                                            <button onClick={() => handleApproveInstructor(inst._id)} className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 mr-1.5">Approve</button>
                                                        )}
                                                        {inst.instructorStatus !== 'rejected' && (
                                                            <button onClick={() => handleRejectInstructor(inst._id)} className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-200">Reject</button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* COURSES TAB */}
                    {activeTab === 'courses' && (
                        <div className="space-y-5 max-w-6xl">
                            <div className="flex gap-3 items-center bg-white rounded-xl border border-gray-200 px-4 py-3">
                                <Search size={15} className="text-gray-400" />
                                <input type="text" placeholder="Search courses..." className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-400" value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                                            <th className="px-5 py-3 text-left">Course</th>
                                            <th className="px-5 py-3 text-left">Instructor</th>
                                            <th className="px-5 py-3 text-left">Price</th>
                                            <th className="px-5 py-3 text-left">Students</th>
                                            <th className="px-5 py-3 text-left">Approval</th>
                                            <th className="px-5 py-3 text-right">Actions</th>
                                        </tr></thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredCourses.map(course => (
                                                <tr key={course._id} className="hover:bg-gray-50">
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-14 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                                {course.thumbnail?.url && <img src={course.thumbnail.url} className="w-full h-full object-cover" alt="" />}
                                                            </div>
                                                            <p className="font-semibold text-gray-800 truncate max-w-[200px]">{course.title}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 text-gray-600 text-xs">{course.instructor?.name}</td>
                                                    <td className="px-5 py-3 font-bold text-gray-800">₹{course.price?.toLocaleString('en-IN')}</td>
                                                    <td className="px-5 py-3 text-gray-600">{course.studentsEnrolled || 0}</td>
                                                    <td className="px-5 py-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${course.approvalStatus === 'approved' ? 'bg-green-50 text-green-700' : course.approvalStatus === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                                                            {course.approvalStatus || 'pending'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-right">
                                                        {course.approvalStatus !== 'approved' && (
                                                            <button onClick={() => handleApproveCourse(course._id)} className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 mr-1.5">Publish</button>
                                                        )}
                                                        {course.approvalStatus !== 'rejected' && (
                                                            <button onClick={() => handleRejectCourse(course._id, 'Quality standard not met')} className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-200">Reject</button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STUDENTS TAB */}
                    {activeTab === 'students' && (
                        <div className="space-y-5 max-w-6xl">
                            <div className="flex gap-3 items-center bg-white rounded-xl border border-gray-200 px-4 py-3">
                                <Search size={15} className="text-gray-400" />
                                <input type="text" placeholder="Search students by name or email..." className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-400" value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900 text-sm">All Students ({students.length})</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                                            <th className="px-5 py-3 text-left">Student</th>
                                            <th className="px-5 py-3 text-left">Enrolled</th>
                                            <th className="px-5 py-3 text-left">Certificates</th>
                                            <th className="px-5 py-3 text-left">Points</th>
                                            <th className="px-5 py-3 text-left">Joined</th>
                                        </tr></thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredStudents.map(s => (
                                                <tr key={s._id} className="hover:bg-gray-50">
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">{(s.name || s.email || '?')[0].toUpperCase()}</div>
                                                            <div><p className="font-semibold text-gray-800">{s.name}</p><p className="text-xs text-gray-400">{s.email}</p></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-1.5 text-gray-700"><BookOpen size={13} className="text-blue-500" />{s.enrolledCourses?.length || 0}</div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-1.5 text-gray-700"><Medal size={13} className="text-amber-500" />{s.earnedCertificates?.length || 0}</div>
                                                    </td>
                                                    <td className="px-5 py-3"><span className="font-bold text-purple-700">{s.profilePoints || 0} pts</span></td>
                                                    <td className="px-5 py-3 text-gray-400 text-xs">{new Date(s.createdAt).toLocaleDateString('en-IN')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STUDENT CERTS TAB */}
                    {activeTab === 'student-certs' && (
                        <div className="space-y-5 max-w-6xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Student Certificate Submissions</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">Review and approve student-uploaded certificates. Approving awards points to the student.</p>
                                </div>
                                <div className="flex gap-2 text-xs">
                                    <span className="px-2.5 py-1.5 bg-amber-50 text-amber-700 rounded-full font-semibold">{studentCerts.filter(c => c.status === 'pending').length} pending</span>
                                    <span className="px-2.5 py-1.5 bg-green-50 text-green-700 rounded-full font-semibold">{studentCerts.filter(c => c.status === 'approved').length} approved</span>
                                </div>
                            </div>

                            {studentCerts.length === 0 ? (
                                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                    <Upload size={36} className="mx-auto mb-3 text-gray-300" />
                                    <p className="text-gray-500 font-medium">No student certificates submitted yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {studentCerts.map((cert) => (
                                        <div key={cert._id} className="bg-white rounded-xl border border-gray-200 p-5">
                                            <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                                                {/* Preview */}
                                                <div className="w-full lg:w-32 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                    {cert.fileType === 'pdf' ? (
                                                        <div className="flex flex-col items-center gap-1 text-red-400">
                                                            <FileText size={28} />
                                                            <span className="text-[10px] font-bold uppercase">PDF</span>
                                                        </div>
                                                    ) : (
                                                        <img src={`http://localhost:5000${cert.uploadUrl}`} alt="cert" className="w-full h-full object-cover" />
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-start gap-3 mb-2">
                                                        <div>
                                                            <p className="font-bold text-gray-900">{cert.student?.name}</p>
                                                            <p className="text-xs text-gray-400">{cert.student?.email}</p>
                                                        </div>
                                                        <span className={`ml-auto px-2.5 py-1 rounded-full text-xs font-bold ${
                                                            cert.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                                                            cert.status === 'approved' ? 'bg-green-50 text-green-700' :
                                                            'bg-red-50 text-red-700'
                                                        }`}>{cert.status}</span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                                                        <span className="flex items-center gap-1.5"><Award size={13} className="text-purple-500" />{cert.certificateProgram?.title}</span>
                                                        <span className="flex items-center gap-1.5"><Star size={13} className="text-amber-500" />{cert.certificateProgram?.points || 50} pts on approval</span>
                                                        <span className="text-gray-400 text-xs">{new Date(cert.createdAt).toLocaleDateString('en-IN')}</span>
                                                    </div>

                                                    {/* View file */}
                                                    <a href={`http://localhost:5000${cert.uploadUrl}`} target="_blank" rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 underline mb-3">
                                                        <ExternalLink size={12} />View Uploaded File
                                                    </a>

                                                    {cert.status === 'approved' && (
                                                        <p className="text-xs text-green-600 font-semibold">✅ {cert.pointsAwarded} points awarded · Approved by {cert.approvedBy?.name}</p>
                                                    )}
                                                    {cert.status === 'rejected' && cert.adminNote && (
                                                        <p className="text-xs text-red-500">❌ {cert.adminNote}</p>
                                                    )}

                                                    {/* Admin Note + Actions */}
                                                    {cert.status === 'pending' && (
                                                        <div className="flex flex-wrap items-center gap-3 mt-3">
                                                            <input
                                                                type="text"
                                                                placeholder="Optional note to student..."
                                                                value={certNote[cert._id] || ''}
                                                                onChange={e => setCertNote(prev => ({ ...prev, [cert._id]: e.target.value }))}
                                                                className="flex-1 min-w-[180px] px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400"
                                                            />
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleApproveStudentCert(cert._id)}
                                                                    disabled={actionLoading === cert._id + '_ca'}
                                                                    className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                                                                    {actionLoading === cert._id + '_ca' ? '...' : '✓ Approve'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRejectStudentCert(cert._id)}
                                                                    disabled={actionLoading === cert._id + '_cr'}
                                                                    className="px-4 py-2 bg-red-100 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors">
                                                                    {actionLoading === cert._id + '_cr' ? '...' : '✗ Reject'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* UNVERIFIED USERS TAB */}
                    {activeTab === 'unverified' && (
                        <div className="space-y-5 max-w-6xl">
                            {/* Header row */}
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Unverified Accounts</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">{unverifiedUsers.length} user{unverifiedUsers.length !== 1 ? 's' : ''} haven't verified their email yet.</p>
                                </div>
                                <button
                                    onClick={() => setShowBulkConfirm(true)}
                                    disabled={bulkLoading || unverifiedUsers.length === 0}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 shadow-md">
                                    {bulkLoading ? <><RefreshCw size={14} className="animate-spin" />Sending...</> : <><Send size={14} />Resend All ({unverifiedUsers.length})</>}
                                </button>
                            </div>

                            {/* Bulk result banner */}
                            {bulkResult && (
                                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                    className={`rounded-xl px-5 py-4 border text-sm font-medium flex items-start gap-3 ${
                                        bulkResult.failed === 0
                                        ? 'bg-green-50 border-green-200 text-green-800'
                                        : 'bg-amber-50 border-amber-200 text-amber-800'
                                    }`}>
                                    {bulkResult.failed === 0 ? <MailCheck size={16} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />}
                                    <div>
                                        <p className="font-bold">{bulkResult.message}</p>
                                        {bulkResult.results?.filter(r => r.status === 'failed').map((r, i) => (
                                            <p key={i} className="text-xs mt-1 opacity-80">✗ {r.email} — {r.error}</p>
                                        ))}
                                    </div>
                                    <button onClick={() => setBulkResult(null)} className="ml-auto text-gray-400 hover:text-gray-600"><X size={14} /></button>
                                </motion.div>
                            )}

                            {/* Table */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                {unverifiedUsers.length === 0 ? (
                                    <div className="py-14 text-center">
                                        <CheckCircle size={36} className="mx-auto mb-3 text-green-400" />
                                        <p className="font-semibold text-gray-700">All accounts are verified!</p>
                                        <p className="text-sm text-gray-400 mt-1">No unverified users at the moment.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead><tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                                                <th className="px-5 py-3 text-left">User</th>
                                                <th className="px-5 py-3 text-left">Role</th>
                                                <th className="px-5 py-3 text-left">Registered</th>
                                                <th className="px-5 py-3 text-right">Action</th>
                                            </tr></thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {unverifiedUsers.map(u => {
                                                    const st = resendStatus[u._id];
                                                    return (
                                                        <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-5 py-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-sm flex-shrink-0">
                                                                        {(u.name || u.email)[0].toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-gray-800">{u.name || <span className="text-gray-400 italic">No name</span>}</p>
                                                                        <p className="text-xs text-gray-400">{u.email}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-3">
                                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                                    u.role === 'admin' ? 'bg-red-50 text-red-700' :
                                                                    u.role === 'instructor' ? 'bg-purple-50 text-purple-700' :
                                                                    'bg-blue-50 text-blue-700'
                                                                }`}>{u.role || 'student'}</span>
                                                            </td>
                                                            <td className="px-5 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                                                            <td className="px-5 py-3 text-right">
                                                                {st === 'sent' ? (
                                                                    <span className="flex items-center justify-end gap-1.5 text-green-600 text-xs font-semibold">
                                                                        <MailCheck size={14} />Link Sent!
                                                                    </span>
                                                                ) : st === 'error' ? (
                                                                    <button onClick={() => handleResendLink(u._id)}
                                                                        className="text-xs text-rose-600 font-semibold hover:underline">Retry</button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleResendLink(u._id)}
                                                                        disabled={st === 'loading'}
                                                                        className="flex items-center justify-end gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 ml-auto">
                                                                        {st === 'loading' ? <><RefreshCw size={12} className="animate-spin" />Sending...</> : <><Send size={12} />Resend Link</>}
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Bulk Confirm Modal */}
                            <AnimatePresence>
                                {showBulkConfirm && (
                                    <>
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            onClick={() => setShowBulkConfirm(false)}
                                            className="fixed inset-0 bg-black/50 z-50" />
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.92 }}
                                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                                                <Send size={22} className="text-indigo-600" />
                                            </div>
                                            <h3 className="text-lg font-black text-gray-900 mb-1">Send to All?</h3>
                                            <p className="text-sm text-gray-500 mb-6">
                                                This will send verification links to all <strong>{unverifiedUsers.length}</strong> unverified user{unverifiedUsers.length !== 1 ? 's' : ''}.
                                                Each link is valid for 24 hours.
                                            </p>
                                            <div className="flex gap-3">
                                                <button onClick={() => setShowBulkConfirm(false)}
                                                    className="flex-1 h-11 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                                                    Cancel
                                                </button>
                                                <button onClick={handleBulkResend}
                                                    className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors">
                                                    Send Links
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* ANALYTICS TAB */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-5 max-w-6xl">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                <div className="bg-white rounded-xl border border-gray-200 p-6">
                                    <h3 className="font-semibold text-gray-900 text-sm mb-4">Platform Health</h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Avg Courses/Instructor', value: (stats?.courses?.total / (stats?.users?.instructors || 1)).toFixed(1) },
                                            { label: 'Approval Rate', value: `${stats?.courses?.total ? Math.round((stats.courses.approved / stats.courses.total) * 100) : 0}%` },
                                            { label: 'Pending Reviews', value: (stats?.users?.pendingInstructors || 0) + (stats?.courses?.pending || 0) },
                                        ].map((m, i) => (
                                            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                                <span className="text-sm text-gray-600">{m.label}</span>
                                                <span className="font-bold text-gray-900">{m.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-center">
                                    <div className="text-center text-gray-400">
                                        <BarChart3 size={40} className="mx-auto mb-3 opacity-20" />
                                        <p className="font-medium text-sm">Revenue & Growth Charts</p>
                                        <p className="text-xs mt-1">Coming soon — live analytics</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100">
                                    <h3 className="font-semibold text-gray-900 text-sm">Course Enrollment Analytics</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                                            <th className="px-5 py-3 text-left">Course</th>
                                            <th className="px-5 py-3 text-left">Instructor</th>
                                            <th className="px-5 py-3 text-left">Enrolled</th>
                                            <th className="px-5 py-3 text-left">Revenue</th>
                                            <th className="px-5 py-3 text-left">Status</th>
                                        </tr></thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {allCourses.filter(c => c.approvalStatus === 'approved').map(course => (
                                                <tr key={course._id} className="hover:bg-gray-50">
                                                    <td className="px-5 py-3 font-semibold text-gray-800 max-w-[220px] truncate">{course.title}</td>
                                                    <td className="px-5 py-3 text-gray-500 text-xs">{course.instructor?.name}</td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <Users size={13} className="text-blue-500" />
                                                            <span className="font-bold text-blue-700">{course.studentsEnrolled || 0}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 font-bold text-green-700">₹{((course.price || 0) * (course.studentsEnrolled || 0)).toLocaleString('en-IN')}</td>
                                                    <td className="px-5 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${course.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{course.status}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
