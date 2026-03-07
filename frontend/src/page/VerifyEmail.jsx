import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const status = searchParams.get('status'); // 'success' | 'invalid' | 'error'
    const [countdown, setCountdown] = useState(5);

    // Auto-redirect on success
    useEffect(() => {
        if (status === 'success') {
            const timer = setInterval(() => setCountdown(c => c - 1), 1000);
            const redirect = setTimeout(() => { window.location.href = '/login'; }, 5000);
            return () => { clearInterval(timer); clearTimeout(redirect); };
        }
    }, [status]);

    const states = {
        success: {
            icon: CheckCircle,
            iconColor: 'text-green-400',
            iconBg: 'bg-green-500/15 border-green-500/30',
            title: 'Email Verified!',
            subtitle: 'Your account has been successfully verified.',
            message: `You'll be redirected to login in ${countdown} seconds.`,
            cta: { label: 'Go to Login', href: '/login', style: 'from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500' },
        },
        invalid: {
            icon: XCircle,
            iconColor: 'text-rose-400',
            iconBg: 'bg-rose-500/15 border-rose-500/30',
            title: 'Link Expired or Invalid',
            subtitle: 'This verification link has expired or already been used.',
            message: 'Please request a new link from the admin, or verify manually with your email OTP.',
            cta: { label: 'Verify via OTP instead', href: '/login', style: 'from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500' },
        },
        error: {
            icon: AlertCircle,
            iconColor: 'text-amber-400',
            iconBg: 'bg-amber-500/15 border-amber-500/30',
            title: 'Something Went Wrong',
            subtitle: 'We encountered an error while verifying your account.',
            message: 'Please try again or contact support at techiguru.in@gmail.com.',
            cta: { label: 'Try Again', href: '/login', style: 'from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500' },
        },
    };

    const current = states[status] || states.error;
    const Icon = current.icon;

    if (!status) {
        return (
            <div className="min-h-screen bg-[#05070f] flex items-center justify-center">
                <Loader2 size={32} className="text-indigo-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#05070f] flex items-center justify-center p-6 font-sans">
            {/* Background orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-32 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative w-full max-w-md">

                {/* Card */}
                <div className="bg-[#0c0e24] border border-white/[0.08] rounded-2xl p-10 text-center shadow-2xl">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-black text-base">T</span>
                        </div>
                        <span className="text-white font-black text-lg tracking-tight">TechiGuru</span>
                    </div>

                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className={`w-20 h-20 rounded-full border ${current.iconBg} flex items-center justify-center mx-auto mb-6`}>
                        <Icon size={36} className={current.iconColor} />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl font-black text-white mb-2">
                        {current.title}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-slate-400 text-sm mb-2">
                        {current.subtitle}
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-slate-600 text-xs mb-8">
                        {status === 'success' ? `You'll be redirected to login in ${countdown} seconds.` : current.message}
                    </motion.p>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                        <Link to={current.cta.href}
                            className={`w-full h-12 bg-gradient-to-r ${current.cta.style} text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(99,102,241,0.25)] text-sm`}>
                            {current.cta.label} <ArrowRight size={15} />
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyEmailPage;
