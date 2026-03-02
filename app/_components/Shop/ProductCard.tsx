"use client";

import { motion } from "framer-motion";
import { Search, Star, ShoppingBag, ImageIcon } from "lucide-react";
import Link from "next/link";
import { Product } from "@/lib/types";

interface ProductCardProps {
    product: Product;
    addToCart: (productId: string) => void;
    handleBuyNow: (productId: string) => void;
}

const ProductCard = ({ product, addToCart, handleBuyNow }: ProductCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className={`group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden ${Number(product.stock) <= 0 ? 'opacity-75 grayscale' : ''}`}
        >
            {/* Image Container */}
            <div className="relative h-32 sm:h-40 xl:h-48 overflow-hidden bg-slate-100 dark:bg-slate-800 p-3">
                {Number(product.stock) <= 0 && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                        <span className="bg-red-600 text-white px-3 py-1.5 rounded-lg font-black text-xs tracking-tighter shadow-lg rotate-[-10deg] border-2 border-white/20 uppercase">
                            Sold Out
                        </span>
                    </div>
                )}
                {product.image ? (
                    <img
                        src={product.image.startsWith('http') || product.image.startsWith('/') ? product.image : `/${product.image}`}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                        <ImageIcon className="size-10" />
                    </div>
                )}

                {/* Price Badge */}
                <div className="absolute top-1.5 right-1.5 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-2 py-0.5 rounded-full shadow-lg border border-slate-100 dark:border-slate-800 z-10">
                    <span className="text-teal-600 font-bold text-[10px] sm:text-xs">₹{product.price}</span>
                </div>

                {/* Sales Badges */}
                <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10">
                    {Number(product.lastMonthSales) > 50 && (
                        <div className="bg-teal-600 text-white px-1.5 py-0.5 rounded-full text-[8px] font-black shadow-lg flex items-center gap-0.5 border border-teal-400/30 uppercase tracking-tighter">
                            <Star className="size-2 fill-current" />
                            POPS
                        </div>
                    )}
                </div>

                {/* Overlay Actions (Desktop) */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <Link
                        href={`/product/${product._id}`}
                        className="size-10 bg-white text-slate-700 rounded-full flex items-center justify-center shadow-xl hover:bg-teal-50 hover:text-teal-600 hover:scale-110 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                        title="View Details"
                    >
                        <Search className="size-5" />
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <div className="mb-0.5">
                    <Link href={`/product/${product._id}`} className="block group-hover:text-teal-600 transition-colors">
                        <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm md:text-base line-clamp-1" title={product.name}>
                            {product.name}
                        </h3>
                    </Link>
                </div>

                <div className="flex items-center gap-1 mb-1.5">
                    <div className="flex items-center text-amber-400">
                        <Star className="size-3 fill-current" />
                        <span className="ml-1 text-[10px] font-bold text-slate-700 dark:text-slate-300">{product.rating || 0}</span>
                    </div>
                    <span className="text-[8px] text-slate-400 dark:text-slate-500 font-medium">• ({product.numReviews || 0})</span>
                </div>

                <div className="flex flex-col gap-1.5 mt-auto">
                    <button
                        disabled={Number(product.stock) <= 0}
                        onClick={() => addToCart(product._id)}
                        className="w-full py-1.5 px-2 rounded-lg font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                        Add
                    </button>
                    <button
                        disabled={Number(product.stock) <= 0}
                        onClick={() => handleBuyNow(product._id)}
                        className="w-full py-1.5 px-2 rounded-lg font-bold text-[10px] bg-teal-600 text-white shadow-md hover:bg-teal-700 transition-all flex items-center justify-center disabled:opacity-50"
                    >
                        Buy Now
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
