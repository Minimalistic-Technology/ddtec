"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../_context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { Package, Clock, CheckCircle, ChevronRight, ShoppingBag, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Order {
    _id: string;
    items: {
        product: {
            name: string;
            image: string;
            price: number;
        };
        quantity: number;
        price: number;
    }[];
    totalAmount: number;
    status: string;
    createdAt: string;
}

export default function OrdersPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders/my-orders');
                setOrders(res.data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setIsFetching(false);
            }
        };

        if (user) fetchOrders();
    }, [user, loading, router]);

    if (loading || isFetching) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="size-8 text-teal-600 animate-spin" />
            </div>
        );
    }

    return (
        <section className="min-h-screen pt-24 pb-12 px-6 bg-slate-50 dark:bg-slate-950">
            <div className="container mx-auto max-w-4xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">My Orders</h1>
                        <p className="text-slate-500">Track and manage your recent purchases</p>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 text-center"
                    >
                        <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                            <ShoppingBag className="size-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No orders yet</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-8">
                            You haven't placed any orders yet. Start shopping to fill this list!
                        </p>
                        <button
                            onClick={() => router.push('/shop')}
                            className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/25"
                        >
                            Explore Shop
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, index) => (
                            <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white dark:bg-slate-900 rounded-3xl shadow-md border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all"
                            >
                                <div className="p-6">
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="size-12 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center text-teal-600">
                                                <Package className="size-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order ID</p>
                                                <p className="font-bold text-slate-900 dark:text-white">#{order._id.toString().slice(-8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</p>
                                                <p className="font-medium text-slate-700 dark:text-slate-300">
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <div className={cn(
                                                "px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 capitalize",
                                                order.status === 'delivered' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                                    order.status === 'processing' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                                        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                            )}>
                                                {order.status === 'delivered' ? <CheckCircle className="size-3" /> : <Clock className="size-3" />}
                                                {order.status}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                                <div className="size-16 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex-shrink-0">
                                                    <img src={item.product?.image} alt={item.product?.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-slate-900 dark:text-white truncate">{item.product?.name || "Product"}</h4>
                                                    <p className="text-sm text-slate-500">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-teal-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Amount</p>
                                            <p className="text-2xl font-black text-slate-900 dark:text-white">₹{order.totalAmount.toFixed(2)}</p>
                                        </div>
                                        <button className="flex items-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors">
                                            View Details <ChevronRight className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
