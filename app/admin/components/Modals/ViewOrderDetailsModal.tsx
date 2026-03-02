"use client";

import React from "react";
import { X, ShoppingBag, Truck, Receipt, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ViewOrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: any | null;
}

const ViewOrderDetailsModal = ({
    isOpen,
    onClose,
    order
}: ViewOrderDetailsModalProps) => {
    if (!order) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col"
                    >
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <ShoppingBag className="size-6 text-teal-500" /> Order Summary
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-widest">ID: {order._id}</p>
                            </div>
                            <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm">
                                <X className="size-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
                            {/* Status Header */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <CheckCircle2 className="size-3" /> Delivery Status
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <Receipt className="size-3" /> Payment Status
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.isPaid ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-700'}`}>
                                        {order.isPaid ? `Paid via ${order.paymentMethod}` : 'Pending Payment'}
                                    </span>
                                </div>
                            </div>

                            {/* Customer & Shipping */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                                        <Truck className="size-4 text-teal-500" /> Shipping Address
                                    </h4>
                                    <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl">
                                        <p className="font-bold text-slate-900 dark:text-white">{order.shippingInfo?.fullName}</p>
                                        <p>{order.shippingInfo?.address}</p>
                                        <p>{order.shippingInfo?.city}, {order.shippingInfo?.postalCode}</p>
                                        <p className="pt-2 font-mono text-teal-600 dark:text-teal-400">{order.shippingInfo?.phoneNo}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                                        Account Details
                                    </h4>
                                    <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl">
                                        <p>User ID: <span className="font-mono text-[10px]">{order.user?._id || 'Guest'}</span></p>
                                        <p>Email: <span className="font-medium">{order.user?.email || 'N/A'}</span></p>
                                        <p>Order Date: {new Date(order.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="space-y-3">
                                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                                    Ordered Items
                                </h4>
                                <div className="border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold uppercase text-[10px]">
                                            <tr>
                                                <th className="p-4">Product</th>
                                                <th className="p-4 text-center">Qty</th>
                                                <th className="p-4 text-right">Price</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {order.orderItems?.map((item: any, idx: number) => (
                                                <tr key={idx} className="bg-white dark:bg-slate-800">
                                                    <td className="p-4">
                                                        <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                                                        <div className="text-[10px] text-slate-500 font-mono">ID: {item.product}</div>
                                                    </td>
                                                    <td className="p-4 text-center font-mono">x{item.quantity}</td>
                                                    <td className="p-4 text-right font-bold text-slate-900 dark:text-white">₹{item.price?.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-slate-50 dark:bg-slate-900/50 font-bold">
                                            <tr>
                                                <td colSpan={2} className="p-4 text-slate-500">Shipping Cost</td>
                                                <td className="p-4 text-right">₹{order.shippingPrice?.toLocaleString()}</td>
                                            </tr>
                                            <tr className="text-lg bg-teal-500 text-white">
                                                <td colSpan={2} className="p-4">Total Amount</td>
                                                <td className="p-4 text-right font-black">₹{order.totalAmount?.toLocaleString()}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end flex-shrink-0">
                            <button
                                onClick={onClose}
                                className="px-8 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 transition-all active:scale-95 shadow-sm"
                            >
                                Close Summary
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ViewOrderDetailsModal;
