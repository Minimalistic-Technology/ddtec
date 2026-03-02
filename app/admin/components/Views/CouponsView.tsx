import React, { useState, useMemo } from 'react';
import { Plus, Ticket, Trash2 } from 'lucide-react';
import ViewControls from "../ViewControls";
import { Coupon } from '@/lib/types';
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";

interface CouponsViewProps {
    couponsList: Coupon[];
    setIsAddCouponModalOpen: (isOpen: boolean) => void;
    toggleCouponStatus: (id: string, currentStatus: boolean) => void;
    handleDeleteCoupon: (id: string) => void;
    canAdd?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    user?: any;
}

const CouponsView = ({
    couponsList,
    setIsAddCouponModalOpen,
    toggleCouponStatus,
    handleDeleteCoupon,
    canAdd = false,
    canEdit = false,
    canDelete = false,
    user = null
}: CouponsViewProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("expiry-soon");

    const sortOptions = [
        { value: "expiry-soon", label: "Expiry (Soonest)" },
        { value: "expiry-far", label: "Expiry (Furthest)" },
        { value: "code-asc", label: "Code (A-Z)" },
        { value: "discount-high", label: "Discount (High to Low)" },
    ];

    const processedCoupons = useMemo(() => {
        let result = [...couponsList];

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.code.toLowerCase().includes(q) ||
                c.discountType.toLowerCase().includes(q)
            );
        }

        result.sort((a, b) => {
            if (sortBy === "expiry-soon") return new Date(a.expiresAt || "9999").getTime() - new Date(b.expiresAt || "9999").getTime();
            if (sortBy === "expiry-far") return new Date(b.expiresAt || "0").getTime() - new Date(a.expiresAt || "0").getTime();
            if (sortBy === "code-asc") return a.code.localeCompare(b.code);
            if (sortBy === "discount-high") return b.discountValue - a.discountValue;
            return 0;
        });

        return result;
    }, [couponsList, searchQuery, sortBy]);

    const activeCoupons = processedCoupons.filter(c => !c.expiresAt || new Date(c.expiresAt) > new Date());
    const expiredCoupons = processedCoupons.filter(c => c.expiresAt && new Date(c.expiresAt) <= new Date());

    const handleExportCSV = () => {
        const data = processedCoupons.map(c => ({
            Code: c.code,
            Discount: c.discountType === 'percentage' ? `${c.discountValue}%` : c.discountValue,
            Type: c.discountType,
            Expiry: c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never",
            Status: (!c.expiresAt || new Date(c.expiresAt) > new Date()) ? (c.isActive ? "Active" : "Disabled") : "Expired"
        }));
        exportToCSV(data, `Coupons_${new Date().toISOString().split('T')[0]}`);
    };

    const handleExportPDF = () => {
        const headers = ["Code", "Discount", "Type", "Expiry", "Status"];
        const data = processedCoupons.map(c => ({
            code: c.code,
            discount: c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`,
            type: c.discountType,
            expiry: c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never",
            status: (!c.expiresAt || new Date(c.expiresAt) > new Date()) ? (c.isActive ? "Active" : "Disabled") : "Expired"
        }));
        exportToPDF(data, headers, "Coupons_Report", "Coupon Management Report");
    };
    return (
        <div className="space-y-8">
            {/* Header & Create Button */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Coupon Management</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Create and manage discount codes</p>
                </div>
                {canAdd && (
                    <button
                        onClick={() => setIsAddCouponModalOpen(true)}
                        className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-95 font-bold"
                    >
                        <Plus className="size-4" /> Create Coupon
                    </button>
                )}
            </div>

            <ViewControls
                title="Coupon Search & Filters"
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                sortBy={sortBy}
                onSort={setSortBy}
                sortOptions={sortOptions}
                onExportCSV={handleExportCSV}
                onExportPDF={handleExportPDF}
                canExport={user?.role === 'super_admin'}
            />

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
                                <th className="p-4 text-center w-40">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {activeCoupons.map(coupon => (
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
                                    <td className="p-4 flex justify-center items-center gap-2">
                                        {canDelete && (
                                            <button onClick={() => handleDeleteCoupon(coupon._id!)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all hover:scale-110">
                                                <Trash2 className="size-4" />
                                            </button>
                                        )}
                                        {!canEdit && !canDelete && (
                                            <span className="text-slate-400 italic text-sm">View Only</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {activeCoupons.length === 0 && (
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
                                <th className="p-4 text-center w-40">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {expiredCoupons.map(coupon => (
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
                                    <td className="p-4 flex justify-center items-center gap-2">
                                        {canDelete && (
                                            <button onClick={() => handleDeleteCoupon(coupon._id!)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all hover:scale-110">
                                                <Trash2 className="size-4" />
                                            </button>
                                        )}
                                        {!canDelete && (
                                            <span className="text-slate-400 italic text-sm">View Only</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {expiredCoupons.length === 0 && (
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
