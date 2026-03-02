"use client";

import React, { useState, useMemo } from "react";
import { Plus, Edit, Trash2, Tag, Ticket } from "lucide-react";
import ToggleSwitch from "../ToggleSwitch";
import ViewControls from "../ViewControls";
import { Product } from "@/lib/types";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";

interface ProductsViewProps {
    products: Product[];
    onAddProduct: () => void;
    onEditProduct: (product: Product) => void;
    onDeleteProduct: (id: string) => void;
    onToggleStatus: (id: string, currentStatus: boolean) => void;
    onViewCoupons: (productName: string, coupons: any[]) => void;
    canAdd?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    user?: any;
}

const ProductsView = ({
    products,
    onAddProduct,
    onEditProduct,
    onDeleteProduct,
    onToggleStatus,
    onViewCoupons,
    canAdd = false,
    canEdit = false,
    canDelete = false,
    user = null
}: ProductsViewProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    const sortOptions = [
        { value: "newest", label: "Newest Added" },
        { value: "oldest", label: "Oldest Added" },
        { value: "name-asc", label: "Name (A-Z)" },
        { value: "name-desc", label: "Name (Z-A)" },
        { value: "price-high", label: "Price (High to Low)" },
        { value: "price-low", label: "Price (Low to High)" },
        { value: "stock-low", label: "Low Stock First" },
    ];

    const processedProducts = useMemo(() => {
        let result = [...products];

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                (typeof p.category === 'object' && (p.category as any).name?.toLowerCase().includes(q)) ||
                (typeof p.category === 'string' && p.category.toLowerCase().includes(q))
            );
        }

        result.sort((a, b) => {
            if (sortBy === "newest") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            if (sortBy === "oldest") return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
            if (sortBy === "name-asc") return a.name.localeCompare(b.name);
            if (sortBy === "name-desc") return b.name.localeCompare(a.name);
            if (sortBy === "price-high") return Number(b.price) - Number(a.price);
            if (sortBy === "price-low") return Number(a.price) - Number(b.price);
            if (sortBy === "stock-low") return Number(a.stock) - Number(b.stock);
            return 0;
        });

        return result;
    }, [products, searchQuery, sortBy]);

    const handleExportCSV = () => {
        const data = processedProducts.map(p => ({
            Name: p.name,
            Category: typeof p.category === 'object' ? (p.category as any).name : p.category,
            Price: p.price,
            Stock: p.stock,
            Status: p.isActive ? "Active" : "Inactive",
            Coupon: p.couponCode || "None"
        }));
        exportToCSV(data, `Products_${new Date().toISOString().split('T')[0]}`);
    };

    const handleExportPDF = () => {
        const headers = ["Name", "Category", "Price", "Stock", "Status"];
        const data = processedProducts.map(p => ({
            name: p.name,
            category: typeof p.category === 'object' ? (p.category as any).name : p.category,
            price: `INR ${p.price}`,
            stock: p.stock,
            status: p.isActive ? "Active" : "Inactive"
        }));
        exportToPDF(data, headers, "Products_Report", "Product Inventory Report");
    };
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Manage Products</h2>
                {canAdd && (
                    <button
                        onClick={onAddProduct}
                        className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-95"
                    >
                        <Plus className="size-4" /> Add Product
                    </button>
                )}
            </div>

            <ViewControls
                title="Product List"
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                sortBy={sortBy}
                onSort={setSortBy}
                sortOptions={sortOptions}
                onExportCSV={handleExportCSV}
                onExportPDF={handleExportPDF}
                canExport={user?.role === 'super_admin'}
            />

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                        <tr>
                            <th className="p-4">Product</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Coupons</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4 text-center w-40">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {processedProducts.map(p => (
                            <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex-shrink-0">
                                            {p.image ? (
                                                <img src={p.image} alt={p.name} className="size-full object-cover" />
                                            ) : (
                                                <div className="size-full flex items-center justify-center text-slate-400">
                                                    <Tag className="size-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex flex-col gap-1">
                                            <h3 className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]" title={p.name}>
                                                {p.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${p.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'}`}>
                                                    {p.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                                {p.showOnHome && (
                                                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 uppercase tracking-tighter">
                                                        Home
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>
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
                                <td className="p-4 flex justify-center items-center gap-2">
                                    {canEdit && (
                                        <>
                                            <ToggleSwitch isOn={p.isActive} onToggle={() => onToggleStatus(p._id, p.isActive)} />
                                            <button
                                                onClick={() => onEditProduct(p)}
                                                className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all hover:scale-110"
                                                title="Edit Product"
                                            >
                                                <Edit className="size-4" />
                                            </button>
                                        </>
                                    )}
                                    {canDelete && (
                                        <button
                                            onClick={() => onDeleteProduct(p._id)}
                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all hover:scale-110"
                                            title="Delete Product"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    )}
                                    {!canEdit && !canDelete && (
                                        <span className="text-slate-400 italic text-sm">View Only</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductsView;
