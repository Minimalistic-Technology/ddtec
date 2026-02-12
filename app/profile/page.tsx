"use client";

import { useAuth } from "../_context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Smartphone, Shield, Calendar, Edit2, Loader2, MapPin, Key, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Change Password State
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters");
            return;
        }

        setIsSubmitting(true);
        try {
            await api.put('/auth/change-password', { currentPassword, newPassword });
            setPasswordSuccess("Password updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => {
                setIsChangingPassword(false);
                setPasswordSuccess("");
            }, 2000);
        } catch (error: any) {
            setPasswordError(error.response?.data?.msg || "Failed to change password");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="size-8 text-teal-600 animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <section className="min-h-screen pt-24 pb-12 px-6 bg-slate-50 dark:bg-slate-950">
            <div className="container mx-auto max-w-4xl">
                {/* Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 flex flex-col md:flex-row items-center gap-8 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800"
                >
                    <div className="size-32 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-teal-500/20 relative group">
                        {user.firstName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                        <button className="absolute bottom-0 right-0 size-10 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-teal-600 transition-colors">
                            <Edit2 className="size-4" />
                        </button>
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
                            {user.firstName} {user.lastName}
                        </h1>
                        <p className="text-slate-500 flex items-center justify-center md:justify-start gap-2">
                            <Mail className="size-4" /> {user.email}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                            <span className="px-4 py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-xs font-bold rounded-full border border-teal-100 dark:border-teal-800">
                                {user.role?.toUpperCase()}
                            </span>
                            {user.address && (
                                <span className="px-4 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-full border border-slate-100 dark:border-slate-700 flex items-center gap-1">
                                    <MapPin className="size-3" /> {user.address.split(',')[0]}
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Personal Information Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-lg border border-slate-100 dark:border-slate-800 h-full"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="size-10 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-center text-teal-600">
                                <User className="size-5" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Personal Info</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                                <p className="text-slate-700 dark:text-slate-200 font-semibold">{user.firstName} {user.lastName}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                                    <Mail className="size-4 text-slate-400" /> {user.email}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                                    <Smartphone className="size-4 text-slate-400" /> {user.phone || "Not linked"}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Member Since</p>
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                                    <Calendar className="size-4 text-slate-400" />
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : "2024"}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Security Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-lg border border-slate-100 dark:border-slate-800 flex flex-col h-full"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="size-10 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-center text-teal-600">
                                <Shield className="size-5" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Security</h3>
                        </div>

                        {!isChangingPassword ? (
                            <div className="flex-1 flex flex-col justify-center text-center py-6">
                                <div className="size-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                    <Key className="size-8" />
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Password Management</h4>
                                <p className="text-sm text-slate-500 mb-6">Keep your account safe by updating your password regularly.</p>
                                <button
                                    onClick={() => setIsChangingPassword(true)}
                                    className="w-full py-3 px-6 bg-slate-900 dark:bg-teal-600 text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-teal-700 transition-all shadow-lg"
                                >
                                    Change Password
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                        placeholder="Min. 6 characters"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <AnimatePresence mode="wait">
                                    {passwordError && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 text-xs text-red-500 font-bold bg-red-50 dark:bg-red-900/10 p-2 rounded-lg">
                                            <AlertCircle className="size-3" /> {passwordError}
                                        </motion.div>
                                    )}
                                    {passwordSuccess && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 text-xs text-green-500 font-bold bg-green-50 dark:bg-green-900/10 p-2 rounded-lg">
                                            <CheckCircle2 className="size-3" /> {passwordSuccess}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsChangingPassword(false)}
                                        className="flex-1 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </div>

                {/* Footer Actions */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 text-center"
                >
                    <button className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors">
                        Delete Account Permanently
                    </button>
                    <p className="text-[10px] text-slate-400 mt-2">
                        Account ID: {user.id}
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
