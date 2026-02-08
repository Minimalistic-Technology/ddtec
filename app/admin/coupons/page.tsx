"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../_context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Plus, Tag, ArrowLeft, Edit } from "lucide-react";
import api from "@/lib/api";

interface Coupon {
    _id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    type: 'product' | 'cart' | 'shipping';
    minOrderValue: number;
    usageLimit: number | null;
    usedCount: number;
    isActive: boolean;
    expiresAt?: string;
    applicableProducts?: { _id: string, name: string }[];
}

const CouponsPage = () => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== "admin") {
                router.push("/");
            } else {
                fetchCoupons();
            }
        }
    }, [user, authLoading, router]);

    const fetchCoupons = async () => {
        try {
            const res = await api.get('/coupons');
            setCoupons(res.data);
        } catch (error) {
            console.error("Failed to fetch coupons", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        try {
            await api.delete(`/coupons/${id}`);
            setCoupons(coupons.filter(c => c._id !== id));
        } catch (error) {
            console.error("Failed to delete coupon", error);
            alert("Failed to delete coupon");
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="animate-spin text-teal-600 size-10" />
            </div>
        );
    }

    return (
        <section className="min-h-screen pt-24 px-6 md:px-12 bg-slate-50 dark:bg-slate-900">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <button
                            onClick={() => router.push('/admin')}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-2 transition-colors"
                        >
                            <ArrowLeft className="size-4" /> Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <Tag className="size-8 text-teal-600" />
                            Manage Coupons
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Create and manage discount codes for your store.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/admin/coupons/new')}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/20"
                    >
                        <Plus className="size-4" /> Create Coupon
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Coupons</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                                <tr>
                                    <th className="p-4">Code</th>
                                    <th className="p-4">Products</th>
                                    <th className="p-4">Discount</th>
                                    <th className="p-4">Min Spend</th>
                                    <th className="p-4">Usage</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {coupons.length > 0 ? (
                                    coupons.map(coupon => (
                                        <tr key={coupon._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-1 rounded w-fit">
                                                        {coupon.code}
                                                    </span>
                                                    <span className="text-xs text-slate-500 mt-1 capitalize">{coupon.type}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 max-w-xs">
                                                {coupon.type === 'product' && coupon.applicableProducts && coupon.applicableProducts.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {coupon.applicableProducts.map(p => (
                                                            <span key={p._id} className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                                                                {p.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-slate-900 dark:text-white font-medium">
                                                {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                                            </td>
                                            <td className="p-4 text-slate-600 dark:text-slate-400">
                                                {coupon.minOrderValue > 0 ? `₹${coupon.minOrderValue}` : '-'}
                                            </td>
                                            <td className="p-4 text-slate-600 dark:text-slate-400">
                                                {coupon.usedCount} / {coupon.usageLimit === null ? '∞' : coupon.usageLimit}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {coupon.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                <button
                                                    onClick={() => router.push(`/admin/coupons/${coupon._id}`)}
                                                    className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                                    title="Edit Coupon"
                                                >
                                                    <Edit className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(coupon._id)}
                                                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                    title="Delete Coupon"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">
                                            No coupons found. Create one to get started!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CouponsPage;
