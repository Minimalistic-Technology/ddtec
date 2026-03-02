"use client";

import React from "react";
import { X, Ticket, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ViewCouponsModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    coupons: any[];
}

const ViewCouponsModal = ({
    isOpen,
    onClose,
    productName,
    coupons
}: ViewCouponsModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-700"
                    >
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Ticket className="size-5 text-teal-600" /> Linked Coupons
                            </h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X className="size-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="text-xs text-slate-500 uppercase font-black mb-1">Product</div>
                            <div className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">{productName}</div>

                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {coupons.map((coupon, idx) => (
                                    <div key={idx} className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-100 dark:border-teal-800 flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="font-mono font-black text-teal-700 dark:text-teal-400 flex items-center gap-1">
                                                <Tag className="size-3" /> {coupon.code}
                                            </span>
                                            <span className="text-[10px] text-teal-600/70 font-bold uppercase">Discount Code</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-black text-teal-800 dark:text-teal-300">
                                                {coupon.discountPercentage}%
                                            </div>
                                            <div className="text-[10px] text-teal-600/70 uppercase">Off</div>
                                        </div>
                                    </div>
                                ))}
                                {coupons.length === 0 && (
                                    <div className="p-8 text-center text-slate-400 italic text-sm">No secondary coupons found</div>
                                )}
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 transition-all active:scale-95"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ViewCouponsModal;
