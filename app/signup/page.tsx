"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Loader2, Phone, MessageSquare, User } from "lucide-react";
import { useAuth } from "../_context/AuthContext";
import { useToast } from "../_context/ToastContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const Signup = () => {
    const { checkUser } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();

    const [step, setStep] = useState<"identifier" | "otp" | "create-password">("identifier");
    const [identifier, setIdentifier] = useState("");
    const [isPhone, setIsPhone] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [secondaryIdentifier, setSecondaryIdentifier] = useState("");
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // First check if user exists
            const checkRes = await api.post('/auth/check-user', { identifier });
            if (checkRes.data.exists) {
                showToast("Account already exists. Please login.", "error");
                return;
            }

            await api.post('/auth/send-otp', { identifier });
            setStep("otp");
            showToast(`Verification code sent to ${identifier}`, "success");
        } catch (err: any) {
            showToast(err.response?.data?.msg || "Failed to send OTP.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/auth/verify-otp', { identifier, otp });
            setStep("create-password");
            showToast("OTP Verified", "success");
        } catch (err: any) {
            showToast(err.response?.data?.msg || "Invalid OTP", "error");
        } finally {
            setIsLoading(false);
        }
    }

    const handleCompleteSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            showToast("Password must be at least 6 characters", "error");
            return;
        }
        if (password !== confirmPassword) {
            showToast("Passwords do not match", "error");
            return;
        }
        setIsLoading(true);
        try {
            const payload = {
                firstName: "", lastName: "",
                email: isPhone ? secondaryIdentifier : identifier,
                phone: isPhone ? identifier : secondaryIdentifier,
                password, otp, role: 'user', accountType: 'individual'
            };
            await api.post('/auth/register', payload);
            await api.post('/auth/login', {
                email: isPhone ? secondaryIdentifier : identifier,
                phone: isPhone ? identifier : secondaryIdentifier,
                password
            });
            await checkUser();
            showToast("Account Created successfully!", "success");
            router.push('/');
        } catch (err: any) {
            showToast(err.response?.data?.msg || "Registration failed.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleIdentifierChange = (val: string) => {
        setIdentifier(val);
        const phoneRegex = /^[0-9+]+$/;
        setIsPhone(phoneRegex.test(val));
    };

    return (
        <section className="min-h-screen pt-20 flex items-center justify-center bg-slate-50 dark:bg-slate-900 relative overflow-hidden px-4">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 relative z-10"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        {step === 'identifier' ? "Create Account" : step === 'otp' ? "Verify Email" : "Create Password"}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {step === 'identifier' ? "Join DDTEC today" : `Code sent to ${identifier}`}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 'identifier' && (
                        <motion.form key="id-form" onSubmit={handleSendOtp} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email or Phone</label>
                                <div className="relative">
                                    {isPhone ? <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" /> : <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />}
                                    <input required type="text" value={identifier} onChange={(e) => handleIdentifierChange(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all" placeholder="john@example.com or +123..." />
                                </div>
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                                {isLoading ? <Loader2 className="animate-spin size-5" /> : <>Get Started <ArrowRight className="size-5" /></>}
                            </button>
                            <div className="text-center text-sm text-slate-500">
                                Already have an account? <Link href="/login" className="text-teal-600 font-semibold">Login</Link>
                            </div>
                        </motion.form>
                    )}

                    {step === 'otp' && (
                        <motion.form key="otp-form" onSubmit={handleVerifyOtp} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Verification Code</label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                                    <input autoFocus type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 text-center text-xl font-bold tracking-widest" placeholder="XXXXXX" maxLength={6} />
                                </div>
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                                {isLoading ? <Loader2 className="animate-spin size-5" /> : "Verify Code"}
                            </button>
                        </motion.form>
                    )}

                    {step === 'create-password' && (
                        <motion.form key="pass-form" onSubmit={handleCompleteSignup} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Create Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                                        <input
                                            required
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                                            placeholder="at least 6 characters"
                                            autoFocus
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                                        <input
                                            required
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                                            placeholder="repeat password"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {isPhone ? "Email Address" : "Phone Number"}
                                    </label>
                                    <div className="relative">
                                        {isPhone ? <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" /> : <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />}
                                        <input
                                            required
                                            type={isPhone ? "email" : "tel"}
                                            value={secondaryIdentifier}
                                            onChange={(e) => setSecondaryIdentifier(isPhone ? e.target.value : e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                                            placeholder={isPhone ? "john@example.com" : "10-digit mobile number"}
                                        />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                                {isLoading ? <Loader2 className="animate-spin size-5" /> : "Complete Signup"}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </section>
    );
};

export default Signup;
