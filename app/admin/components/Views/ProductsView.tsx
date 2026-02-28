"use client";

import React from "react";
import { Plus, Edit, Trash2, Tag, Ticket } from "lucide-react";
import ToggleSwitch from "../ToggleSwitch";
import { Product } from "@/lib/types";

interface ProductsViewProps {
    products: Product[];
    onAddProduct: () => void;
    onEditProduct: (product: Product) => void;
    onDeleteProduct: (id: string) => void;
    onToggleStatus: (id: string, currentStatus: boolean) => void;
    onViewCoupons: (productName: string, coupons: any[]) => void;
    canEdit?: boolean;
}

const ProductsView = ({
    products,
    onAddProduct,
    onEditProduct,
    onDeleteProduct,
    onToggleStatus,
    onViewCoupons,
    canEdit = false
}: ProductsViewProps) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Manage Products</h2>
                {canEdit && (
                    <button
                        onClick={onAddProduct}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors"
                    >
                        <Plus className="size-4" /> Add Product
                    </button>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                        <tr>
                            <th className="p-4">Product</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Coupons</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4">Home</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {products.map(p => (
                            <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                <td className="p-4 font-medium text-slate-900 dark:text-white">{p.name}</td>
                                <td className="p-4 text-slate-600 dark:text-slate-400">
                                    {(typeof p.category === 'object' && p.category !== null) ? (p.category as any).name : p.category}
                                </td>
                                <td className="p-4 text-slate-900 dark:text-white font-medium">₹{p.price}</td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-1">
                                        {p.couponCode && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 text-xs font-mono font-bold">
                                                <Tag className="size-3" /> {p.couponCode}
                                            </span>
                                        )}
                                        {(p as any).couponDetails && (p as any).couponDetails.length > 0 && (
                                            <button
                                                onClick={() => onViewCoupons(p.name, (p as any).couponDetails)}
                                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                            >
                                                <Ticket className="size-3" />
                                                {(p as any).couponDetails.length} Linked Coupon{(p as any).couponDetails.length !== 1 ? 's' : ''}
                                            </button>
                                        )}
                                        {!p.couponCode && (!(p as any).couponDetails || (p as any).couponDetails.length === 0) && (
                                            <span className="text-xs text-slate-400 italic">None</span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${Number(p.stock) > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {p.stock}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.showOnHome ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                                        {p.showOnHome ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {p.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                {canEdit ? (
                                    <td className="p-4 text-right flex justify-end items-center gap-2">
                                        <ToggleSwitch isOn={p.isActive} onToggle={() => onToggleStatus(p._id, p.isActive)} />
                                        <button
                                            onClick={() => onEditProduct(p)}
                                            className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                            title="Edit Product"
                                        >
                                            <Edit className="size-4" />
                                        </button>
                                        <button
                                            onClick={() => onDeleteProduct(p._id)}
                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                            title="Delete Product"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </td>
                                ) : (
                                    <td className="p-4 text-right text-slate-400 italic text-sm">View Only</td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductsView;
