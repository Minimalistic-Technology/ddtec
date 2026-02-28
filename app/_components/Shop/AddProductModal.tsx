"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Tag, DollarSign, Star, Image as ImageIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { Category } from "@/lib/types";

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (productData: any) => Promise<void>;
}

const AddProductModal = ({ isOpen, onClose, onSubmit }: AddProductModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: "",
        price: "",
        description: "",
        image: "",
        category: "",
        stock: "",
        rating: "",
        lastMonthSales: "",
        brand: "",
        modelName: "",
        couponCode: "",
        discountPercentage: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(newProduct);
            setNewProduct({ name: "", price: "", description: "", image: "", category: "", stock: "", rating: "", lastMonthSales: "", brand: "", modelName: "", couponCode: "", discountPercentage: "" });
        } finally {
            setIsSubmitting(false);
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
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                    >
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add New Product</h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X className="size-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
                            <div className="p-6 space-y-4 overflow-y-auto">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                        <input
                                            required
                                            type="text"
                                            value={newProduct.name}
                                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                            placeholder="e.g. Cordless Drill"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price (₹)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                            <input
                                                required
                                                type="number"
                                                value={newProduct.price}
                                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stock</label>
                                        <input
                                            required
                                            type="number"
                                            value={newProduct.stock}
                                            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                            placeholder="100"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rating (0-5)</label>
                                        <div className="relative">
                                            <Star className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                            <input
                                                type="number"
                                                min="0"
                                                max="5"
                                                step="0.1"
                                                value={newProduct.rating}
                                                onChange={(e) => setNewProduct({ ...newProduct, rating: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                placeholder="4.5"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Month Sales</label>
                                        <input
                                            type="number"
                                            value={newProduct.lastMonthSales}
                                            onChange={(e) => setNewProduct({ ...newProduct, lastMonthSales: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                            placeholder="e.g. 120"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Coupon Code</label>
                                        <input
                                            type="text"
                                            value={newProduct.couponCode}
                                            onChange={(e) => setNewProduct({ ...newProduct, couponCode: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                            placeholder="e.g. SAVE10"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discount (%)</label>
                                        <input
                                            type="number"
                                            value={newProduct.discountPercentage}
                                            onChange={(e) => setNewProduct({ ...newProduct, discountPercentage: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                            placeholder="10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                    <select
                                        value={newProduct.category}
                                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                    >
                                        <option value="" disabled>Select Category</option>
                                        <option value="Drill Bits">Drill Bits</option>
                                        <option value="Wood Cutter">Wood Cutter</option>
                                        <option value="Grinding Tools">Grinding Tools</option>
                                        <option value="Fasteners">Fasteners</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                        <input
                                            type="text"
                                            value={newProduct.image}
                                            onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                    <textarea
                                        value={newProduct.description}
                                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none h-24 resize-none"
                                        placeholder="Product details..."
                                    />
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
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
                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AddProductModal;
