import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Eye, EyeOff, Loader2, Mail, Lock, User, ArrowRight,
    BookOpen, Trophy, Users, CheckCircle, Shield, RefreshCw, KeyRound
} from 'lucide-react';

const Benefit = ({ icon: Icon, text, delay }) => (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
        className="flex items-center gap-2.5 text-sm text-slate-400">
        <div className="w-6 h-6 bg-indigo-500/15 rounded-lg flex items-center justify-center shrink-0">
            <Icon size={12} className="text-indigo-400" />
        </div>
        {text}
    </motion.div>
);

// Step indicator dots
const StepIndicator = ({ current, total }) => (
    <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: total }, (_, i) => i + 1).map(s => (
            <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border transition-all
                    ${s === current ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                    : s < current ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-700 text-slate-600'}`}>
                    {s < current ? '✓' : s}
                </div>
                {s < total && <div className={`w-10 h-px ${s < current ? 'bg-emerald-500/40' : 'bg-slate-800'}`} />}
            </div>
        ))}
        <span className="ml-2 text-xs text-slate-500 font-medium">
            {current === 1 ? 'Account' : current === 2 ? 'Verify Email' : 'Profile'}
        </span>
    </div>
);

const InputField = ({ icon: Icon, label, type, name, value, onChange, placeholder, required, children }) => (
    <div className="space-y-1">
        {label && <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>}
        <div className="relative">
            {Icon && <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />}
            <input
                type={type} name={name} value={value} onChange={onChange}
                placeholder={placeholder} required={required}
                className={`w-full h-12 ${Icon ? 'pl-11' : 'pl-4'} pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.06] transition-all`}
            />
            {children}
        </div>
    </div>
);

const Signup = () => {
    const { sendSignupOTP, verifyAndRegister } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: credentials, 2: OTP verify, 3: profile
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student' });
    const [otp, setOtp] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(0);

    const handleChange = e => { setError(''); setForm(p => ({ ...p, [e.target.name]: e.target.value })); };

    const startCountdown = () => {
        setCountdown(60);
        const t = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000);
    };

    // Step 1: validate credentials and send OTP
    const handleStep1 = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
        setLoading(true); setError('');
        const result = await sendSignupOTP(form.email);
        setLoading(false);
        if (result.success) {
            setSuccess(`OTP sent to ${form.email}`);
            setStep(2);
            startCountdown();
        } else {
            setError(result.message);
        }
    };

    // Step 2: verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) { setError('Please enter the 6-digit OTP'); return; }
        setError('');
        setStep(3); // OTP will be used at final step
    };

    // Resend OTP
    const handleResend = async () => {
        setResendLoading(true); setError(''); setSuccess('');
        const result = await sendSignupOTP(form.email);
        setResendLoading(false);
        if (result.success) { setSuccess('New OTP sent!'); startCountdown(); }
        else setError(result.message);
    };

    // Step 3: complete registration
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        const result = await verifyAndRegister(form.name, form.email, form.password, form.role, otp);
        setLoading(false);
        if (result?.success) {
            navigate(result.pendingApproval ? '/?registered=pending' : '/');
        } else {
            setError(result?.message || 'Registration failed');
            // If OTP error, go back to OTP step
            if (result?.message?.toLowerCase().includes('otp')) setStep(2);
        }
    };

    const ErrorBanner = () => error ? (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl px-4 py-3 text-sm mb-5 flex items-center gap-2">
            <span>⚠</span> {error}
        </motion.div>
    ) : null;

    const SuccessBanner = () => success ? (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl px-4 py-3 text-sm mb-5 flex items-center gap-2">
            <CheckCircle size={14} /> {success}
        </motion.div>
    ) : null;

    return (
        <div className="min-h-screen flex font-sans bg-[#05070f]">
            {/* ── LEFT PANEL ── */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 xl:w-[55%] relative overflow-hidden p-14">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0c1024] via-[#0f1438] to-[#0a0c20]" />
                <div className="absolute top-1/3 -left-20 w-[500px] h-[500px] bg-indigo-700/15 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-700/10 rounded-full blur-3xl" />
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-xl">
                            <span className="text-white font-black text-lg">T</span>
                        </div>
                        <span className="text-white font-black text-xl tracking-tight">TechiGuru</span>
                    </div>
                </div>

                <div className="relative z-10 space-y-8">
                    <div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="inline-block bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-5">
                            Free to join
                        </motion.div>
                        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="text-5xl xl:text-6xl font-black text-white leading-[1.05] tracking-tight">
                            Start your<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                                tech career today
                            </span>
                        </motion.h1>
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                            className="text-slate-400 mt-5 text-lg leading-relaxed max-w-md">
                            Join thousands of learners building in-demand skills with expert-led courses.
                        </motion.p>
                    </div>

                    {/* Email Verified badge */}
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                        className="flex items-center gap-3 bg-indigo-500/8 border border-indigo-500/20 rounded-2xl px-5 py-4">
                        <div className="w-9 h-9 bg-indigo-500/15 rounded-xl flex items-center justify-center shrink-0">
                            <Shield size={16} className="text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">Email OTP Verified</p>
                            <p className="text-slate-500 text-xs mt-0.5">Only real emails can create an account</p>
                        </div>
                    </motion.div>

                    <div className="space-y-3">
                        <Benefit icon={BookOpen} text="Unlimited access to 500+ premium courses" delay={0.6} />
                        <Benefit icon={Trophy} text="Industry-recognised certificates" delay={0.7} />
                        <Benefit icon={Users} text="Community of 50,000+ active learners" delay={0.8} />
                        <Benefit icon={CheckCircle} text="Hands-on projects with real mentors" delay={0.9} />
                    </div>
                </div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                    className="relative z-10 grid grid-cols-3 gap-4">
                    {[['50K+', 'Students'], ['500+', 'Courses'], ['98%', 'Satisfaction']].map(([val, label]) => (
                        <div key={label} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 text-center">
                            <p className="text-2xl font-black text-white">{val}</p>
                            <p className="text-xs text-slate-500 mt-0.5 font-medium">{label}</p>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[#08090f] relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(99,102,241,0.06),transparent_60%)]" />

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
                    className="w-full max-w-md relative">

                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-black text-sm">T</span>
                        </div>
                        <span className="text-white font-bold">TechiGuru</span>
                    </div>

                    <StepIndicator current={step} total={3} />

                    <div className="mb-6">
                        <h2 className="text-3xl font-black text-white tracking-tight">
                            {step === 1 ? 'Create account' : step === 2 ? 'Verify your email' : 'Your profile'}
                        </h2>
                        <p className="text-slate-500 mt-1.5 text-sm">
                            {step === 1
                                ? <><span>Already have an account? </span><Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">Sign in →</Link></>
                                : step === 2 ? `Enter the 6-digit code sent to ${form.email}`
                                : 'Almost done! Tell us about yourself'}
                        </p>
                    </div>

                    <ErrorBanner />
                    <SuccessBanner />

                    <AnimatePresence mode="wait">
                        {/* ── STEP 1: Credentials ── */}
                        {step === 1 && (
                            <motion.form key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleStep1} className="space-y-4">
                                <InputField icon={Mail} label="Email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                                <InputField icon={Lock} label="Password" type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required>
                                    <button type="button" onClick={() => setShowPassword(p => !p)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </InputField>
                                <InputField icon={Lock} label="Confirm Password" type={showPassword ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" required />

                                <button type="submit" disabled={loading}
                                    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] disabled:opacity-50">
                                    {loading ? <><Loader2 size={16} className="animate-spin" />Sending OTP...</> : <>Send Verification Code <ArrowRight size={15} /></>}
                                </button>
                            </motion.form>
                        )}

                        {/* ── STEP 2: OTP Verify ── */}
                        {step === 2 && (
                            <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleVerifyOTP} className="space-y-5">
                                <div className="flex items-center gap-3 bg-indigo-500/8 border border-indigo-500/20 rounded-2xl px-5 py-4">
                                    <Mail size={16} className="text-indigo-400 flex-shrink-0" />
                                    <p className="text-slate-400 text-sm">OTP sent to <span className="text-white font-semibold">{form.email}</span></p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enter 6-Digit OTP</label>
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

                                {/* Resend */}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Didn't receive it?</span>
                                    {countdown > 0
                                        ? <span className="text-slate-600 font-mono text-xs">Resend in {countdown}s</span>
                                        : <button type="button" onClick={handleResend} disabled={resendLoading}
                                            className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors flex items-center gap-1 disabled:opacity-50">
                                            {resendLoading ? <><RefreshCw size={12} className="animate-spin" />Sending...</> : 'Resend OTP'}
                                          </button>}
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <button type="button" onClick={() => { setStep(1); setOtp(''); setError(''); setSuccess(''); }}
                                        className="h-12 px-5 bg-white/5 border border-white/10 text-slate-300 font-bold rounded-xl hover:bg-white/8 transition-all text-sm">
                                        ← Back
                                    </button>
                                    <button type="submit" disabled={otp.length !== 6}
                                        className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(99,102,241,0.3)] disabled:opacity-50">
                                        Verify <ArrowRight size={15} />
                                    </button>
                                </div>
                            </motion.form>
                        )}

                        {/* ── STEP 3: Profile ── */}
                        {step === 3 && (
                            <motion.form key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleSubmit} className="space-y-4">
                                <InputField icon={User} label="Full Name" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">I am joining as</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { value: 'student', label: '🎓 Student', desc: 'I want to learn' },
                                            { value: 'instructor', label: '🧑‍💻 Instructor', desc: 'I want to teach' }
                                        ].map(r => (
                                            <button key={r.value} type="button" onClick={() => setForm(p => ({ ...p, role: r.value }))}
                                                className={`p-3 rounded-xl border text-left transition-all ${form.role === r.value ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-white/[0.08] text-slate-500 hover:border-white/20'}`}>
                                                <p className="font-bold text-sm">{r.label}</p>
                                                <p className="text-[11px] mt-0.5 opacity-70">{r.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {form.role === 'instructor' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                        className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-400/80">
                                        ⚠ Instructor accounts require admin approval before publishing courses.
                                    </motion.div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => { setStep(2); setError(''); }}
                                        className="h-12 px-5 bg-white/5 border border-white/10 text-slate-300 font-bold rounded-xl hover:bg-white/8 transition-all text-sm">
                                        ← Back
                                    </button>
                                    <button type="submit" disabled={loading}
                                        className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(99,102,241,0.3)] disabled:opacity-50">
                                        {loading ? <><Loader2 size={16} className="animate-spin" />Creating...</> : <>Create Account <ArrowRight size={15} /></>}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <div className="mt-8 pt-6 border-t border-white/[0.06] flex justify-between items-center">
                        <Link to="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">← Back to home</Link>
                        <p className="text-[11px] text-slate-700">By signing up, you agree to our Terms</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Signup;
