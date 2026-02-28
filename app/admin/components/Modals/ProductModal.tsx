"use client";

import React from "react";
import { X, Tag, DollarSign, Image as ImageIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product, Category, Tax, Blog } from "@/lib/types";

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    editingProduct: Product | null;
    currentProduct: any;
    setCurrentProduct: React.Dispatch<React.SetStateAction<any>>;
    categories: Category[];
    isSubmitting: boolean;
}

const ProductModal = ({
    isOpen,
    onClose,
    onSubmit,
    editingProduct,
    currentProduct,
    setCurrentProduct,
    categories,
    isSubmitting
}: ProductModalProps) => {
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
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingProduct ? "Edit Product" : "Add New Product"}
                            </h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X className="size-6" />
                            </button>
                        </div>
                        <form onSubmit={onSubmit} className="flex flex-col max-h-[90vh]">
                            <div className="p-6 space-y-4 overflow-y-auto">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                        <input
                                            required
                                            type="text"
                                            value={currentProduct.name || ""}
                                            onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
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
                                                value={currentProduct.price || ""}
                                                onChange={(e) => setCurrentProduct({ ...currentProduct, price: e.target.value })}
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
                                            value={currentProduct.stock || ""}
                                            onChange={(e) => setCurrentProduct({ ...currentProduct, stock: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                            placeholder="100"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Brand</label>
                                        <input
                                            type="text"
                                            value={currentProduct.brand || ""}
                                            onChange={(e) => setCurrentProduct({ ...currentProduct, brand: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                            placeholder="e.g. Bosch"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Model Name</label>
                                        <input
                                            type="text"
                                            value={currentProduct.modelName || ""}
                                            onChange={(e) => setCurrentProduct({ ...currentProduct, modelName: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                            placeholder="e.g. GSB 600"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rating</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="5"
                                            value={currentProduct.rating || ""}
                                            onChange={(e) => setCurrentProduct({ ...currentProduct, rating: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                            placeholder="4.5"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Month Sales</label>
                                        <input
                                            type="number"
                                            value={currentProduct.lastMonthSales || ""}
                                            onChange={(e) => setCurrentProduct({ ...currentProduct, lastMonthSales: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                            placeholder="50"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-2 ml-1">
                                    <input
                                        type="checkbox"
                                        id="showOnHome"
                                        checked={currentProduct.showOnHome || false}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, showOnHome: e.target.checked })}
                                        className="size-4 text-teal-600 rounded focus:ring-teal-500 border-gray-300"
                                    />
                                    <label htmlFor="showOnHome" className="text-sm font-medium text-slate-700 dark:text-slate-300">Show on Home Page</label>
                                </div>

                                {/* Tax Management */}
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <DollarSign className="size-4 text-teal-500" /> Tax Management
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentProduct({ ...currentProduct, taxes: [...(currentProduct.taxes || []), { name: "", rate: 0 }] })}
                                            className="text-xs px-2 py-1 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 rounded hover:bg-teal-200 transition-colors"
                                        >
                                            + Add Tax
                                        </button>
                                    </div>
                                    {(currentProduct.taxes || []).map((tax: Tax, idx: number) => (
                                        <div key={idx} className="flex gap-2 items-end">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={tax.name}
                                                    onChange={(e) => {
                                                        const updatedTaxes = [...(currentProduct.taxes || [])];
                                                        updatedTaxes[idx].name = e.target.value;
                                                        setCurrentProduct({ ...currentProduct, taxes: updatedTaxes });
                                                    }}
                                                    placeholder="Tax Name"
                                                    className="w-full px-3 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                                                />
                                            </div>
                                            <div className="w-24">
                                                <input
                                                    type="number"
                                                    value={tax.rate}
                                                    onChange={(e) => {
                                                        const updatedTaxes = [...(currentProduct.taxes || [])];
                                                        updatedTaxes[idx].rate = Number(e.target.value);
                                                        setCurrentProduct({ ...currentProduct, taxes: updatedTaxes });
                                                    }}
                                                    placeholder="Rate %"
                                                    className="w-full px-3 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updatedTaxes = (currentProduct.taxes || []).filter((_: Tax, i: number) => i !== idx);
                                                    setCurrentProduct({ ...currentProduct, taxes: updatedTaxes });
                                                }}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded"
                                            >
                                                <X className="size-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                    <select
                                        required
                                        value={typeof currentProduct.category === 'string' ? currentProduct.category : currentProduct.category?._id || ""}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URLs (comma separated)</label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-3 top-3 text-slate-400 size-4" />
                                        <textarea
                                            value={(currentProduct as any).imagesInput !== undefined ? (currentProduct as any).imagesInput : (currentProduct.images?.join(', ') || '')}
                                            onChange={(e) => setCurrentProduct({ ...currentProduct, ['imagesInput']: e.target.value } as any)}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none h-24 resize-none"
                                            placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                    <textarea
                                        value={currentProduct.description || ""}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
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
                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin size-5" /> : (editingProduct ? 'Update Product' : 'Create Product')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProductModal;
