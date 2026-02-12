"use client";

import { useState, useEffect } from "react";
import { useCart } from "../_context/CartContext";
import { useAuth } from "../_context/AuthContext";
import { useToast } from "../_context/ToastContext";
import { useRouter } from "next/navigation";
import { CreditCard, Banknote, CheckCircle, Loader2, Tag, Trash2, Smartphone, Lock, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import api from "@/lib/api";

export default function CheckoutPage() {
    const { cartItems, totalPrice, clearCart, appliedCoupon, subtotal, applyCoupon, removeCoupon, loading: cartLoading } = useCart();
    const { user, loading, checkUser } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isAccountCreated, setIsAccountCreated] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        zip: "",
    });

    // OTP & Password State
    const [showOtpView, setShowOtpView] = useState(false);
    const [showPhoneInput, setShowPhoneInput] = useState(false);
    const [showPasswordSetup, setShowPasswordSetup] = useState(false);
    const [showLoginView, setShowLoginView] = useState(false);

    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [generatedPassword, setGeneratedPassword] = useState(""); // Kept as fallback or if we want to pre-fill? No, user creates it.

    // Timer State
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [resendCount, setResendCount] = useState(0);

    const [paymentMethod, setPaymentMethod] = useState("card");
    const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
    const [couponInput, setCouponInput] = useState("");
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (showOtpView && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [showOtpView, timer]);

    const handleResendOtp = async () => {
        if (!canResend) return;

        setIsProcessing(true);
        try {
            await api.post('/auth/send-otp', { identifier: formData.email });

            // Increment timer: 60s, 120s, 180s...
            const nextTimer = 60 * (resendCount + 1);
            setTimer(nextTimer);
            setResendCount(prev => prev + 1);
            setCanResend(false);
            setOtp("");
            setOtpError("");

            // Optional: Show success toast/message
        } catch (error: any) {
            console.error("Failed to resend OTP", error);
            setOtpError("Failed to resend OTP. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const res = await api.get('/coupons');
                const cartCoupons = res.data.filter((c: any) =>
                    c.isActive &&
                    c.type === 'cart' &&
                    (!c.expiresAt || new Date(c.expiresAt) > new Date())
                );
                setAvailableCoupons(cartCoupons);
            } catch (error) {
                console.error("Failed to fetch coupons", error);
            }
        };
        fetchCoupons();
    }, []);

    useEffect(() => {
        if (user) {
            const nameParts = (user.name && user.name !== "undefined undefined") ? user.name.split(' ') : [];
            setFormData(prev => ({
                ...prev,
                firstName: user.firstName || nameParts[0] || "",
                lastName: user.lastName || nameParts.slice(1).join(' ') || "",
                email: user.email,
                phone: user.phone || ""
            }));
        }
    }, [user]);

    useEffect(() => {
        if (!isSuccess && !loading && !cartLoading && cartItems.length === 0) {
            router.push('/cart');
        }
    }, [cartItems, loading, cartLoading, router, isSuccess]);

    const freeDeliveryThreshold = 500;
    const isFreeDelivery = subtotal >= freeDeliveryThreshold;
    const shippingCost = isFreeDelivery ? 0 : 50;
    const tax = totalPrice * 0.1;
    const finalTotal = totalPrice + tax + shippingCost;

    const initiateOtpFlow = async () => {
        setIsProcessing(true);
        const identifier = formData.email; // STRICTOR: Only use email for now

        if (!identifier) {
            showToast("Email is required for verification", "error");
            setIsProcessing(false);
            return;
        }

        try {
            // 1. Check if user exists in DDTEC
            const checkRes = await api.post('/auth/check-user', { identifier });

            if (checkRes.data.exists) {
                // EXISTING USER -> Ask for password
                setShowPhoneInput(false);
                setShowOtpView(false);
                setShowLoginView(true);
            } else {
                // NEW USER -> Try to send OTP to Email
                try {
                    await api.post('/auth/send-otp', { identifier });
                    setShowPhoneInput(false);
                    setShowOtpView(true);
                    setShowLoginView(false);
                    setTimer(60);
                    setCanResend(false);
                } catch (otpErr: any) {
                    // IF EMAIL IS FAKE/INVALID -> Backend blocks it
                    showToast(otpErr.response?.data?.msg || "Email not found or invalid.", "error");
                }
            }
        } catch (error: any) {
            console.error("Auth check failed", error);
            showToast(error.response?.data?.msg || "Failed to verify account.", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            setPasswordError("Password is required");
            return;
        }
        setIsProcessing(true);
        try {
            const identifier = formData.email || formData.phone;
            await api.post('/auth/login', {
                email: formData.email,
                phone: formData.phone,
                password
            });
            await checkUser();
            showToast("Logged in successfully!", "success");
            setShowLoginView(false);
            // Proceed to submit order automatically after login
            await submitOrder();
        } catch (err: any) {
            setPasswordError(err.response?.data?.msg || "Invalid password.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            setOtpError("Please enter a valid 6-digit OTP");
            return;
        }
        setOtpError("");
        setIsProcessing(true);

        try {
            // Verify OTP without consuming it (if backend supports verify-only) 
            // OR we just trust frontend state if we don't have a verify endpoint?
            // User requested we have a verify-otp endpoint.
            await api.post('/auth/verify-otp', { identifier: formData.email, otp });

            // If verify success, move to Password Setup
            setShowOtpView(false);
            setShowPasswordSetup(true);

        } catch (error: any) {
            console.error("OTP Verification failed", error);
            setOtpError(error.response?.data?.msg || "Invalid OTP");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCompleteRegistrationAndOrder = async () => {
        if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return;
        }
        if (password !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }
        setPasswordError("");
        setIsProcessing(true);

        try {
            const { firstName, lastName } = formData;

            const registerData = {
                firstName,
                lastName,
                email: formData.email,
                phone: formData.phone,
                password: password, // User created password
                otp, // The verified OTP
                role: 'user',
                accountType: 'individual'
            };

            await api.post('/auth/register', registerData);

            // Auto Login to get token
            await api.post('/auth/login', { email: formData.email, password });

            // Refresh Auth Context to update user state
            await checkUser();

            setIsAccountCreated(true); // Mark account as created

            // Proceed to submit order
            await submitOrder();

        } catch (error: any) {
            console.error("Registration failed", error);
            // If registration fails here (e.g. OTP expired in the meantime), we might need to send them back?
            setPasswordError(error.response?.data?.msg || "Registration failed. Please try again.");
            setIsProcessing(false);
        }
    }

    const submitOrder = async () => {
        setIsProcessing(true);
        try {
            // Update User Profile with checkout info (Name/Address) if it's missing or if we want to sync it
            if (user) {
                try {
                    await api.put('/auth/me', {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        address: {
                            street: formData.address,
                            city: formData.city,
                            zip: formData.zip
                        },
                        phone: formData.phone // Ensure phone is synced
                    });
                } catch (updateErr) {
                    console.warn("Failed to update user profile", updateErr);
                }
            }

            const orderData = {
                items: cartItems,
                totalAmount: finalTotal,
                shippingInfo: {
                    ...formData,
                    fullName: `${formData.firstName} ${formData.lastName}`.trim()
                },
                paymentMethod,
                coupon: appliedCoupon ? appliedCoupon.code : undefined,
                discountAmount: appliedCoupon ? appliedCoupon.discountAmount : 0
            };

            const res = await api.post('/orders', orderData);

            if (res.status === 200 || res.status === 201) {
                setIsSuccess(true);
                clearCart();
                showToast("Order Placed Successfully!", "success");
            } else {
                showToast("Failed to place order. Please try again.", "error");
            }
        } catch (error: any) {
            console.error("Order failed", error);
            const msg = error.response?.data?.msg || "An error occurred during checkout.";
            showToast(msg, "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        // Enforce Signup for Guests
        if (!user) {
            // New Flow: Always verify email for guests
            if (!formData.email) {
                showToast("Email is required for checkout", "error");
                return;
            }

            // Trigger Smart Auth flow (Email Only)
            await initiateOtpFlow();
            return;
        }

        // Logged-in User Order
        await submitOrder();
    };

    if (loading) return null;

    if (isSuccess) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center px-6 bg-slate-50 dark:bg-slate-950 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100 dark:border-slate-800"
                >
                    <div className="size-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <CheckCircle className="size-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Order Confirmed!</h2>
                    {isAccountCreated && (
                        <div className="mb-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-100 dark:border-teal-800">
                            <p className="text-teal-700 dark:text-teal-300 font-medium">
                                Account Created Successfully!
                            </p>
                            <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                                You have been logged in automatically.
                            </p>
                        </div>
                    )}
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                        Your order is completed. {!user && "Your existing account has been used."} You will receive an email confirmation shortly.
                    </p>
                    <Link
                        href="/"
                        className="block w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg hover:shadow-teal-500/25"
                    >
                        Continue Shopping
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (showOtpView) {
        return (
            <section className="min-h-screen pt-24 pb-12 px-6 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100 dark:border-slate-800 text-center"
                >
                    <div className="size-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-600">
                        <Mail className="size-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verify Email</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                        We sent a 6-digit verification code to <strong>{formData.email}</strong>. <br />Please enter it below to complete your order.
                    </p>

                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="------"
                        className="w-full px-4 py-4 text-center text-2xl tracking-[0.5em] font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-teal-500 outline-none mb-4"
                        autoFocus
                    />

                    {otpError && <p className="text-red-500 text-sm mb-6">{otpError}</p>}

                    <div className="mb-6">
                        {canResend ? (
                            <button
                                onClick={handleResendOtp}
                                disabled={isProcessing}
                                className="text-sm font-semibold text-teal-600 hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                            >
                                {isProcessing ? "Resending..." : "Resend OTP"}
                            </button>
                        ) : (
                            <p className="text-sm text-slate-400">
                                Resend OTP in {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handleVerifyOtp}
                        disabled={isProcessing || otp.length !== 6}
                        className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg hover:shadow-teal-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mb-4"
                    >
                        {isProcessing ? <Loader2 className="animate-spin size-5" /> : "Verify Code"}
                    </button>

                    <button
                        onClick={() => {
                            setShowOtpView(false);
                        }}
                        className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                        Change Email
                    </button>
                    <button
                        onClick={() => { setShowOtpView(false); setShowPhoneInput(false); }}
                        className="block mt-4 mx-auto text-xs text-slate-400 hover:text-slate-600"
                    >
                        Cancel Verification
                    </button>
                </motion.div>
            </section>
        )
    }

    if (showLoginView) {
        return (
            <section className="min-h-screen pt-24 pb-12 px-6 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100 dark:border-slate-800 text-center"
                >
                    <div className="size-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-600">
                        <Lock className="size-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                        An account already exists for <strong>{formData.email || formData.phone}</strong>. Please enter your password to continue.
                    </p>

                    <form onSubmit={handleLogin} className="space-y-4 text-left">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                            <input
                                autoFocus
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="••••••••"
                            />
                        </div>

                        {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}

                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full py-3 mt-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg hover:shadow-teal-500/25 flex items-center justify-center gap-2"
                        >
                            {isProcessing ? <Loader2 className="animate-spin size-5" /> : "Login & Complete Order"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowLoginView(false)}
                            className="w-full text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors pt-2"
                        >
                            Back
                        </button>
                    </form>
                </motion.div>
            </section>
        )
    }

    if (showPasswordSetup) {
        return (
            <section className="min-h-screen pt-24 pb-12 px-6 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100 dark:border-slate-800 text-center"
                >
                    <div className="size-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                        <CheckCircle className="size-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Create Password</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                        Secure your account by creating a password. You will use this to login in the future.
                    </p>

                    <div className="space-y-4 text-left max-w-sm mx-auto mb-6">
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 mt-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="••••••••"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 mt-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {passwordError && <p className="text-red-500 text-sm mb-6">{passwordError}</p>}

                    <button
                        onClick={handleCompleteRegistrationAndOrder}
                        disabled={isProcessing || !password || !confirmPassword}
                        className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg hover:shadow-teal-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mb-4"
                    >
                        {isProcessing ? <Loader2 className="animate-spin size-5" /> : "Complete Order"}
                    </button>

                    <button
                        onClick={() => { setShowPasswordSetup(false); setShowOtpView(true); }}
                        className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                        Back
                    </button>
                </motion.div>
            </section>
        )
    }

    if (cartLoading || cartItems.length === 0) return null;

    return (
        <section className="min-h-screen pt-24 pb-12 px-6 bg-slate-50 dark:bg-slate-950 relative">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column: Shipping & Payment */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        Checkout Details
                    </h2>

                    <form onSubmit={handlePlaceOrder} className="space-y-8">
                        {/* Shipping Info */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b dark:border-slate-800 pb-2 mb-4">Shipping Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-teal-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-teal-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                                    <input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-teal-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                                    <input
                                        required
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-teal-500 outline-none"
                                        placeholder="10-digit mobile number"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-teal-500 outline-none"
                                    placeholder="123 Main St"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-teal-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ZIP Code</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.zip}
                                        onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-teal-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b dark:border-slate-800 pb-2 mb-4">Payment Method</h3>

                            <div className="space-y-3">
                                <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-teal-200'}`}>
                                    <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-5 h-5 text-teal-600 focus:ring-teal-500" />
                                    <div className="ml-4 flex items-center gap-2">
                                        <CreditCard className="size-5 text-slate-700 dark:text-slate-300" />
                                        <span className="font-medium text-slate-900 dark:text-white">Credit / Debit Card</span>
                                    </div>
                                </label>

                                <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-teal-200'}`}>
                                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 text-teal-600 focus:ring-teal-500" />
                                    <div className="ml-4 flex items-center gap-2">
                                        <Banknote className="size-5 text-slate-700 dark:text-slate-300" />
                                        <span className="font-medium text-slate-900 dark:text-white">Cash on Delivery</span>
                                    </div>
                                </label>
                            </div>

                            {paymentMethod === 'card' && (
                                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-slate-500">Card Number</label>
                                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-3 py-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-slate-500">Expiry</label>
                                            <input type="text" placeholder="MM/YY" className="w-full px-3 py-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-slate-500">CVC</label>
                                            <input type="text" placeholder="123" className="w-full px-3 py-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 outline-none" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg hover:shadow-teal-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? <Loader2 className="animate-spin size-5" /> : (user ? `Pay ₹${finalTotal.toFixed(2)}` : "Sign Up & Pay")}
                        </button>
                    </form>
                </div>

                {/* Right Column: Order Summary */}
                <div className="h-fit">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 sticky top-24">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b dark:border-slate-800 pb-2 mb-4">Order Summary</h3>

                        <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar mb-6">
                            {cartItems.map((item) => (
                                <div key={item.product._id} className="flex gap-4">
                                    <div className="size-16 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-slate-900 dark:text-white line-clamp-1">{item.product.name}</h4>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-sm text-slate-500">Qty: {item.quantity}</span>
                                            <span className="font-semibold text-teal-600">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {appliedCoupon && (
                            <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-lg flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-green-700 dark:text-green-400">{appliedCoupon?.code}</p>
                                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${appliedCoupon?.type === 'product' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                                                {appliedCoupon?.type === 'product' ? 'Product' : 'Cart'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">Coupon applied</p>
                                    </div>
                                    <button onClick={removeCoupon} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Remove Coupon">
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-green-100 dark:border-green-900/30">
                                    <span className="text-xs font-semibold text-green-700 dark:text-green-400">Savings</span>
                                    <span className="font-bold text-green-700 dark:text-green-400">-₹{appliedCoupon?.discountAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        {!appliedCoupon && (
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Have a coupon?</h4>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                        <input
                                            type="text"
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                            placeholder="Enter Code"
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (!couponInput) return;
                                            setIsApplyingCoupon(true);
                                            const result = await applyCoupon(couponInput);
                                            if (result.success) {
                                                showToast("Coupon Applied Successfully!", "success");
                                                setCouponInput("");
                                            } else {
                                                showToast(result.message, "error");
                                            }
                                            setIsApplyingCoupon(false);
                                        }}
                                        disabled={isApplyingCoupon || !couponInput}
                                        className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-lg text-sm font-bold disabled:opacity-50"
                                    >
                                        {isApplyingCoupon ? <Loader2 className="animate-spin size-4" /> : "Apply"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {!appliedCoupon && availableCoupons.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Available Offers</h4>
                                <div className="space-y-2">
                                    {availableCoupons.map(coupon => (
                                        <div key={coupon._id} className="p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-lg flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Tag className="size-3 text-teal-600 dark:text-teal-400" />
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{coupon.code}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    Save {coupon.discountType === 'fixed' ? '₹' : ''}{coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : ''}
                                                </p>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    const result = await applyCoupon(coupon.code);
                                                    if (result.success) {
                                                        showToast("Coupon Applied Successfully!", "success");
                                                    } else {
                                                        showToast(result.message, "error");
                                                    }
                                                }}
                                                className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-md shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-teal-50 transition-colors"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Tax (10%)</span>
                                <span>₹{tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Shipping</span>
                                {isFreeDelivery ? (
                                    <span className="text-green-600 font-medium">Free</span>
                                ) : (
                                    <span>₹50.00</span>
                                )}
                            </div>
                            {appliedCoupon && (
                                <div className="flex justify-between text-teal-600 font-medium">
                                    <span>Discount</span>
                                    <span>-₹{appliedCoupon?.discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                                <span className="font-bold text-lg text-slate-900 dark:text-white">Total</span>
                                <span className="font-bold text-2xl text-teal-600">₹{finalTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
