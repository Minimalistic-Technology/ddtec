"use client";

import React, { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Loader2, Phone, MessageSquare, User, Shield } from "lucide-react";
import { useAuth } from "../_context/AuthContext";
import { useToast } from "../_context/ToastContext";
import { useComponentSettings } from "../_context/ComponentSettingsContext";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";

const LoginForm = () => {
    const { login, checkUser } = useAuth();
    const { settings } = useComponentSettings();
    const router = useRouter();
    const searchParams = useSearchParams();
    const hint = searchParams.get('hint');
    const { showToast } = useToast();

    // Steps: 'identifier' -> 'password' (for existing) OR 'otp' (for new/signup) -> 'create-password' -> 'maintenance' -> 'admin-bypass'
    const [step, setStep] = useState<"identifier" | "password" | "otp" | "create-password" | "maintenance" | "admin-bypass">("identifier");

    React.useEffect(() => {
        if (settings && settings.LoginSignup === false && step === "identifier") {
            setStep("maintenance");
        }
    }, [settings, step]);

    const [identifier, setIdentifier] = useState("");
    const [isPhone, setIsPhone] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(""); // New state
    const [maintenanceMsg, setMaintenanceMsg] = useState("");
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
            if (err.response?.status === 403 && (err.response?.data?.msg?.includes("disabled") || err.response?.data?.msg?.includes("maintenance"))) {
                setMaintenanceMsg(err.response?.data?.msg);
                setStep("maintenance");
            } else {
                showToast(err.response?.data?.msg || "Failed to check email.", "error");
            }
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
            // Check if error is related to component being disabled based on our logic in context
            // AuthContext may have caught and normalized this error. Let's check response
            if (err.response?.status === 403 && (err.response?.data?.msg?.includes("disabled") || err.response?.data?.msg?.includes("maintenance"))) {
                setMaintenanceMsg(err.response?.data?.msg);
                setStep("maintenance");
            } else {
                showToast(err.message || err.response?.data?.msg || "Invalid credentials", "error");
            }
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

    const [showAdminCode, setShowAdminCode] = useState(false);

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
                                    step === 'maintenance' ? "Under Maintenance" :
                                        step === 'admin-bypass' ? "Admin Login" :
                                            "Verify OTP"}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {step === 'identifier' ? "Enter your email or phone to continue" :
                            step === 'password' ? `Sign in as ${identifier}` :
                                step === 'create-password' ? "Secure your account" :
                                    step === 'maintenance' ? "We'll be right back" :
                                        step === 'admin-bypass' ? "Bypass maintenance mode" :
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

                    {step === 'maintenance' && (
                        <motion.div
                            key="maintenance-view"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="text-center space-y-6"
                        >
                            <div className="mx-auto w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-500 mb-6">
                                <Shield className="size-12" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Login Currently Disabled
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 pb-2">
                                {maintenanceMsg || "Public registration and login are currently undergoing maintenance. Please check back later."}
                            </p>

                            {/* Contact Support Section */}
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact for more info</p>
                                <div className="flex flex-col gap-2">
                                    <a href="mailto:contact@ddtec.com" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors mx-auto font-medium">
                                        <Mail className="size-4" /> contact@ddtec.com
                                    </a>
                                    <a href="tel:+919876543210" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors mx-auto font-medium">
                                        <Phone className="size-4" /> +91 98765 43210
                                    </a>
                                </div>
                            </div>

                            {!showAdminCode ? (
                                <button
                                    onClick={() => setShowAdminCode(true)}
                                    className="text-[10px] font-black text-slate-400 uppercase tracking-tighter hover:text-teal-600 transition-colors"
                                >
                                    Maintenance? Log in as Admin
                                </button>
                            ) : (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const code = new FormData(e.currentTarget).get("secretCode");
                                        if (code === "DDTECH") {
                                            setStep('admin-bypass');
                                        } else {
                                            showToast("Invalid admin code", "error");
                                        }
                                    }}
                                    className="relative max-w-xs mx-auto mb-6 space-y-3 animate-in fade-in slide-in-from-top-2"
                                >
                                    <input
                                        autoFocus
                                        type="password"
                                        name="secretCode"
                                        placeholder="Enter Secret Admin Code"
                                        className="w-full text-center px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-mono"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowAdminCode(false)}
                                            className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="flex-1 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold transition-colors shadow-lg">
                                            Verify Code
                                        </button>
                                    </div>
                                </form>
                            )}

                            <Link
                                href="/"
                                className="inline-flex w-full py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors items-center justify-center"
                            >
                                Return to Homepage
                            </Link>

                            <button
                                onClick={() => setStep('identifier')}
                                className="text-sm font-medium text-teal-600 hover:underline mt-4 inline-block opacity-0 pointer-events-none"
                            >
                                Try checking another account (Admins)
                            </button>
                        </motion.div>
                    )}

                    {step === 'admin-bypass' && (
                        <motion.form
                            key="admin-bypass-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleLogin}
                            className="space-y-6"
                        >
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Identifier</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                                        <input
                                            required
                                            type="text"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium"
                                            placeholder="admin@ddtec.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                                        <input
                                            required
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin size-5" /> : "Login as Admin"}
                            </button>
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
