"use client";

import React, { useState, useMemo } from "react";
import { Package, AlertTriangle, ArrowRight, PlusCircle, MinusCircle } from "lucide-react";
import ToggleSwitch from "../ToggleSwitch";
import ViewControls from "../ViewControls";
import { Product } from "@/lib/types";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";

interface InventoryViewProps {
    products: Product[];
    stockStats: {
        totalStock: number;
        lowStock: number;
        outOfStock: number;
    } | undefined;
    restockItems: any[] | undefined;
    onAdjustStock: (id: string, amount: number) => void;
    onToggleStatus: (id: string, currentStatus: boolean) => void;
    canEdit?: boolean;
    user?: any;
}

const InventoryView = ({
    products,
    stockStats,
    restockItems,
    onAdjustStock,
    onToggleStatus,
    canEdit = false,
    user = null
}: InventoryViewProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("stock-low");

    const sortOptions = [
        { value: "stock-low", label: "Stock (Low to High)" },
        { value: "stock-high", label: "Stock (High to Low)" },
        { value: "name-asc", label: "Name (A-Z)" },
        { value: "sales-high", label: "Monthly Sales (High)" },
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
            if (sortBy === "stock-low") return Number(a.stock) - Number(b.stock);
            if (sortBy === "stock-high") return Number(b.stock) - Number(a.stock);
            if (sortBy === "name-asc") return a.name.localeCompare(b.name);
            if (sortBy === "sales-high") return (b.lastMonthSales || 0) - (a.lastMonthSales || 0);
            return 0;
        });

        return result;
    }, [products, searchQuery, sortBy]);

    const handleExportCSV = () => {
        const data = processedProducts.map(p => ({
            Name: p.name,
            Category: typeof p.category === 'object' ? (p.category as any).name : p.category,
            CurrentStock: p.stock,
            Status: p.isActive ? "Active" : "Inactive",
            MonthlySales: p.lastMonthSales || 0
        }));
        exportToCSV(data, `Inventory_${new Date().toISOString().split('T')[0]}`);
    };

    const handleExportPDF = () => {
        const headers = ["Product Name", "Category", "Stock Level", "Status", "Last Month Sales"];
        const data = processedProducts.map(p => ({
            name: p.name,
            category: typeof p.category === 'object' ? (p.category as any).name : p.category,
            stock: `${p.stock} units`,
            status: p.isActive ? "Active" : "Inactive",
            sales: `${p.lastMonthSales || 0} units`
        }));
        exportToPDF(data, headers, "Inventory_Stock_Report", "Inventory Stock Management Report");
    };
    return (
        <div className="space-y-6">
            {/* Inventory Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3 bg-white dark:bg-slate-800">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Inventory Stock Status</h2>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold border border-red-100 dark:border-red-900/30">
                            <AlertTriangle className="size-4" /> {stockStats?.outOfStock || 0} Out of Stock
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg text-xs font-bold border border-orange-100 dark:border-orange-900/30">
                            <Package className="size-4" /> {stockStats?.lowStock || 0} Low Stock
                        </div>
                    </div>
                </div>

                <ViewControls
                    title="Stock Inventory"
                    searchQuery={searchQuery}
                    onSearch={setSearchQuery}
                    sortBy={sortBy}
                    onSort={setSortBy}
                    sortOptions={sortOptions}
                    onExportCSV={handleExportCSV}
                    onExportPDF={handleExportPDF}
                    canExport={user?.role === 'super_admin'}
                />

                {/* Mobile Card List */}
                <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700">
                    {processedProducts.map(p => {
                        const stock = Number(p.stock);
                        const isOut = stock === 0;
                        const isLow = stock > 0 && stock <= 10;
                        return (
                            <div key={p._id} className="p-4 flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                                        {p.images?.[0] || p.image ? <img src={p.images?.[0] || p.image} alt={p.name} className="size-full object-cover" /> : <Package className="size-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{p.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isOut ? 'bg-red-50 text-red-700 border-red-100' : isLow ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-green-50 text-green-700 border-green-100'}`}>{stock} units</span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${p.isActive ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-700'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                                        </div>
                                    </div>
                                </div>
                                {canEdit && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <input type="number" defaultValue={1} id={`adj-mob-${p._id}`} className="w-12 bg-transparent text-center text-xs font-bold outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                            <button onClick={() => { const i = document.getElementById(`adj-mob-${p._id}`) as HTMLInputElement; onAdjustStock(p._id, -(Number(i?.value) || 1)); }} className="bg-white dark:bg-slate-800 text-red-500 hover:bg-red-50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all shadow-sm" title="Remove Stock"><MinusCircle className="size-4" /></button>
                                            <button onClick={() => { const i = document.getElementById(`adj-mob-${p._id}`) as HTMLInputElement; onAdjustStock(p._id, Number(i?.value) || 1); }} className="bg-teal-600 text-white hover:bg-teal-700 p-1.5 rounded-xl transition-all shadow-lg shadow-teal-500/20" title="Add Stock"><PlusCircle className="size-4" /></button>
                                        </div>
                                        <ToggleSwitch isOn={p.isActive} onToggle={() => onToggleStatus(p._id, p.isActive)} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase font-bold tracking-wider">
                            <tr>
                                <th className="p-4">Product Name</th>
                                <th className="p-4">Category</th>
                                <th className="p-4 text-center">Current Stock</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Last Month Sales</th>
                                <th className="p-4 text-right">Adjust Stock / Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {processedProducts.map(p => {
                                const stock = Number(p.stock);
                                const isOut = stock === 0;
                                const isLow = stock > 0 && stock <= 10;
                                return (
                                    <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                                                    {p.images?.[0] || p.image ? <img src={p.images?.[0] || p.image} alt={p.name} className="size-full object-cover" /> : <Package className="size-5" />}
                                                </div>
                                                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]" title={p.name}>{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400">
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md text-xs font-medium">{typeof p.category === 'object' && p.category !== null ? (p.category as any).name : p.category}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isOut ? 'bg-red-50 text-red-700 border-red-100' : isLow ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-green-50 text-green-700 border-green-100'}`}>{stock} units</span>
                                                {stock < 0 && <span className="text-[9px] text-red-600 font-black uppercase">Negative Stock</span>}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.isActive ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400 text-sm italic">{p.lastMonthSales || 0} units</td>
                                        <td className="p-4 text-right">
                                            {canEdit ? (
                                                <div className="flex justify-end items-center gap-3">
                                                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                                                        <input type="number" defaultValue={1} id={`adj-${p._id}`} className="w-12 bg-transparent text-center text-xs font-bold outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                                        <div className="flex gap-1">
                                                            <button onClick={() => { const input = document.getElementById(`adj-${p._id}`) as HTMLInputElement; onAdjustStock(p._id, -(Number(input?.value) || 1)); }} className="bg-white dark:bg-slate-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all shadow-sm hover:scale-110 active:scale-90" title="Remove Stock"><MinusCircle className="size-4" /></button>
                                                            <button onClick={() => { const input = document.getElementById(`adj-${p._id}`) as HTMLInputElement; onAdjustStock(p._id, Number(input?.value) || 1); }} className="bg-teal-600 text-white hover:bg-teal-700 p-1.5 rounded-xl transition-all shadow-lg shadow-teal-500/20 hover:scale-110 active:scale-90" title="Add Stock"><PlusCircle className="size-4" /></button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 pl-3 border-l border-slate-100 dark:border-slate-700">
                                                        <ToggleSwitch isOn={p.isActive} onToggle={() => onToggleStatus(p._id, p.isActive)} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic text-sm">View Only</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InventoryView;
