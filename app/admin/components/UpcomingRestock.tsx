"use client";

import { Package } from "lucide-react";

interface UpcomingRestockProps {
    products: Array<{
        name: string;
        stock: number;
    }>;
}

export default function UpcomingRestock({ products }: UpcomingRestockProps) {
    if (!products || products.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm h-full flex items-center justify-center">
                <span className="text-slate-400 text-sm">No items need restocking</span>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Restock</h3>
            </div>

            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {products.map((product, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <div className="size-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                            <Package className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{product.name}</h4>
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">{product.stock} Pcs</div>
                        {product.stock === 0 ? (
                            <div className="text-xs text-red-500 font-bold w-24 text-right whitespace-nowrap">Out of Stock</div>
                        ) : (
                            <div className="text-xs text-orange-500 font-bold w-24 text-right whitespace-nowrap">Low Stock</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
