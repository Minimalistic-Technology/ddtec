import { Plus, Receipt, Trash2, Download, Share2, Printer } from 'lucide-react';
import { generateBillPDF } from '@/lib/pdfUtils';

interface BillsViewProps {
    bills: any[];
    setIsAddBillModalOpen: (isOpen: boolean) => void;
    handleDeleteBill: (id: string) => void;
    onEditBill: (bill: any) => void;
}

const BillsView = ({
    bills,
    setIsAddBillModalOpen,
    handleDeleteBill,
    onEditBill
}: BillsViewProps) => {
    return (
        <div className="space-y-8">
            {/* Header & Create Button */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Billing Management</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Create and view POS transaction history</p>
                </div>
                <button
                    onClick={() => setIsAddBillModalOpen(true)}
                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-teal-500/20 font-bold"
                >
                    <Plus className="size-5" /> Add Bill
                </button>
            </div>

            {/* Bills History */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Receipt className="size-5 text-teal-500" /> Transaction History
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="p-4">Reference / Date</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4 text-right">Total Amount</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {bills.map(bill => (
                                <tr key={bill._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-mono font-bold text-slate-900 dark:text-white text-xs text-teal-600">
                                                #{bill._id.slice(-8).toUpperCase()}
                                            </span>
                                            <span className="text-[10px] text-slate-500 mt-0.5">
                                                {new Date(bill.createdAt).toLocaleDateString()} at {new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                                                {bill.customerInfo.name}
                                            </span>
                                            <span className="text-[10px] text-slate-500">
                                                {bill.customerInfo.phone || 'No phone'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right font-black text-slate-900 dark:text-white font-mono">
                                        ₹{bill.totalAmount.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    const url = `${window.location.origin}/bill/${bill._id}`;
                                                    navigator.clipboard.writeText(url);
                                                    alert("Public link copied to clipboard!");
                                                }}
                                                className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                                                title="Copy Public Link"
                                            >
                                                <Share2 className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => generateBillPDF(bill, false)}
                                                className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                                                title="Export PDF"
                                            >
                                                <Download className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => generateBillPDF(bill, true)}
                                                className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                title="WhatsApp Share"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /><path d="M8 12h.01" /><path d="M12 12h.01" /><path d="M16 12h.01" /></svg>
                                            </button>
                                            <button
                                                onClick={() => onEditBill(bill)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                title="Edit Bill"
                                            >
                                                <Trash2 className="size-4 hidden" /> {/* Dummy to keep layout if needed, but I'll use Edit icon */}
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBill(bill._id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Delete Record"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {bills.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-slate-400 italic text-sm">
                                        No transactions found. Click "Add Bill" to create your first POS receipt.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
};

export default BillsView;
