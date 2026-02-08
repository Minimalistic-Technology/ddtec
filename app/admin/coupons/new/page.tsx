"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../_context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Save, RefreshCw } from "lucide-react";
import api from "@/lib/api";

interface Product {
    _id: string;
    name: string;
}

const NewCouponPage = () => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const [formData, setFormData] = useState({
        code: "",
        description: "",
        discountType: "percentage",
        discountValue: "",
        type: "cart",
        minOrderValue: "",
        applicableProducts: [] as string[],
        usageLimit: "",
        expiresAt: ""
    });

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== "admin") {
                router.push("/");
            } else {
                fetchProducts();
            }
        }
    }, [user, authLoading, router]);

    const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoadingProducts(false);
        }
    };

    const generateCode = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 10; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        setFormData({ ...formData, code: result });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                discountValue: Number(formData.discountValue),
                minOrderValue: Number(formData.minOrderValue) || 0,
                usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
                expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : null
            };

            await api.post('/coupons', payload);
            alert("Coupon created successfully!");
            router.push('/admin/coupons');
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to create coupon");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleProduct = (productId: string) => {
        setFormData(prev => {
            const current = prev.applicableProducts;
            if (current.includes(productId)) {
                return { ...prev, applicableProducts: current.filter(id => id !== productId) };
            } else {
                return { ...prev, applicableProducts: [...current, productId] };
            }
        });
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="animate-spin text-teal-600 size-10" />
            </div>
        );
    }

    return (
        <section className="min-h-screen pt-24 px-6 md:px-12 bg-slate-50 dark:bg-slate-900 pb-12">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-2 transition-colors"
                    >
                        <ArrowLeft className="size-4" /> Back to Coupons
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create New Coupon</h1>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Code & Generation */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Coupon Code</label>
                            <div className="flex gap-2">
                                <input
                                    required
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none font-mono tracking-wider"
                                    placeholder="e.g. SUMMER2024"
                                    maxLength={10}
                                />
                                <button
                                    type="button"
                                    onClick={generateCode}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
                                >
                                    <RefreshCw className="size-4" /> Generate
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">10-character alphanumeric code.</p>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none resize-none h-20"
                                placeholder="Internal note or description..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Coupon Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                >
                                    <option value="cart">Cart Wide</option>
                                    <option value="product">Product Specific</option>
                                    <option value="shipping">Free Shipping</option>
                                </select>
                            </div>

                            {/* Discount Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Discount Type</label>
                                <select
                                    disabled={formData.type === 'shipping'}
                                    value={formData.discountType}
                                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-50"
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (₹)</option>
                                </select>
                            </div>
                        </div>

                        {/* Value & Min Order */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Discount Value</label>
                                <input
                                    disabled={formData.type === 'shipping'}
                                    required={formData.type !== 'shipping'}
                                    type="number"
                                    min="0"
                                    value={formData.discountValue}
                                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-50"
                                    placeholder={formData.discountType === 'percentage' ? "10" : "100"}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Min Order Value</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.minOrderValue}
                                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {/* Product Selection (Conditional) */}
                        {formData.type === 'product' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Applicable Products</label>
                                <div className="border border-slate-200 dark:border-slate-600 rounded-lg max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900">
                                    {loadingProducts ? (
                                        <div className="text-center p-4">Loading products...</div>
                                    ) : (
                                        products.map(product => (
                                            <div key={product._id} className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer" onClick={() => toggleProduct(product._id)}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.applicableProducts.includes(product._id)}
                                                    onChange={() => { }}
                                                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                />
                                                <span className="text-sm text-slate-700 dark:text-slate-300">{product.name}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Select products this coupon applies to.</p>
                            </div>
                        )}

                        {/* Limits */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Usage Limit</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.usageLimit}
                                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                    placeholder="Unlimited"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Expiry Date</label>
                                <input
                                    type="datetime-local"
                                    value={formData.expiresAt}
                                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin size-5" /> : (
                                    <>
                                        <Save className="size-5" /> Create Coupon
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default NewCouponPage;
