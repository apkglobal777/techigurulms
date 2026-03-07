import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import {
    Eye, EyeOff, Loader2, Mail, Lock, ArrowRight,
    GraduationCap, Shield, Zap, BookOpen, CheckCircle, ChevronLeft, KeyRound
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

// ── Verify Account Panel (OTP flow for unverified users) ─────────────────────
const VerifyAccountPanel = ({ prefillEmail, onBack }) => {
    const [step, setStep] = useState('email'); // 'email' | 'otp' | 'done'
    const [email, setEmail] = useState(prefillEmail || '');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const sendOTP = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await api.post('/auth/send-verify-otp', { email });
            setStep('otp');
            setSuccess('OTP sent! Check your inbox.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
        } finally { setLoading(false); }
    };

    const verifyOTP = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await api.post('/auth/verify-account-otp', { email, otp });
            setStep('done');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP.');
        } finally { setLoading(false); }
    };

    return (
        <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-md relative">
            <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors text-sm mb-8">
                <ChevronLeft size={16} /> Back to login
            </button>

            {step === 'done' ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                    <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
                        <CheckCircle size={36} className="text-green-400" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">Account Verified!</h2>
                    <p className="text-slate-400 text-sm mb-6">Your account has been successfully verified. You can now log in.</p>
                    <button onClick={onBack}
                        className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                        Go to Login <ArrowRight size={15} />
                    </button>
                </motion.div>
            ) : (
                <>
                    <div className="mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center mb-4">
                            <KeyRound size={22} className="text-indigo-400" />
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Verify Account</h2>
                        <p className="text-slate-500 mt-2 text-sm">
                            {step === 'email'
                                ? 'Enter your email to receive a verification OTP.'
                                : `We sent a code to ${email}. Enter it below.`}
                        </p>
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl px-4 py-3 text-sm mb-5 flex items-center gap-2">
                            <span>⚠</span> {error}
                        </motion.div>
                    )}
                    {success && step === 'otp' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 text-sm mb-5 flex items-center gap-2">
                            <CheckCircle size={15} /> {success}
                        </motion.div>
                    )}

                    {step === 'email' && (
                        <form onSubmit={sendOTP} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                                <div className="relative">
                                    <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                        placeholder="you@example.com"
                                        className="w-full h-12 pl-11 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-indigo-500/60 transition-all" />
                                </div>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-2 shadow-[0_0_30px_rgba(99,102,241,0.3)] disabled:opacity-50">
                                {loading ? <><Loader2 size={16} className="animate-spin" />Sending OTP...</> : <>Send Verification OTP <ArrowRight size={15} /></>}
                            </button>
                        </form>
                    )}

                    {step === 'otp' && (
                        <form onSubmit={verifyOTP} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verification Code</label>
                                <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required maxLength={6} placeholder="000000"
                                    className="w-full h-14 text-center text-2xl font-mono font-bold tracking-[12px] bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/60 transition-all" />
                                <p className="text-xs text-slate-600 text-center pt-1">Enter the 6-digit code from your email</p>
                            </div>
                            <button type="submit" disabled={loading || otp.length < 6}
                                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-2 shadow-[0_0_30px_rgba(99,102,241,0.3)] disabled:opacity-50">
                                {loading ? <><Loader2 size={16} className="animate-spin" />Verifying...</> : <>Verify Account <ArrowRight size={15} /></>}
                            </button>
                            <button type="button" onClick={() => { setStep('email'); setError(''); setSuccess(''); }}
                                className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors py-2">
                                Didn't receive code? Resend OTP
                            </button>
                        </form>
                    )}
                </>
            )}
        </motion.div>
    );
};

// ── Main Login Component ──────────────────────────────────────────────────────
const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';

    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showVerifyPanel, setShowVerifyPanel] = useState(false);
    const [unverifiedEmail, setUnverifiedEmail] = useState('');

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
                const msg = result?.message || 'Invalid email or password';
                setError(msg);
                // If unverified, prefill email for verify panel
                if (msg.toLowerCase().includes('verify')) {
                    setUnverifiedEmail(form.email);
                }
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const openVerify = () => {
        setUnverifiedEmail(form.email);
        setShowVerifyPanel(true);
        setError('');
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
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[#08090f] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.06),transparent_60%)]" />

                <AnimatePresence mode="wait">
                    {showVerifyPanel ? (
                        <VerifyAccountPanel
                            key="verify"
                            prefillEmail={unverifiedEmail}
                            onBack={() => setShowVerifyPanel(false)}
                        />
                    ) : (
                        <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
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

                            <AnimatePresence>
                                {error && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                        className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl px-4 py-3 text-sm mb-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span>⚠</span> {error}
                                        </div>
                                        {/* Show verify link if the error mentions verification */}
                                        {(error.toLowerCase().includes('verify') || error.toLowerCase().includes('verif')) && (
                                            <button onClick={openVerify}
                                                className="text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors mt-1">
                                                → Verify your account now
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

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

                            {/* Verify account option */}
                            <div className="mt-5 p-4 rounded-xl border border-amber-500/15 bg-amber-500/5">
                                <p className="text-xs text-slate-500 mb-1.5 font-medium">Account not verified?</p>
                                <button onClick={openVerify}
                                    className="text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5">
                                    <KeyRound size={14} /> Verify your account →
                                </button>
                            </div>

                            <div className="mt-6 pt-5 border-t border-white/[0.06]">
                                <Link to="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">← Back to home</Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Login;
