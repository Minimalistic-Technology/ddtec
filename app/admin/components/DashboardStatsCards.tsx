"use client";

import { motion } from "framer-motion";
import { DollarSign, Package, ShoppingBag, AlertTriangle } from "lucide-react";

interface StatsProps {
    stats: {
        totalProducts: number;
        totalStock: number;
        lowStock: number;
        outOfStock: number;
    } | null;
}

export default function DashboardStatsCards({ stats }: StatsProps) {
    if (!stats) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
    </div>;

    const cards = [
        {
            title: "Total Products",
            value: stats.totalProducts,
            icon: <Package className="size-6 text-blue-600 dark:text-blue-400" />,
            bg: "bg-blue-50 dark:bg-blue-900/20",
            trend: "+6.5%",
            trendUp: true
        },
        {
            title: "Available Stock",
            value: stats.totalStock,
            icon: <ShoppingBag className="size-6 text-teal-600 dark:text-teal-400" />,
            bg: "bg-teal-50 dark:bg-teal-900/20",
            trend: "-2.4%",
            trendUp: false
        },
        {
            title: "Low Stock",
            value: stats.lowStock,
            icon: <AlertTriangle className="size-6 text-orange-600 dark:text-orange-400" />,
            bg: "bg-orange-50 dark:bg-orange-900/20",
            trend: "+1.5%",
            trendUp: true
        },
        {
            title: "Out of Stock",
            value: stats.outOfStock,
            icon: <AlertTriangle className="size-6 text-red-600 dark:text-red-400" />,
            bg: "bg-red-50 dark:bg-red-900/20",
            trend: "-0.5%",
            trendUp: false
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => (
                <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</h3>
                        <div className={`p-2 rounded-xl ${card.bg}`}>
                            {card.icon}
                        </div>
                    </div>
                    <div className="flex items-end gap-3">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{card.value}</h2>
                        <span className={`text-xs font-bold mb-1 ${card.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                            {card.trend} <span className="text-slate-400 font-normal ml-1">from last week</span>
                        </span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
