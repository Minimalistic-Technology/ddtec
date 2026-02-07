"use client";

import { useState, useEffect } from "react";
import { useCart } from "../_context/CartContext";
import { useAuth } from "../_context/AuthContext";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ArrowRight, CreditCard, Banknote, HelpCircle, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import api from "@/lib/api";

export default function CheckoutPage() {
    const { cartItems, totalPrice, clearCart } = useCart();
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        address: "",
        city: "",
        zip: "",
    });

    const [paymentMethod, setPaymentMethod] = useState("card");
    const [couponCode, setCouponCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [couponError, setCouponError] = useState("");
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login?redirect=/checkout');
        }
        if (user) {
            setFormData(prev => ({ ...prev, fullName: user.name, email: user.email }));
        }
    }, [user, loading, router]);


    const handleApplyCoupon = () => {
        setCouponError("");
        setIsApplyingCoupon(true);

        // Simulate a small delay for better UX
        setTimeout(() => {
            let totalDiscount = 0;
            let foundCount = 0;

            cartItems.forEach(item => {
                const product = item.product as any;
                if (product.couponCode && product.couponCode.toUpperCase() === couponCode.toUpperCase()) {
                    totalDiscount += (item.product.price * (product.discountPercentage || 0) / 100) * item.quantity;
                    foundCount++;
                }
            });

            if (foundCount > 0) {
                setAppliedDiscount(totalDiscount);
                setCouponError("");
                alert("Coupon applied successfully!");
            } else {
                setAppliedDiscount(0);
                setCouponError("Invalid coupon code for items in cart");
            }
            setIsApplyingCoupon(false);
        }, 500);
    };

    const finalTotal = (totalPrice * 1.1) - appliedDiscount;

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const orderData = {
                items: cartItems,
                totalAmount: finalTotal, // Including Tax and Discount
                shippingInfo: formData,
                paymentMethod
            };

            const res = await api.post('/orders', orderData);

            if (res.status === 200 || res.status === 201) {
                setIsSuccess(true);
                clearCart();
            } else {
                alert("Failed to place order. Please try again.");
            }
        } catch (error) {
            console.error("Order failed", error);
            alert("An error occurred.");
        } finally {
            setIsProcessing(false);
        }
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
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                        Thank you for your purchase. You will receive an email confirmation shortly.
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

    if (cartItems.length === 0) {
        router.push('/cart');
        return null;
    }

    return (
        <section className="min-h-screen pt-24 pb-12 px-6 bg-slate-50 dark:bg-slate-950">
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
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-teal-500 outline-none"
                                    />
                                </div>
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
                            {isProcessing ? <Loader2 className="animate-spin size-5" /> : `Pay ₹${finalTotal.toFixed(2)}`}
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

                        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                            <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Have a Coupon?</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="Enter code"
                                    className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 outline-none text-sm font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={handleApplyCoupon}
                                    disabled={!couponCode || isApplyingCoupon}
                                    className="px-4 py-2 bg-slate-900 dark:bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-slate-800 dark:hover:bg-teal-700 transition-all disabled:opacity-50"
                                >
                                    {isApplyingCoupon ? <Loader2 className="animate-spin size-4" /> : "Apply"}
                                </button>
                            </div>
                            {couponError && <p className="text-red-500 text-[10px] mt-1 font-medium">{couponError}</p>}
                            {appliedDiscount > 0 && <p className="text-teal-600 text-[10px] mt-1 font-bold">Discount of ₹{appliedDiscount} applied!</p>}
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Subtotal</span>
                                <span>₹{totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Tax (10%)</span>
                                <span>₹{(totalPrice * 0.1).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Shipping</span>
                                <span className="text-teal-600 font-medium">Free</span>
                            </div>
                            {appliedDiscount > 0 && (
                                <div className="flex justify-between text-teal-600 font-medium">
                                    <span>Discount</span>
                                    <span>-₹{appliedDiscount.toFixed(2)}</span>
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
