import React from 'react';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { Coupon } from '@/lib/types';

interface CouponModalProps {
    isOpen: boolean;
    onClose: () => void;
    isEdit: boolean;
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
}

const CouponModal = ({
    isOpen,
    onClose,
    isEdit,
    formData,
    setFormData,
    onSubmit,
    isSubmitting
}: CouponModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {isEdit ? 'Edit Coupon' : 'Create New Coupon'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
                        <X className="size-6" />
                    </button>
                </div>
                <form onSubmit={onSubmit} className="flex flex-col max-h-[90vh]">
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Code</label>
                            <input
                                required
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                                placeholder="SUMMER25"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                                <select
                                    value={formData.discountType}
                                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Value</label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    value={formData.discountValue}
                                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expiry Date</label>
                            <input
                                type="date"
                                value={formData.expiresAt ? (typeof formData.expiresAt === 'string' ? formData.expiresAt.split('T')[0] : '') : ''}
                                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                            <input
                                type="checkbox"
                                id="couponActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="size-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                            />
                            <label htmlFor="couponActive" className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer">
                                {isEdit ? 'Active' : 'Active immediately'}
                            </label>
                        </div>
                    </div>
                    <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin size-5" /> : (isEdit ? 'Save Changes' : 'Create Coupon')}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default CouponModal;
