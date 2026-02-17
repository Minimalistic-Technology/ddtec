"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface ProfitChartProps {
    data: { name: string; value: number }[];
}

const COLORS = ["#14b8a6", "#3b82f6", "#f59e0b", "#ef4444", "#64748b", "#8b5cf6", "#ec4899"];

export default function ProfitChart({ data }: ProfitChartProps) {
    const totalProfit = data.reduce((acc, curr) => acc + curr.value, 0);

    // Assign colors if not present in data (backend sends name/value)
    const chartData = data.map((item, index) => ({
        ...item,
        color: COLORS[index % COLORS.length]
    }));

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Revenue by Category</h3>
                <span className="text-xs text-slate-400">All Time</span>
            </div>

            <div className="flex-1 w-full min-h-[300px] flex items-center justify-center relative pb-4">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => `₹${value.toLocaleString()}`}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">No sales data yet</div>
                )}

                {/* Centered Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">
                        {totalProfit >= 100000 ? `${(totalProfit / 100000).toFixed(1)}L` : `₹${totalProfit.toLocaleString()}`}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">Total Revenue</span>
                </div>
            </div>
        </div>
    );
}
