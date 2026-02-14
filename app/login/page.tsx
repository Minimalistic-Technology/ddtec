"use client";

import React, { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Loader2, Phone, MessageSquare, User, Shield } from "lucide-react";
import { useAuth } from "../_context/AuthContext";
import { useToast } from "../_context/ToastContext";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";

const LoginForm = () => {
    const { login, checkUser } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const hint = searchParams.get('hint');
    const { showToast } = useToast();

    // Steps: 'identifier' -> 'password' (for existing) OR 'otp' (for new/signup) -> 'create-password'
    const [step, setStep] = useState<"identifier" | "password" | "otp" | "create-password">("identifier");

    const [identifier, setIdentifier] = useState("");
    const [isPhone, setIsPhone] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(""); // New state
    const [otp, setOtp] = useState("");
    const [secondaryIdentifier, setSecondaryIdentifier] = useState(""); // For the "other" one
    const [isLoading, setIsLoading] = useState(false);
    // const [error, setError] = useState(""); // Removed local error state in favor of Toast

    // Unified Login/Signup Step 1
    const handleCheckUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const trimmedIdentifier = identifier.trim();
        try {
            // 1. Check if user exists in DDTEC website
            const res = await api.post('/auth/check-user', { identifier: trimmedIdentifier });

            if (res.data.exists) {
                // EXITS ON WEBSITE -> Ask for password
                setStep("password");
            } else {
                // NOT ON WEBSITE -> Try to send OTP for Signup
                // This call will fail if the email is "fake" (disposable domains)
                try {
                    await api.post('/auth/send-otp', { identifier: trimmedIdentifier });
                    setStep("otp");
                    showToast(`New account! Verification code sent to ${identifier}`, "success");
                } catch (otpErr: any) {
                    // IF EMAIL IS FAKE/INVALID -> Backend throws error here
                    const errorMsg = otpErr.response?.data?.msg || "Email not found or invalid.";
                    showToast(errorMsg, "error");
                }
            }
        } catch (err: any) {
            showToast(err.response?.data?.msg || "Failed to check email.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(identifier, password);
            // Login context handles redirect and toast? 
            // Ideally login function in context should throw if failed so we can catch it here.
            // It does throw.
            showToast("Logged in successfully", "success");
        } catch (err: any) {
            // Error is already toasted or logged? 
            // The context throws with message.
            showToast(err.message || "Invalid credentials", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Verify OTP Logic
            await api.post('/auth/verify-otp', { identifier, otp });

            // If success, move to Create Password step
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
            // 1. Register
            const payload = {
                firstName: "",
                lastName: "",
                email: isPhone ? secondaryIdentifier : identifier,
                phone: isPhone ? identifier : secondaryIdentifier,
                password: password,
                otp,
                role: 'user',
                accountType: 'individual'
            };

            await api.post('/auth/register', payload);

            // 2. Auto Login
            await api.post('/auth/login', {
                email: isPhone ? secondaryIdentifier : identifier,
                phone: isPhone ? identifier : secondaryIdentifier,
                password: password
            });

            // 3. Sync State
            await checkUser();

            showToast("Account Created & Logged In!", "success");

            // Redirect
            router.push('/');
        } catch (err: any) {
            showToast(err.response?.data?.msg || "Registration failed.", "error");
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
            {/* Background Decor */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 relative z-10"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        {step === 'identifier' ? (hint === 'signup' ? "Create Account" : "Welcome") :
                            step === 'password' ? "Welcome Back" :
                                step === 'create-password' ? "Create Password" :
                                    "Verify OTP"}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {step === 'identifier' ? "Enter your email or phone to continue" :
                            step === 'password' ? `Sign in as ${identifier}` :
                                step === 'create-password' ? "Secure your account" :
                                    `Code sent to ${identifier}`}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 'identifier' && (
                        <motion.form
                            key="identifier-form"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleCheckUser}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email or Phone</label>
                                <div className="relative">
                                    {isPhone ? (
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                                    ) : (
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                                    )}
                                    <input
                                        required
                                        type="text"
                                        value={identifier}
                                        onChange={(e) => handleIdentifierChange(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                        placeholder="john@example.com or +123..."
                                        autoComplete="on"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin size-5" /> : <>Continue <ArrowRight className="size-5" /></>}
                            </button>
                        </motion.form>
                    )}

                    {step === 'password' && (
                        <motion.form
                            key="password-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleLogin}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                                    <input
                                        required
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                        placeholder="••••••••"
                                        autoFocus
                                    />
                                </div>
                                <div className="text-right">
                                    <button type="button" className="text-xs text-teal-600 hover:underline">Forgot Password?</button>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep('identifier')}
                                    className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="animate-spin size-5" /> : "Sign In"}
                                </button>
                            </div>
                        </motion.form>
                    )}

                    {step === 'otp' && (
                        <motion.form
                            key="otp-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleVerifyOtp}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Verification Code</label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                                    <input
                                        autoFocus
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all tracking-widest font-bold uppercase text-center text-xl"
                                        placeholder="XXXXXX"
                                        maxLength={6}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 text-center">
                                    Check server console for MOCK OTP.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep('identifier')}
                                    className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="animate-spin size-5" /> : "Verify Code"}
                                </button>
                            </div>
                        </motion.form>
                    )}

                    {step === 'create-password' && (
                        <motion.form
                            key="create-password-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleCompleteSignup}
                            className="space-y-6"
                        >
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
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                            placeholder="at least 6 characters"
                                            autoFocus
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {isPhone ? "Email Address" : "Phone Number"}
                                    </label>
                                    <div className="relative">
                                        {isPhone ? (
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                                        ) : (
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                                        )}
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

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                                        <input
                                            required
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                            placeholder="repeat password"
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Error toast handles errors, no local state needed */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep('otp')} // Go back to OTP if needed, or maybe just identifier
                                    className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="animate-spin size-5" /> : "Create Account"}
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </section>
    );
};

const Login = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="animate-spin size-10 text-teal-600" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
};

export default Login;
