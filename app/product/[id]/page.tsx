"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "../../_context/AuthContext";
import { useCart } from "../../_context/CartContext";
import { Loader2, Star, ShoppingBag, Truck, ShieldCheck, ArrowLeft, Tag, Layers, TrendingUp } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    stock: number;
    rating: number;
    numReviews: number;
    lastMonthSales: number;
    brand?: string;
    modelName?: string;
    couponCode?: string;
    discountPercentage?: number;
}

export default function ProductDetailsPage() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, couponsRes] = await Promise.all([
                    api.get(`/products/${id}`),
                    api.get('/coupons')
                ]);

                setProduct(productRes.data);

                // Filter applicable coupons
                const activeCoupons = couponsRes.data.filter((c: any) =>
                    c.type === 'product' &&
                    c.isActive &&
                    c.applicableProducts &&
                    c.applicableProducts.some((ap: any) => ap._id === id || ap === id)
                );
                setCoupons(activeCoupons);

            } catch (error) {
                console.error("Failed to fetch product or coupons", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="animate-spin text-teal-600 size-10" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Product Not Found</h2>
                <Link href="/" className="text-teal-600 hover:underline">Back to Shop</Link>
            </div>
        );
    }

    return (
        <section className="min-h-screen pt-24 pb-12 px-6 bg-slate-50 dark:bg-slate-900">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <Link href="/shop" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 mb-8 transition-colors">
                    <ArrowLeft className="size-4" /> Back to Shop
                </Link>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Left: Image */}
                        <div className="bg-slate-100 dark:bg-slate-900/50 p-8 flex items-center justify-center min-h-[400px] lg:min-h-[600px] relative group">
                            {product.stock === 0 && (
                                <div className="absolute inset-0 bg-slate-900/10 dark:bg-slate-900/50 z-10 flex items-center justify-center">
                                    <span className="bg-red-600 text-white px-6 py-3 rounded-full font-bold text-xl tracking-wide transform rotate-[-12deg] shadow-2xl border-4 border-white/20 backdrop-blur-sm">
                                        SOLD OUT
                                    </span>
                                </div>
                            )}
                            <motion.img
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                src={product.image.startsWith('http') || product.image.startsWith('/') ? product.image : `/${product.image}`}
                                alt={product.name}
                                className={`w-full max-h-[500px] object-contain drop-shadow-2xl transition-all duration-500 ${product.stock === 0 ? 'grayscale opacity-75' : 'group-hover:scale-105'}`}
                            />
                        </div>

                        {/* Right: Info */}
                        <div className="p-8 lg:p-12 flex flex-col">
                            {/* Brand & Category */}
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs font-bold uppercase tracking-wider rounded-lg">
                                    {product.category}
                                </span>
                                {product.brand && (
                                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1">
                                        <Tag className="size-3" /> {product.brand}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                                {product.name}
                            </h1>

                            {/* Model */}
                            {product.modelName && (
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 font-medium flex items-center gap-2">
                                    <Layers className="size-4" /> Model: {product.modelName}
                                </p>
                            )}

                            {/* Rating & Sales */}
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`size-5 ${i < Math.floor(product.rating || 0) ? "fill-current" : "text-slate-300 dark:text-slate-600"}`} />
                                        ))}
                                    </div>
                                    <span className="text-slate-600 dark:text-slate-400 font-medium text-sm">
                                        ({product.numReviews || 0} reviews)
                                    </span>
                                </div>

                                {product.lastMonthSales > 0 && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-bold border border-amber-200 dark:border-amber-800">
                                        <TrendingUp className="size-4" />
                                        {product.lastMonthSales} sold last month
                                    </div>
                                )}

                                {product.lastMonthSales > 50 && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full text-sm font-bold border border-teal-200 dark:border-teal-800">
                                        <Star className="size-4 fill-current" />
                                        Bestseller
                                    </div>
                                )}
                            </div>

                            {/* Price */}
                            <div className="flex items-end gap-3 mb-8">
                                <span className="text-4xl font-bold text-teal-600 dark:text-teal-400">
                                    ₹{product.price.toLocaleString()}
                                </span>
                                {product.discountPercentage && product.discountPercentage > 0 && (
                                    <span className="text-lg text-slate-400 line-through mb-1">
                                        ₹{Math.round(product.price / (1 - product.discountPercentage / 100)).toLocaleString()}
                                    </span>
                                )}
                            </div>

                            {/* Coupon Section */}
                            {product.couponCode && product.discountPercentage && product.discountPercentage > 0 && (
                                <div className="mb-8 p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-2xl flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400">
                                            <Tag className="size-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Available Offer</p>
                                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                                Use <span className="font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{product.couponCode}</span> to save {product.discountPercentage}%
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(product.couponCode || "");
                                            alert("Coupon code copied!");
                                        }}
                                        className="px-4 py-2 bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 rounded-lg text-xs font-bold shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Copy Code
                                    </button>
                                </div>
                            )}

                            {/* Dynamic Coupons Section */}
                            {coupons.length > 0 && (
                                <div className="mb-8 space-y-3">
                                    {coupons.map((coupon: any) => (
                                        <div key={coupon._id} className="p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-2xl flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400">
                                                    <Tag className="size-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Available Offer</p>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                                        Use <span className="font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{coupon.code}</span> to save {coupon.discountType === 'fixed' ? '₹' : ''}{coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(coupon.code || "");
                                                    alert("Coupon code copied!");
                                                }}
                                                className="px-4 py-2 bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 rounded-lg text-xs font-bold shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                Copy Code
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Description */}
                            <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase mb-3">About Product</h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {product.description}
                                </p>
                            </div>

                            {/* Features / Assurance */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                                    <Truck className="size-6 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Fast Delivery</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Within 3-5 days</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800">
                                    <ShieldCheck className="size-6 text-green-600" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Quality Assured</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Verified Product</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => addToCart(product._id)}
                                    disabled={product.stock === 0}
                                    className="py-4 rounded-xl font-bold border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-teal-600 hover:text-teal-600 dark:hover:border-teal-500 dark:hover:text-teal-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ShoppingBag className="size-5" /> Add to Cart
                                </button>
                                <button
                                    onClick={() => {
                                        addToCart(product._id);
                                        // Ideally redirect to checkout, but cart is fine for now
                                        window.location.href = '/cart';
                                    }}
                                    disabled={product.stock === 0}
                                    className="py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
