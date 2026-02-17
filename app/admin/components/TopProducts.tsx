"use client";

import { Trophy, TrendingUp } from "lucide-react";

interface TopProductsProps {
    products: Array<{
        name: string;
        totalSold: number;
        revenue: number;
        image?: string;
    }>;
}

export default function TopProducts({ products }: TopProductsProps) {
    if (!products || products.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm h-full flex flex-col items-center justify-center text-slate-400">
                <Trophy className="size-8 mb-2 opacity-50" />
                <span className="text-sm">No sales data yet</span>
            </div>
        );
    }

    const maxSold = Math.max(...products.map(p => p.totalSold));

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Products</h3>
                <span className="text-xs text-slate-400">By Volume</span>
            </div>

            <div className="space-y-6">
                {products.map((product, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <div className="size-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-500 font-bold shrink-0">
                            #{index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate pr-2">{product.name}</h4>
                                <span className="text-xs font-bold text-slate-500">{product.totalSold} sold</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-indigo-500"
                                    style={{ width: `${(product.totalSold / maxSold) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
