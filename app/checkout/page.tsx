"use client";

import { useState, useEffect } from "react";
import { useCart } from "../_context/CartContext";
import { useAuth } from "../_context/AuthContext";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ArrowRight, CreditCard, Banknote, HelpCircle, CheckCircle, Loader2, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import api from "@/lib/api";

export default function CheckoutPage() {
    const { cartItems, totalPrice, clearCart, appliedCoupon, subtotal, applyCoupon, removeCoupon, loading: cartLoading } = useCart();
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
    const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const res = await api.get('/coupons');
                // Filter for active, cart-wide coupons
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
        if (!loading && !user) {
            router.push('/login?redirect=/checkout');
        }
        if (user) {
            setFormData(prev => ({ ...prev, fullName: user.name, email: user.email }));
        }
    }, [user, loading, router]);


    useEffect(() => {
        if (!loading && !cartLoading && cartItems.length === 0) {
            router.push('/cart');
        }
    }, [cartItems, loading, cartLoading, router]);

    // Free Delivery logic matching Cart Page
    const freeDeliveryThreshold = 500;
    const isFreeDelivery = subtotal >= freeDeliveryThreshold;
    const shippingCost = isFreeDelivery ? 0 : 50;

    // totalPrice from context is (subtotal - discount). 
    // We add shipping + tax to get final total.
    const tax = totalPrice * 0.1;
    const finalTotal = totalPrice + tax + shippingCost;

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const orderData = {
                items: cartItems,
                totalAmount: finalTotal,
                shippingInfo: formData,
                paymentMethod,
                coupon: appliedCoupon ? appliedCoupon.code : undefined,
                discountAmount: appliedCoupon ? appliedCoupon.discountAmount : 0
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

    if (cartLoading || cartItems.length === 0) return null;

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

                        {appliedCoupon && (
                            <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-lg flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-green-700 dark:text-green-400">{appliedCoupon.code}</p>
                                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${appliedCoupon.type === 'product' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                                                {appliedCoupon.type === 'product' ? 'Product' : 'Cart'}
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
                                    <span className="font-bold text-green-700 dark:text-green-400">-₹{appliedCoupon.discountAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        {!appliedCoupon && availableCoupons.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Available Coupons</h4>
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
                                                        // Optional: Success toast
                                                    } else {
                                                        alert(result.message); // Show error reason (e.g., "Min order value not met")
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
                                    <span>-₹{appliedCoupon.discountAmount.toFixed(2)}</span>
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

