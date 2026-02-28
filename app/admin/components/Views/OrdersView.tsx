"use client";

import React from "react";
import { Edit, Trash2, ShoppingBag, Truck, Receipt } from "lucide-react";

import { User } from "@/lib/types";

interface OrdersViewProps {
    orders: any[];
    onEditOrder: (order: any) => void;
    onViewOrderDetails: (order: any) => void;
    onUpdateStatus: (id: string, status: string) => void;
    onDeleteOrder: (id: string) => void;
    user: User | null;
    canEdit?: boolean;
}

const OrdersView = ({
    orders,
    onEditOrder,
    onViewOrderDetails,
    onUpdateStatus,
    onDeleteOrder,
    user,
    canEdit = false
}: OrdersViewProps) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Order Management</h2>
            </div>

            {(user?.role === 'order_manager' || user?.role === 'super_admin') && orders.filter(o => o.status === 'pending').length > 0 && (
                <div className="mx-6 mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-xl">
                            <Truck className="size-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">Pending Attention</h4>
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                {orders.filter(o => o.status === 'pending').length} orders are waiting to be processed.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                        <tr>
                            <th className="p-4">Reference / Date</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Total</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Payment</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {orders.map(o => (
                            <tr key={o._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 group">
                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">#{o._id.slice(-8).toUpperCase()}</span>
                                        <span className="text-[10px] text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-900 dark:text-white">{o.shippingInfo?.fullName || "Guest"}</span>
                                        <span className="text-[10px] text-slate-500">{o.user?.email || "No Email"}</span>
                                    </div>
                                </td>
                                <td className="p-4 font-bold text-slate-900 dark:text-white">
                                    ₹{o.totalAmount?.toLocaleString()}
                                </td>
                                <td className="p-4">
                                    <select
                                        value={o.status}
                                        onChange={(e) => onUpdateStatus(o._id, e.target.value)}
                                        disabled={!canEdit}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold outline-none border transition-colors ${o.status === 'delivered' ? 'bg-green-100 text-green-700 border-green-200' :
                                            o.status === 'processing' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                o.status === 'shipped' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                    'bg-slate-100 text-slate-600 border-slate-200'
                                            } ${!canEdit ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${o.isPaid ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-700'}`}>
                                        {o.isPaid ? 'Paid' : 'Unpaid'}
                                    </span>
                                </td>
                                <td className="p-4 text-right flex justify-end items-center gap-2">
                                    <button
                                        onClick={() => onViewOrderDetails(o)}
                                        className="text-slate-400 hover:text-teal-600 p-2 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-full transition-colors"
                                        title="View Details"
                                    >
                                        <Receipt className="size-4" />
                                    </button>
                                    {canEdit && (
                                        <>
                                            <button
                                                onClick={() => onEditOrder(o)}
                                                className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                                title="Edit Address"
                                            >
                                                <Edit className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => onDeleteOrder(o._id)}
                                                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                title="Delete Order"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </>
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

export default OrdersView;
