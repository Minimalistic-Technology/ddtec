"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface OrderSummaryProps {
    data: { name: string; value: number }[];
    totalRevenue: number;
}

export default function OrderSummaryChart({ data, totalRevenue }: OrderSummaryProps) {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Order Summary</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">₹{totalRevenue.toLocaleString()}</span>
                        <span className="text-xs text-slate-400">Total Revenue</span>
                    </div>
                </div>
                <span className="text-xs text-slate-400">Last 7 Days</span>
            </div>

            <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
                    >
                        <defs>
                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            cursor={{ stroke: '#14b8a6', strokeWidth: 1, strokeDasharray: '4 4' }}
                            formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#14b8a6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorProfit)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
