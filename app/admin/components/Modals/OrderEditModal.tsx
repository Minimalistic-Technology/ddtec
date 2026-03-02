"use client";

import React from "react";
import { X, Truck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    editingOrder: any | null;
    isSubmitting: boolean;
    setEditingOrder: React.Dispatch<React.SetStateAction<any | null>>;
}

const OrderEditModal = ({
    isOpen,
    onClose,
    onSubmit,
    editingOrder,
    isSubmitting,
    setEditingOrder
}: OrderEditModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && editingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700"
                    >
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Truck className="size-5 text-teal-600" /> Edit Shipping Details
                            </h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X className="size-6" />
                            </button>
                        </div>
                        <form onSubmit={onSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Customer Full Name</label>
                                <input
                                    required
                                    type="text"
                                    value={editingOrder.shippingInfo?.fullName || ""}
                                    onChange={(e) => setEditingOrder({
                                        ...editingOrder,
                                        shippingInfo: { ...editingOrder.shippingInfo, fullName: e.target.value }
                                    })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Physical Address</label>
                                <textarea
                                    required
                                    value={editingOrder.shippingInfo?.address || ""}
                                    onChange={(e) => setEditingOrder({
                                        ...editingOrder,
                                        shippingInfo: { ...editingOrder.shippingInfo, address: e.target.value }
                                    })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-teal-500 h-24 resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City</label>
                                    <input
                                        required
                                        type="text"
                                        value={editingOrder.shippingInfo?.city || ""}
                                        onChange={(e) => setEditingOrder({
                                            ...editingOrder,
                                            shippingInfo: { ...editingOrder.shippingInfo, city: e.target.value }
                                        })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                                    <input
                                        required
                                        type="text"
                                        value={editingOrder.shippingInfo?.phoneNo || ""}
                                        onChange={(e) => setEditingOrder({
                                            ...editingOrder,
                                            shippingInfo: { ...editingOrder.shippingInfo, phoneNo: e.target.value }
                                        })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all border border-slate-200 dark:border-slate-600 active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Update Order'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OrderEditModal;
