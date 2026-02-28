"use client";

import React from "react";
import DashboardStatsCards from "../DashboardStatsCards";
import ProfitChart from "../ProfitChart";
import OrderSummaryChart from "../OrderSummaryChart";
import StockLevel from "../StockLevel";
import UpcomingRestock from "../UpcomingRestock";
import TopProducts from "../TopProducts";
import RecentActivity from "../RecentActivity";
import { Shield } from "lucide-react";
import { DashboardStats, User } from "@/lib/types";

interface DashboardOverviewProps {
    stats: DashboardStats;
    user: User | null;
}

const DashboardOverview = ({
    stats,
    user
}: DashboardOverviewProps) => {
    // Map data for charts to ensure they have name and value keys
    const mapChartData = (data: any[]) => {
        return (data || []).map(item => ({
            name: item.name || item._id || "Unknown",
            value: Number(item.value || item.total || item.totalRevenue || 0)
        }));
    };

    const role = user?.role || 'user';
    const isFullAdmin = role === 'super_admin' || role === 'admin';
    const isProductManager = role === 'product_manager';
    const isOrderManager = role === 'order_manager';
    const isFinance = role === 'finance';
    const isMarketing = role === 'marketing';
    const isSupport = role === 'customer_support';

    const cardsStats = stats ? {
        totalProducts: stats.products || 0,
        totalStock: stats.stock?.totalStock || 0,
        lowStock: stats.stock?.lowStock || 0,
        outOfStock: stats.stock?.outOfStock || 0
    } : null;

    return (
        <div className="space-y-6">
            {/* Stats Cards: Products & Stock Focus */}
            {(isFullAdmin || isProductManager) && (
                <DashboardStatsCards stats={cardsStats} />
            )}

            {/* Low Stock Alert Banner */}
            {(isFullAdmin || isProductManager) && (stats?.stock?.lowStock || 0) > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-100 dark:bg-amber-800 p-2 rounded-xl">
                            <Shield className="size-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100">Low Stock Alerts</h4>
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                                {stats?.stock?.lowStock} products are below the safety threshold. Consider restocking soon.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Charts: Revenue & Trends */}
            {(isFullAdmin || isFinance || isOrderManager) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ProfitChart data={mapChartData(stats?.categoryRevenue || [])} />
                    <OrderSummaryChart
                        data={mapChartData(stats?.trends || [])}
                        totalRevenue={stats?.revenue || 0}
                    />
                </div>
            )}

            {/* Inventory Detail Grid */}
            {(isFullAdmin || isProductManager) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <StockLevel
                        stockStats={stats?.stock}
                        products={[
                            ...(stats?.stock?.outOfStockProducts || []).map(p => ({
                                name: p.name,
                                stock: Number(p.stock),
                                totalSold: Number((p as any).totalSold || 0),
                                image: (p as any).image
                            })),
                            ...(stats?.stock?.lowStockProducts || []).map(p => ({
                                name: p.name,
                                stock: Number(p.stock),
                                totalSold: Number((p as any).totalSold || 0),
                                image: (p as any).image
                            })),
                            ...((stats?.stock?.outOfStockProducts?.length === 0 && stats?.stock?.lowStockProducts?.length === 0)
                                ? (stats?.topProducts || []).map(p => ({
                                    name: p.name,
                                    stock: Number(p.stock),
                                    totalSold: Number(p.totalSold || p.lastMonthSales || 0),
                                    image: p.images?.[0] || p.image
                                })) : [])
                        ]}
                    />
                    <UpcomingRestock products={(stats?.restock || []).map(p => ({
                        name: p.name,
                        stock: Number(p.stock),
                        image: (stats?.topProducts || []).find(tp => tp.name === p.name)?.image ||
                            (stats?.topProducts || []).find(tp => tp.name === p.name)?.images?.[0]
                    }))} />
                </div>
            )}

            {/* Marketing & Staff Favorites */}
            {(isFullAdmin || isMarketing || isProductManager) && (
                <div className="grid grid-cols-1 gap-6">
                    <TopProducts products={stats?.topProducts || []} />
                </div>
            )}

            {/* Operation Activity: Recent Orders/Msgs */}
            {(isFullAdmin || isOrderManager || isSupport) && (
                <RecentActivity activities={stats?.recentActivity || []} />
            )}
        </div>
    );
};

export default DashboardOverview;
