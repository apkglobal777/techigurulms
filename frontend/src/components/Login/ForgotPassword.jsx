import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Loader2, Mail, Lock, ArrowRight, KeyRound,
    CheckCircle, RefreshCw, Eye, EyeOff, GraduationCap, Shield, Zap, BookOpen
} from 'lucide-react';

// ── Animated feature pill ──────────────────────────────────────────────────────
const FeaturePill = ({ icon: Icon, text, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
        <Icon size={13} className="text-indigo-400" />
        <span className="text-xs text-slate-400 font-medium">{text}</span>
    </motion.div>
);

const ForgotPassword = () => {
    const { forgotPassword, resetPasswordWithOTP } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(0);

    const startCountdown = () => {
        setCountdown(60);
        const t = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000);
    };

    // Step 1: Send OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        const result = await forgotPassword(email);
        setLoading(false);
        if (result.success) {
            setSuccess(`Reset OTP sent to ${email}`);
            setStep(2);
            startCountdown();
        } else {
            setError(result.message);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return; }
        setError('');
        setStep(3);
    };

    // Resend OTP
    const handleResend = async () => {
        setResendLoading(true); setError(''); setSuccess('');
        const result = await forgotPassword(email);
        setResendLoading(false);
        if (result.success) { setSuccess('New OTP sent!'); startCountdown(); }
        else setError(result.message);
    };

    // Step 3: Reset password
    const handleReset = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
        if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
        setLoading(true); setError('');
        const result = await resetPasswordWithOTP(email, otp, newPassword);
        setLoading(false);
        if (result.success) {
            setSuccess(result.message);
            setTimeout(() => navigate('/login'), 2000);
        } else {
            setError(result.message);
            if (result.message?.toLowerCase().includes('otp')) setStep(2);
        }
    };

    const ErrorBanner = () => error ? (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl px-4 py-3 text-sm mb-6 flex items-center gap-2">
            <span>⚠</span> {error}
        </motion.div>
    ) : null;

    const SuccessBanner = () => success ? (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl px-4 py-3 text-sm mb-6 flex items-center gap-2">
            <CheckCircle size={14} /> {success}
        </motion.div>
    ) : null;

    const stepLabels = ['Email', 'Verify OTP', 'New Password'];

    return (
        <div className="min-h-screen flex font-sans bg-[#05070f]">
            {/* ── LEFT PANEL ── */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 xl:w-[55%] relative overflow-hidden p-14">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0c0e24] via-[#111436] to-[#0a0c20]" />
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-3xl" />
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
                            Account Recovery
                        </motion.div>
                        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="text-5xl xl:text-6xl font-black text-white leading-[1.05] tracking-tight">
                            Reset your<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                                password
                            </span>
                        </motion.h1>
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                            className="text-slate-400 mt-5 text-lg leading-relaxed max-w-md">
                            We'll send a one-time code to your email to securely reset your password.
                        </motion.p>
                    </div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex flex-wrap gap-2">
                        <FeaturePill icon={BookOpen} text="500+ Courses" delay={0.7} />
                        <FeaturePill icon={GraduationCap} text="Expert Instructors" delay={0.8} />
                        <FeaturePill icon={Shield} text="Verified Certificates" delay={0.9} />
                        <FeaturePill icon={Zap} text="Live Projects" delay={1.0} />
                    </motion.div>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                    className="relative z-10 bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-5">
                    <p className="text-slate-300 text-sm leading-relaxed">
                        "Your data is protected with OTP-based verification — no one can reset your password without access to your email."
                    </p>
                    <div className="flex items-center gap-3 mt-4">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                            <Shield size={14} />
                        </div>
                        <div>
                            <p className="text-white text-sm font-bold">Secure Reset</p>
                            <p className="text-slate-500 text-xs">OTP expires in 10 minutes</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ── RIGHT PANEL ── */}
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

                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mb-8">
                        {stepLabels.map((label, i) => {
                            const s = i + 1;
                            return (
                                <div key={s} className="flex items-center gap-2">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border transition-all
                                        ${s === step ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                                        : s < step ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                                        : 'border-slate-700 text-slate-600'}`}>
                                        {s < step ? '✓' : s}
                                    </div>
                                    {s < 3 && <div className={`w-8 h-px ${s < step ? 'bg-emerald-500/40' : 'bg-slate-800'}`} />}
                                </div>
                            );
                        })}
                        <span className="ml-2 text-xs text-slate-500">{stepLabels[step - 1]}</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-white tracking-tight">
                            {step === 1 ? 'Forgot password?' : step === 2 ? 'Check your email' : 'Set new password'}
                        </h2>
                        <p className="text-slate-500 mt-2 text-sm">
                            {step === 1 ? "Enter your email and we'll send a reset code."
                                : step === 2 ? `Enter the 6-digit code sent to ${email}`
                                : 'Choose a strong new password for your account.'}
                        </p>
                    </div>

                    <ErrorBanner />
                    <SuccessBanner />

                    <AnimatePresence mode="wait">
                        {/* ── STEP 1: Email ── */}
                        {step === 1 && (
                            <motion.form key="fp1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleSendOTP} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                                    <div className="relative">
                                        <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input type="email" value={email} onChange={e => { setError(''); setEmail(e.target.value); }} required
                                            placeholder="you@example.com"
                                            className="w-full h-12 pl-11 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.06] transition-all" />
                                    </div>
                                </div>

                                <button type="submit" disabled={loading}
                                    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] disabled:opacity-50 disabled:cursor-not-allowed">
                                    {loading ? <><Loader2 size={16} className="animate-spin" />Sending...</> : <>Send Reset Code <ArrowRight size={15} /></>}
                                </button>
                            </motion.form>
                        )}

                        {/* ── STEP 2: OTP ── */}
                        {step === 2 && (
                            <motion.form key="fp2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleVerifyOTP} className="space-y-5">
                                <div className="flex items-center gap-3 bg-indigo-500/8 border border-indigo-500/20 rounded-2xl px-5 py-4">
                                    <Mail size={16} className="text-indigo-400 flex-shrink-0" />
                                    <p className="text-slate-400 text-sm">Code sent to <span className="text-white font-semibold">{email}</span></p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enter 6-Digit Code</label>
                                    <div className="relative">
                                        <KeyRound size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="text" inputMode="numeric" maxLength={6} value={otp}
                                            onChange={e => { setError(''); setOtp(e.target.value.replace(/\D/g, '')); }}
                                            placeholder="000000" required
                                            className="w-full h-14 pl-11 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-2xl font-mono tracking-[0.5em] text-center placeholder:text-slate-700 placeholder:tracking-normal focus:outline-none focus:border-indigo-500/60 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Didn't receive it?</span>
                                    {countdown > 0
                                        ? <span className="text-slate-600 font-mono text-xs">Resend in {countdown}s</span>
                                        : <button type="button" onClick={handleResend} disabled={resendLoading}
                                            className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors flex items-center gap-1.5 disabled:opacity-50">
                                            {resendLoading ? <><RefreshCw size={12} className="animate-spin" />Sending...</> : 'Resend Code'}
                                          </button>}
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <button type="button" onClick={() => { setStep(1); setOtp(''); setError(''); setSuccess(''); }}
                                        className="h-12 px-5 bg-white/5 border border-white/10 text-slate-300 font-bold rounded-xl hover:bg-white/8 transition-all text-sm">
                                        ← Back
                                    </button>
                                    <button type="submit" disabled={otp.length !== 6}
                                        className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(99,102,241,0.3)] disabled:opacity-50">
                                        Verify Code <ArrowRight size={15} />
                                    </button>
                                </div>
                            </motion.form>
                        )}

                        {/* ── STEP 3: New Password ── */}
                        {step === 3 && (
                            <motion.form key="fp3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleReset} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input type={showPassword ? 'text' : 'password'} value={newPassword}
                                            onChange={e => { setError(''); setNewPassword(e.target.value); }} required
                                            placeholder="Min. 6 characters"
                                            className="w-full h-12 pl-11 pr-12 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-indigo-500/60 transition-all" />
                                        <button type="button" onClick={() => setShowPassword(p => !p)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input type={showPassword ? 'text' : 'password'} value={confirmPassword}
                                            onChange={e => { setError(''); setConfirmPassword(e.target.value); }} required
                                            placeholder="Repeat password"
                                            className="w-full h-12 pl-11 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-indigo-500/60 transition-all" />
                                    </div>
                                </div>

                                <button type="submit" disabled={loading}
                                    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-2 shadow-[0_0_30px_rgba(99,102,241,0.3)] disabled:opacity-50">
                                    {loading ? <><Loader2 size={16} className="animate-spin" />Resetting...</> : <>Reset Password <ArrowRight size={15} /></>}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <div className="mt-8 pt-6 border-t border-white/[0.06]">
                        <Link to="/login" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">← Back to sign in</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;
