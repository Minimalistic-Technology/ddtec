import React from 'react';
import { Plus, Ticket, Trash2 } from 'lucide-react';
import { Coupon } from '@/lib/types';

interface CouponsViewProps {
    couponsList: Coupon[];
    setIsAddCouponModalOpen: (isOpen: boolean) => void;
    toggleCouponStatus: (id: string, currentStatus: boolean) => void;
    handleDeleteCoupon: (id: string) => void;
    canEdit?: boolean;
}

const CouponsView = ({
    couponsList,
    setIsAddCouponModalOpen,
    toggleCouponStatus,
    handleDeleteCoupon,
    canEdit = false
}: CouponsViewProps) => {
    return (
        <div className="space-y-8">
            {/* Header & Create Button */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Coupon Management</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Create and manage discount codes</p>
                </div>
                {canEdit && (
                    <button
                        onClick={() => setIsAddCouponModalOpen(true)}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-teal-500/20"
                    >
                        <Plus className="size-4" /> Create Coupon
                    </button>
                )}
            </div>

            {/* Active Coupons */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Ticket className="size-5 text-teal-500" /> Active Coupons
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                            <tr>
                                <th className="p-4">Code</th>
                                <th className="p-4">Discount</th>
                                <th className="p-4">Expiry</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {couponsList.filter(c => !c.expiresAt || new Date(c.expiresAt) > new Date()).map(coupon => (
                                <tr key={coupon._id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${!coupon.isActive ? 'opacity-60' : ''}`}>
                                    <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                                        {coupon.code}
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400">
                                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                                    </td>
                                    <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">
                                        {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="p-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={coupon.isActive}
                                            onChange={() => toggleCouponStatus(coupon._id!, coupon.isActive!)}
                                            disabled={!canEdit}
                                            className={`size-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        />
                                    </td>
                                    {canEdit ? (
                                        <td className="p-4 text-right">
                                            <button onClick={() => handleDeleteCoupon(coupon._id!)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                <Trash2 className="size-4" />
                                            </button>
                                        </td>
                                    ) : (
                                        <td className="p-4 text-right text-slate-400 italic text-sm">View Only</td>
                                    )}
                                </tr>
                            ))}
                            {couponsList.filter(c => !c.expiresAt || new Date(c.expiresAt) > new Date()).length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">No active coupons found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Expired Coupons */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden opacity-80">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/30">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Trash2 className="size-5 text-slate-400" /> Expired Coupons
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                            <tr>
                                <th className="p-4">Code</th>
                                <th className="p-4">Discount</th>
                                <th className="p-4">Expired On</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {couponsList.filter(c => c.expiresAt && new Date(c.expiresAt) <= new Date()).map(coupon => (
                                <tr key={coupon._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors bg-red-50/10">
                                    <td className="p-4 font-mono font-bold text-slate-500 dark:text-slate-400 line-through">
                                        {coupon.code}
                                    </td>
                                    <td className="p-4 text-slate-500 dark:text-slate-500">
                                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                                    </td>
                                    <td className="p-4 text-red-500 text-sm font-medium">
                                        {new Date(coupon.expiresAt!).toLocaleDateString()}
                                    </td>
                                    {canEdit ? (
                                        <td className="p-4 text-right">
                                            <button onClick={() => handleDeleteCoupon(coupon._id!)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                <Trash2 className="size-4" />
                                            </button>
                                        </td>
                                    ) : (
                                        <td className="p-4 text-right text-slate-400 italic text-sm">View Only</td>
                                    )}
                                </tr>
                            ))}
                            {couponsList.filter(c => c.expiresAt && new Date(c.expiresAt) <= new Date()).length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">No expired coupons found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CouponsView;
