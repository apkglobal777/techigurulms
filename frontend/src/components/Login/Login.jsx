import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    Eye, EyeOff, Loader2, Mail, Lock, ArrowRight,
    GraduationCap, Shield, Zap, BookOpen
} from 'lucide-react';

// Animated feature pill
const FeaturePill = ({ icon: Icon, text, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
        <Icon size={13} className="text-indigo-400" />
        <span className="text-xs text-slate-400 font-medium">{text}</span>
    </motion.div>
);

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';

    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await login(form.email, form.password);
            if (result?.success) {
                navigate(redirectTo, { replace: true });
            } else {
                setError(result?.message || 'Invalid email or password');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sans bg-[#05070f]">
            {/* ── LEFT PANEL ──────────────────────────────────────────────── */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 xl:w-[55%] relative overflow-hidden p-14">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0c0e24] via-[#111436] to-[#0a0c20]" />
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-3xl" />
                </div>

                {/* Grid lines decoration */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-xl">
                            <span className="text-white font-black text-lg">T</span>
                        </div>
                        <span className="text-white font-black text-xl tracking-tight">TechiGuru</span>
                    </div>
                </div>

                <div className="relative z-10 space-y-8">
                    <div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="inline-block bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-5">
                            Welcome back
                        </motion.div>
                        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="text-5xl xl:text-6xl font-black text-white leading-[1.05] tracking-tight">
                            Continue your<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                                learning journey
                            </span>
                        </motion.h1>
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                            className="text-slate-400 mt-5 text-lg leading-relaxed max-w-md">
                            Access your courses, track your progress, and keep building your skills.
                        </motion.p>
                    </div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex flex-wrap gap-2">
                        <FeaturePill icon={BookOpen} text="500+ Courses" delay={0.7} />
                        <FeaturePill icon={GraduationCap} text="Expert Instructors" delay={0.8} />
                        <FeaturePill icon={Shield} text="Verified Certificates" delay={0.9} />
                        <FeaturePill icon={Zap} text="Live Projects" delay={1.0} />
                    </motion.div>
                </div>

                {/* Testimonial */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                    className="relative z-10 bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-5">
                    <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, i) => <span key={i} className="text-amber-400 text-sm">★</span>)}
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                        "TechiGuru completely transformed how I learn. The structured courses and hands-on projects helped me land my first dev job in 6 months."
                    </p>
                    <div className="flex items-center gap-3 mt-4">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">R</div>
                        <div>
                            <p className="text-white text-sm font-bold">Rahul Mehta</p>
                            <p className="text-slate-500 text-xs">Full-Stack Developer @ Infosys</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ── RIGHT PANEL ─────────────────────────────────────────────── */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[#08090f] relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.06),transparent_60%)]" />

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
                    className="w-full max-w-md relative">

                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-black text-sm">T</span>
                        </div>
                        <span className="text-white font-bold">TechiGuru</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-white tracking-tight">Sign in</h2>
                        <p className="text-slate-500 mt-2 text-sm">Don't have an account? <Link to="/signup" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">Sign up →</Link></p>
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl px-4 py-3 text-sm mb-6 flex items-center gap-2">
                            <span className="text-lg">⚠</span> {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
                            <div className="relative">
                                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input type="email" name="email" value={form.email} onChange={handleChange} required
                                    placeholder="you@example.com"
                                    className="w-full h-12 pl-11 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.06] transition-all" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                                <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} required
                                    placeholder="••••••••"
                                    className="w-full h-12 pl-11 pr-12 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-indigo-500/60 transition-all" />
                                <button type="button" onClick={() => setShowPassword(p => !p)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-6 shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? <><Loader2 size={16} className="animate-spin" />Signing in...</> : <>Sign In <ArrowRight size={15} /></>}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/[0.06]">
                        <Link to="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">← Back to home</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
