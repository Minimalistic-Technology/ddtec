
"use client";

import { useCart } from "../_context/CartContext";
import { useAuth } from "../_context/AuthContext";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity, loading } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user && !loading) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const validCartItems = cartItems.filter(item => item.product);
    const total = validCartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    if (loading) {
        return <div className="min-h-screen pt-24 flex justify-center items-center">Loading cart...</div>;
    }

    if (validCartItems.length === 0) {
        return (
            <div className="min-h-screen pt-24 px-6 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="size-10 text-slate-400" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Your cart is empty</h1>
                <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Browse our products to find what you need.</p>
                <Link href="/shop" className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {validCartItems.map((item) => (
                            <div key={item._id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-4 shadow-sm">
                                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex-shrink-0">
                                    {item.product.image ? (
                                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <ShoppingBag className="size-8" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">{item.product.name}</h3>
                                            <p className="text-teal-600 font-bold">₹{item.product.price}</p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.product._id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 className="size-5" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                            <button
                                                onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                                className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
                                            >
                                                <Minus className="size-4" />
                                            </button>
                                            <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                                className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
                                            >
                                                <Plus className="size-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Order Summary</h2>
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Subtotal</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Tax estimate</span>
                                    <span>₹{(total * 0.1).toFixed(2)}</span>
                                </div>
                                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between font-bold text-lg text-slate-900 dark:text-white">
                                    <span>Order Total</span>
                                    <span>₹{(total * 1.1).toFixed(2)}</span>
                                </div>
                            </div>
                            <Link href="/checkout" className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg hover:shadow-teal-500/25 flex items-center justify-center gap-2">
                                Checkout <ArrowRight className="size-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
