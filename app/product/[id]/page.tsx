"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../_context/AuthContext";
import { useCart } from "../../_context/CartContext";
import { useToast } from "../../_context/ToastContext";
import { Loader2, Star, ShoppingBag, Truck, ShieldCheck, ArrowLeft, Tag, Layers, TrendingUp, X, Maximize2, MessageCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string | { _id: string; name: string };
    stock: number;
    rating: number;
    numReviews: number;
    lastMonthSales: number;
    brand?: string;
    modelName?: string;
    couponCode?: string;
    discountPercentage?: number;
    images?: string[];
    isActive: boolean;
}

export default function ProductDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const [product, setProduct] = useState<Product | null>(null);
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProductCouponActive, setIsProductCouponActive] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, couponsRes] = await Promise.all([
                    api.get(`/products/${id}`),
                    api.get('/coupons')
                ]);

                setProduct(productRes.data);
                if (productRes.data.images && productRes.data.images.length > 0) {
                    setSelectedImage(productRes.data.images[0]);
                } else {
                    setSelectedImage(productRes.data.image);
                }

                // Check if the product's assigned couponCode is active
                const allCoupons = couponsRes.data;
                const linkedCoupon = allCoupons.find((c: any) => c.code === productRes.data.couponCode);
                setIsProductCouponActive(linkedCoupon ? linkedCoupon.isActive : true);

                // Filter applicable coupons
                const activeCoupons = allCoupons.filter((c: any) => {
                    const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();
                    return (
                        c.type === 'product' &&
                        c.isActive &&
                        !isExpired &&
                        c.applicableProducts &&
                        c.applicableProducts.some((ap: any) => ap._id === id || ap === id)
                    );
                });
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

    if (!product || product.isActive === false) {
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
                        {/* Left: Image Gallery */}
                        <div className="p-4 lg:p-8 relative">
                            <div className="relative lg:sticky lg:top-24 flex flex-col lg:flex-row gap-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                                {/* Thumbnails */}
                                {(product.images && product.images.length > 0) ? (
                                    <div className="hidden lg:flex flex-col gap-4 w-20 overflow-y-auto max-h-[600px]">
                                        {product.images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedImage(img)}
                                                className={`border-2 rounded-lg overflow-hidden transition-all flex-shrink-0 ${selectedImage === img ? 'border-teal-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                            >
                                                <img
                                                    src={img.startsWith('http') || img.startsWith('/') ? img : `/${img}`}
                                                    alt={`${product.name} ${idx + 1}`}
                                                    className="w-full h-20 object-contain bg-white dark:bg-slate-800"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                ) : null}

                                {/* Main Image */}
                                <div className="flex-1 flex items-center justify-center relative min-h-[300px] lg:min-h-[400px]">
                                    {product.stock === 0 && (
                                        <div className="absolute inset-0 bg-slate-900/10 dark:bg-slate-900/50 z-10 flex items-center justify-center rounded-xl">
                                            <span className="bg-red-600 text-white px-6 py-3 rounded-full font-bold text-xl tracking-wide transform rotate-[-12deg] shadow-2xl border-4 border-white/20 backdrop-blur-sm">
                                                SOLD OUT
                                            </span>
                                        </div>
                                    )}
                                    <motion.div
                                        className="relative w-full h-full flex items-center justify-center cursor-zoom-in"
                                        onClick={() => setIsLightboxOpen(true)}
                                    >
                                        <motion.img
                                            key={selectedImage}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            src={selectedImage ? (selectedImage.startsWith('http') || selectedImage.startsWith('/') ? selectedImage : `/${selectedImage}`) : (product.image.startsWith('http') || product.image.startsWith('/') ? product.image : `/${product.image}`)}
                                            alt={product.name}
                                            className={`w-full max-h-[600px] object-contain drop-shadow-xl transition-all duration-500 rounded-xl ${product.stock === 0 ? 'grayscale opacity-75' : 'group-hover:scale-105'}`}
                                        />
                                        <div className="absolute top-4 right-4 bg-white/80 dark:bg-slate-800/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                            <Maximize2 className="size-5 text-slate-700 dark:text-white" />
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Mobile Thumbnails (Bottom) */}
                                {(product.images && product.images.length > 0) && (
                                    <div className="mt-4 flex lg:hidden justify-start gap-2 overflow-x-auto px-4 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                                        {product.images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedImage(img)}
                                                className={`border-2 rounded-lg overflow-hidden flex-shrink-0 w-16 h-16 transition-all bg-white dark:bg-slate-800 shadow-sm ${selectedImage === img ? 'border-teal-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                            >
                                                <img
                                                    src={img.startsWith('http') || img.startsWith('/') ? img : `/${img}`}
                                                    alt={`${product.name} ${idx + 1}`}
                                                    className="w-full h-full object-contain"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Info */}
                        <div className="p-8 lg:p-12 flex flex-col">
                            {/* Brand & Category */}
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs font-bold uppercase tracking-wider rounded-lg">
                                    {typeof product.category === 'object' ? product.category.name : product.category}
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

                            {/* Price & Coupon Count */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className="flex items-end gap-3">
                                    <span className="text-4xl font-bold text-teal-600 dark:text-teal-400">
                                        ₹{product.price.toLocaleString()}
                                    </span>
                                    {(product.discountPercentage || 0) > 0 && (
                                        <span className="text-lg text-slate-400 line-through mb-1">
                                            ₹{Math.round(product.price / (1 - product.discountPercentage / 100)).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                {coupons.length > 0 && (
                                    <button
                                        onClick={() => setIsCouponModalOpen(true)}
                                        className="px-3 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-xs font-bold rounded-full border border-teal-100 dark:border-teal-800 flex items-center gap-1.5 self-center hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors cursor-pointer"
                                    >
                                        <Tag className="size-3" />
                                        {coupons.length} {coupons.length === 1 ? 'coupon' : 'coupons'} available
                                    </button>
                                )}
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

                            <div className="mt-auto flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => addToCart(product._id)}
                                        disabled={product.stock === 0}
                                        className="py-4 rounded-xl font-bold border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-teal-600 hover:text-teal-600 dark:hover:border-teal-500 dark:hover:text-teal-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ShoppingBag className="size-5" /> Add to Cart
                                    </button>
                                    <button
                                        onClick={async () => {
                                            await addToCart(product._id);
                                            router.push('/cart');
                                        }}
                                        disabled={product.stock === 0}
                                        className="py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Buy Now
                                    </button>
                                </div>

                                <button
                                    onClick={() => {
                                        const text = `Check out this amazing product: ${product.name}\n\nPrice: ₹${product.price.toLocaleString()}\n\nView it here: ${window.location.href}`;
                                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                    }}
                                    className="w-full py-4 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#128C7E] hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                                >
                                    <MessageCircle className="size-5 group-hover:scale-110 transition-transform" /> Share on WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Description Section (Full Width Below) */}
                    <div className="p-8 lg:p-12 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">About Product</h3>
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                                {product.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>


            {/* Lightbox Modal */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
                        onClick={() => setIsLightboxOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 w-full max-w-6xl max-h-[90vh] rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-3 shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsLightboxOpen(false)}
                                className="absolute top-4 right-4 z-10 p-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                <X className="size-6 text-slate-900 dark:text-white" />
                            </button>

                            {/* Left: Main Image */}
                            <div className="lg:col-span-2 bg-black flex items-center justify-center p-4 relative h-[50vh] lg:h-auto">
                                <motion.img
                                    key={selectedImage}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    src={selectedImage ? (selectedImage.startsWith('http') || selectedImage.startsWith('/') ? selectedImage : `/${selectedImage}`) : (product.image.startsWith('http') || product.image.startsWith('/') ? product.image : `/${product.image}`)}
                                    alt={product.name}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>

                            {/* Right: Info & Thumbnails */}
                            <div className="p-6 lg:p-8 flex flex-col h-full overflow-y-auto">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">{product.name}</h2>
                                    {product.modelName && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Model: {product.modelName}</p>
                                    )}
                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
                                        {product.description}
                                    </p>
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase mb-4">Gallery</h3>
                                    <div className="grid grid-cols-4 gap-4">
                                        {product.images && product.images.length > 0 ? (
                                            product.images.map((img, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedImage(img)}
                                                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-teal-600 ring-2 ring-teal-600/20' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'}`}
                                                >
                                                    <img
                                                        src={img.startsWith('http') || img.startsWith('/') ? img : `/${img}`}
                                                        alt={`${product.name} ${idx}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            ))
                                        ) : (
                                            <button
                                                className={`aspect-square rounded-lg overflow-hidden border-2 border-teal-600 ring-2 ring-teal-600/20`}
                                            >
                                                <img
                                                    src={product.image.startsWith('http') || product.image.startsWith('/') ? product.image : `/${product.image}`}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* View Coupons Modal */}
            <AnimatePresence>
                {isCouponModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Available Coupons</h3>
                                <button onClick={() => setIsCouponModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                    <X className="size-6" />
                                </button>
                            </div>
                            <div className="p-6 max-h-[60vh] overflow-y-auto">
                                <div className="space-y-4">
                                    {coupons.map((coupon: any) => (
                                        <div key={coupon._id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="text-lg font-bold text-teal-600 dark:text-teal-400 block">{coupon.code}</span>
                                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                                        Discount: {coupon.discountType === 'fixed' ? '₹' : ''}{coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : ''} off
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(coupon.code || "");
                                                        showToast("Coupon code copied!", "success");
                                                    }}
                                                    className="px-3 py-1 bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 rounded-lg text-xs font-bold shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-slate-700 transition-colors"
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                            {coupon.description && (
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{coupon.description}</p>
                                            )}
                                            {coupon.minOrderValue > 0 && (
                                                <div className="text-xs text-slate-400 mt-2">
                                                    Min Order: ₹{coupon.minOrderValue}
                                                </div>
                                            )}
                                            {coupon.expiresAt && (
                                                <div className="text-xs text-slate-400 mt-1">
                                                    Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    onClick={() => setIsCouponModalOpen(false)}
                                    className="w-full px-4 py-2 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )
                }
            </AnimatePresence >
        </section >
    );
}
