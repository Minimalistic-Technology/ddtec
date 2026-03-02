"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingCart, Eye } from "lucide-react";
import { useComponentSettings } from "@/app/_context/ComponentSettingsContext";
import { useAuth } from "@/app/_context/AuthContext";

interface Product {
    _id: string;
    name: string;
    price: number;
    image: string;
    category: { name: string } | string;
    discountValue: number;
    discountType: 'percentage' | 'fixed';
    stock: number;
}

export default function FeaturedProducts() {
    const { settings } = useComponentSettings();
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerSlide, setItemsPerSlide] = useState(4);

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                const res = await api.get('/products?showOnHome=true');
                setProducts(res.data);
            } catch (error) {
                console.error("Failed to fetch featured products", error);
            }
        };

        fetchFeaturedProducts();

        const handleResize = () => {
            if (window.innerWidth < 640) setItemsPerSlide(3);
            else if (window.innerWidth < 1024) setItemsPerSlide(4);
            else setItemsPerSlide(5);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + itemsPerSlide >= products.length ? 0 : prev + itemsPerSlide));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - itemsPerSlide < 0 ? Math.max(0, products.length - itemsPerSlide) : prev - itemsPerSlide));
    };

    const isSuperAdmin = user?.role === 'super_admin';
    if (!settings.FeaturedProducts && !isSuperAdmin) return null;
    if (products.length === 0) return null;

    const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerSlide);

    // If we reach the end and have fewer products than itemsPerSlide, wrap around logic needs to be handled carefully
    // For simplicity, let's just show what remains or wrap around if we want strictly 4.
    // The slice approach above works but detailing 'nextSlide' logic to be circular is better.

    return (
        <section className="py-20 md:py-32 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
            {/* Seamless Section Bridge */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white/30 to-transparent dark:from-slate-900/10 z-[2]" />

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-teal-500/5 dark:bg-teal-500/3 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-500/3 rounded-full blur-[120px]" />
            </div>

            <div className="w-full px-4 md:px-10 lg:px-16 relative z-10">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-4xl font-bold text-slate-900 dark:text-white mb-4"
                        >
                            Featured <span className="text-teal-600">Products</span>
                        </motion.h2>
                        <div className="h-1 w-20 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full" />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={prevSlide}
                            className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600 transition-colors"
                        >
                            <ChevronLeft className="size-6" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600 transition-colors"
                        >
                            <ChevronRight className="size-6" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4 lg:gap-6">
                    <AnimatePresence mode="popLayout">
                        {visibleProducts.map((product) => (
                            <motion.div
                                key={product._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className={`group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-teal-500/30 dark:hover:border-teal-500/30 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 ${Number(product.stock) <= 0 ? 'opacity-75 grayscale' : ''}`}
                            >
                                <Link href={`/product/${product._id}`} className="block h-full">
                                    <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                        {Number(product.stock) <= 0 && (
                                            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                                                <span className="bg-red-600 text-white px-2 py-1 rounded-lg font-black text-[10px] tracking-tighter shadow-lg rotate-[-10deg] border border-white/20 uppercase">
                                                    Sold Out
                                                </span>
                                            </div>
                                        )}
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-contain p-4 transform group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <div className="size-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                            </div>
                                        )}

                                        {product.discountValue > 0 && (
                                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-lg z-10 uppercase tracking-tighter">
                                                -{product.discountType === 'percentage' ? `${product.discountValue}%` : `₹${product.discountValue}`}
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 transform translate-y-4 group-hover:translate-y-0">
                                            <span className="p-3 bg-white text-slate-900 rounded-xl hover:bg-teal-500 hover:text-white transition-all duration-300 shadow-lg">
                                                <Eye className="size-5" />
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-3">
                                        <div className="text-[10px] font-bold text-teal-600 dark:text-teal-400 mb-1 uppercase tracking-wider">
                                            {typeof product.category === 'object' ? product.category.name : 'Product'}
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-1 text-xs sm:text-sm line-clamp-1 group-hover:text-teal-600 transition-colors">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                ₹{product.price}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
