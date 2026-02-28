"use client";

import React from "react";
import { X, User as UserIcon, Mail, Shield, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@/lib/types";

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    editingUser: User | null;
    newUser: any;
    setNewUser: React.Dispatch<React.SetStateAction<any>>;
    isSubmitting: boolean;
    currentUser: User | null;
}

const UserModal = ({
    isOpen,
    onClose,
    onSubmit,
    editingUser,
    newUser,
    setNewUser,
    isSubmitting,
    currentUser
}: UserModalProps) => {
    const ALL_CUSTOM_PAGES = ['dashboard', 'categories', 'products', 'inventory', 'orders', 'billing', 'coupons', 'users', 'messages', 'blogs', 'components'];

    const handleCustomPageToggle = (page: string, type: 'view' | 'edit') => {
        if (type === 'view') {
            const currentPages = newUser.customPages || [];
            if (currentPages.includes(page)) {
                // If removing view access, also remove edit access
                const currentEdits = newUser.editPages || [];
                setNewUser({
                    ...newUser,
                    customPages: currentPages.filter((p: string) => p !== page),
                    editPages: currentEdits.filter((p: string) => p !== page)
                });
            } else {
                setNewUser({ ...newUser, customPages: [...currentPages, page] });
            }
        } else if (type === 'edit') {
            const currentEdits = newUser.editPages || [];
            if (currentEdits.includes(page)) {
                setNewUser({ ...newUser, editPages: currentEdits.filter((p: string) => p !== page) });
            } else {
                // If granting edit access, ensure they have view access too
                const currentPages = newUser.customPages || [];
                const newPages = currentPages.includes(page) ? currentPages : [...currentPages, page];
                setNewUser({ ...newUser, editPages: [...currentEdits, page], customPages: newPages });
            }
        }
    };
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 dark:border-slate-700"
                    >
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingUser ? "Edit Account" : "Add New Staff Account"}
                            </h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X className="size-6" />
                            </button>
                        </div>
                        <form onSubmit={onSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newUser.firstName || ""}
                                        onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newUser.lastName || ""}
                                        onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                    <input
                                        required
                                        type="email"
                                        value={newUser.email || ""}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                                        placeholder="employee@ddtech.com"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4 opacity-0" /> {/* Spacer */}
                                        <input
                                            required
                                            type="tel"
                                            value={newUser.phone || ""}
                                            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                                            placeholder="10-digit mobile number"
                                        />
                                    </div>
                                </div>
                            </div>
                            {!editingUser && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Initial Password</label>
                                    <input
                                        required
                                        type="password"
                                        value={(newUser as any).password || ""}
                                        onChange={(e) => setNewUser({ ...newUser, ['password']: e.target.value } as any)}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                                        placeholder="••••••••"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Provide an initial password for the staff member.</p>
                                </div>
                            )}
                            {newUser.role !== 'user' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Staff Role</label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                        <select
                                            value={newUser.role || "user"}
                                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
                                        >
                                            <option value="user">Standard User (Customer)</option>
                                            <option value="super_admin">Super Admin</option>
                                            <option value="product_manager">Product Manager</option>
                                            <option value="order_manager">Order Manager</option>
                                            <option value="customer_support">Customer Support</option>
                                            <option value="finance">Finance</option>
                                            <option value="marketing">Marketing</option>
                                            <option value="admin">Admin (Legacy)</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {currentUser?.role === 'super_admin' && newUser.role !== 'user' && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Custom Page Access (Overrides Role)</label>
                                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden">
                                        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-500 uppercase">
                                            <span>Module</span>
                                            <span className="text-center">View</span>
                                            <span className="text-center">Edit / Add</span>
                                        </div>
                                        <div className="p-2 space-y-1">
                                            {ALL_CUSTOM_PAGES.map(page => (
                                                <div key={page} className="grid grid-cols-3 gap-2 p-2 items-center hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{page}</span>
                                                    <div className="flex justify-center">
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                                checked={(newUser.customPages || []).includes(page)}
                                                                onChange={() => handleCustomPageToggle(page, 'view')}
                                                            />
                                                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-teal-500"></div>
                                                        </label>
                                                    </div>
                                                    <div className="flex justify-center">
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                                checked={(newUser.editPages || []).includes(page)}
                                                                onChange={() => handleCustomPageToggle(page, 'edit')}
                                                            />
                                                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin size-5" /> : (editingUser ? 'Save Updates' : 'Create Account')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UserModal;
