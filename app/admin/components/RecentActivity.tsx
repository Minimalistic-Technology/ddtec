"use client";

import { User, ShoppingBag, Edit, Plus, CheckCircle, Clock, XCircle } from "lucide-react";

interface RecentActivityProps {
    activities: Array<{
        _id: string;
        user?: { firstName?: string; email?: string };
        totalAmount: number;
        status: string;
        createdAt: string;
        items?: any[];
    }>;
}

export default function RecentActivity({ activities }: RecentActivityProps) {
    if (!activities || activities.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm h-full flex items-center justify-center">
                <span className="text-slate-400 text-sm">No recent activity</span>
            </div>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'delivered': return <CheckCircle className="size-4 text-white" />;
            case 'cancelled': return <XCircle className="size-4 text-white" />;
            default: return <Clock className="size-4 text-white" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-green-500';
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-blue-500';
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Orders</h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="relative border-l border-slate-100 dark:border-slate-700 ml-4 space-y-8 pb-4">
                    {activities.map((activity, index) => {
                        const userName = activity.user?.firstName || activity.user?.email?.split('@')[0] || "Guest";
                        const date = new Date(activity.createdAt).toLocaleString();

                        return (
                            <div key={activity._id} className="ml-6 relative pl-6">
                                <div className={`absolute -left-[31px] top-0 size-8 rounded-full border-4 border-white dark:border-slate-800 overflow-hidden flex items-center justify-center ${getStatusColor(activity.status)}`}>
                                    {getStatusIcon(activity.status)}
                                </div>

                                <div>
                                    <p className="text-sm text-slate-900 dark:text-white leading-relaxed">
                                        <span className="font-bold">{userName}</span> placed an order for <span className="font-bold text-teal-600">₹{activity.totalAmount.toLocaleString()}</span>
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${activity.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                            activity.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {activity.status}
                                        </span>
                                        <span className="text-xs text-slate-400">{date}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
