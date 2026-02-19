"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingCart, Eye } from "lucide-react";

interface Product {
    _id: string;
    name: string;
    price: number;
    image: string;
    category: { name: string } | string;
    discountValue: number;
    discountType: 'percentage' | 'fixed';
}

export default function FeaturedProducts() {
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
            if (window.innerWidth < 640) setItemsPerSlide(1);
            else if (window.innerWidth < 1024) setItemsPerSlide(2);
            else setItemsPerSlide(4);
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

    if (products.length === 0) return null;

    const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerSlide);

    // If we reach the end and have fewer products than itemsPerSlide, wrap around logic needs to be handled carefully
    // For simplicity, let's just show what remains or wrap around if we want strictly 4.
    // The slice approach above works but detailing 'nextSlide' logic to be circular is better.

    return (
        <section className="py-12 md:py-24 bg-white dark:bg-slate-950 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {visibleProducts.map((product) => (
                            <motion.div
                                key={product._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-teal-500/30 dark:hover:border-teal-500/30 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300"
                            >
                                <Link href={`/product/${product._id}`} className="block h-full">
                                    <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
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
                                            <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg z-10">
                                                -{product.discountType === 'percentage' ? `${product.discountValue}%` : `₹${product.discountValue}`}
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 transform translate-y-4 group-hover:translate-y-0">
                                            <span className="p-3 bg-white text-slate-900 rounded-xl hover:bg-teal-500 hover:text-white transition-all duration-300 shadow-lg">
                                                <Eye className="size-5" />
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="text-xs font-bold text-teal-600 dark:text-teal-400 mb-2 uppercase tracking-wider">
                                            {typeof product.category === 'object' ? product.category.name : 'Product'}
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-teal-600 transition-colors">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-bold text-slate-900 dark:text-white">
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
