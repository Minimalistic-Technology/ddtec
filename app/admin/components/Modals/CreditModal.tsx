"use client";

import React from "react";
import { X, Coins, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@/lib/types";

interface CreditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    user: User | null;
    isSubmitting: boolean;
    creditAmount: string;
    setCreditAmount: React.Dispatch<React.SetStateAction<string>>;
    creditOperation: 'add' | 'set';
    setCreditOperation: React.Dispatch<React.SetStateAction<'add' | 'set'>>;
}

const CreditModal = ({
    isOpen,
    onClose,
    onSubmit,
    user,
    isSubmitting,
    creditAmount,
    setCreditAmount,
    creditOperation,
    setCreditOperation
}: CreditModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && user && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-700"
                    >
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Coins className="size-5 text-amber-500" /> Manage Credit
                            </h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X className="size-6" />
                            </button>
                        </div>
                        <form onSubmit={onSubmit} className="p-6 space-y-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="text-xs text-slate-500 uppercase font-black">User</div>
                                <div className="font-bold text-slate-900 dark:text-white">{user.firstName} {user.lastName}</div>
                                <div className="text-xs text-slate-400">{user.email}</div>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-xs text-slate-500">Current Balance:</span>
                                    <span className="font-mono font-bold text-amber-600">₹{user.creditBalance || 0}</span>
                                </div>
                            </div>

                            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setCreditOperation('add')}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${creditOperation === 'add' ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-sm' : 'text-slate-500'}`}
                                >
                                    Add/Subtract
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCreditOperation('set')}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${creditOperation === 'set' ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-sm' : 'text-slate-500'}`}
                                >
                                    Set Absolute
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    {creditOperation === 'add' ? 'Amount to Add (use negative for subtract)' : 'New Balance Amount'}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <input
                                        required
                                        type="number"
                                        value={creditAmount}
                                        onChange={(e) => setCreditAmount(e.target.value)}
                                        className="w-full pl-8 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !creditAmount}
                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Update Credit'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreditModal;
