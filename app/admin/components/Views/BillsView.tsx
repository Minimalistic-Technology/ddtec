import React, { useState, useMemo } from 'react';
import { Plus, Receipt, Trash2, Download, Share2, Printer } from 'lucide-react';
import { generateBillPDF } from '@/lib/pdfUtils';
import ViewControls from "../ViewControls";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";

interface BillsViewProps {
    bills: any[];
    setIsAddBillModalOpen: (isOpen: boolean) => void;
    handleDeleteBill: (id: string) => void;
    onEditBill: (bill: any) => void;
    canAdd?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    user?: any;
}

const BillsView = ({
    bills,
    setIsAddBillModalOpen,
    handleDeleteBill,
    onEditBill,
    canAdd = true,
    canEdit = true,
    canDelete = true,
    user = null
}: BillsViewProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    const sortOptions = [
        { value: "newest", label: "Newest First" },
        { value: "oldest", label: "Oldest First" },
        { value: "price-high", label: "Total (High to Low)" },
        { value: "customer-asc", label: "Customer (A-Z)" },
    ];

    const processedBills = useMemo(() => {
        let result = [...bills];

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(b =>
                b.customerInfo.name.toLowerCase().includes(q) ||
                b._id.toLowerCase().includes(q) ||
                (b.customerInfo.phone && b.customerInfo.phone.includes(q))
            );
        }

        result.sort((a, b) => {
            if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (sortBy === "price-high") return b.totalAmount - a.totalAmount;
            if (sortBy === "customer-asc") return a.customerInfo.name.localeCompare(b.customerInfo.name);
            return 0;
        });

        return result;
    }, [bills, searchQuery, sortBy]);

    const handleExportCSV = () => {
        const data = processedBills.map(b => ({
            BillID: `Bill_${b._id.slice(-8).toUpperCase()}`,
            Date: new Date(b.createdAt).toLocaleDateString(),
            Customer: b.customerInfo.name,
            Phone: b.customerInfo.phone || "N/A",
            Total: b.totalAmount
        }));
        exportToCSV(data, `Bills_${new Date().toISOString().split('T')[0]}`);
    };

    const handleExportPDF = () => {
        const headers = ["ID", "Date", "Customer", "Phone", "Total"];
        const data = processedBills.map(b => ({
            id: `#${b._id.slice(-8).toUpperCase()}`,
            date: new Date(b.createdAt).toLocaleDateString(),
            customer: b.customerInfo.name,
            phone: b.customerInfo.phone || "N/A",
            total: `INR ${b.totalAmount}`
        }));
        exportToPDF(data, headers, "Bills_Report", "POS Transaction History Report");
    };
    return (
        <div className="space-y-8">
            {/* Header & Create Button */}
            <div className="flex flex-wrap justify-between items-center bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 gap-3">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1">Billing Management</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Create and view POS transaction history</p>
                </div>
                {canAdd && (
                    <button
                        onClick={() => setIsAddBillModalOpen(true)}
                        className="px-4 py-2 sm:px-6 sm:py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-teal-500/20 font-bold shrink-0"
                    >
                        <Plus className="size-5" /> Add Bill
                    </button>
                )}
            </div>

            <ViewControls
                title="POS Billing Records"
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                sortBy={sortBy}
                onSort={setSortBy}
                sortOptions={sortOptions}
                onExportCSV={handleExportCSV}
                onExportPDF={handleExportPDF}
                canExport={user?.role === 'super_admin'}
            />

            {/* Bills History */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Receipt className="size-5 text-teal-500" /> Transaction History
                    </h3>
                </div>
                {/* Mobile Card List */}
                <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700">
                    {processedBills.map(bill => (
                        <div key={bill._id} className="p-4 flex flex-col gap-2">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-mono font-bold text-teal-600 text-xs">#{bill._id.slice(-8).toUpperCase()}</p>
                                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{bill.customerInfo.name}</p>
                                    <p className="text-xs text-slate-500">{bill.customerInfo.phone || 'No phone'} · {new Date(bill.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className="font-black font-mono text-slate-900 dark:text-white">₹{bill.totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1">
                                <button onClick={() => { const url = `${window.location.origin}/bill/${bill._id}`; navigator.clipboard.writeText(url); alert("Public link copied!"); }} className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-all" title="Copy Link"><Share2 className="size-4" /></button>
                                <button onClick={() => generateBillPDF(bill, false)} className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-all" title="Export PDF"><Download className="size-4" /></button>
                                {canEdit && (
                                    <button onClick={() => onEditBill(bill)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all" title="Edit Bill">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                    </button>
                                )}
                                {canDelete && (
                                    <button onClick={() => handleDeleteBill(bill._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all" title="Delete"><Trash2 className="size-4" /></button>
                                )}
                            </div>
                        </div>
                    ))}
                    {processedBills.length === 0 && (
                        <div className="p-8 text-center text-slate-400 text-sm italic">No transactions found. Click "Add Bill" to create your first POS receipt.</div>
                    )}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="p-4">Reference / Date</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4 text-right">Total Amount</th>
                                <th className="p-4 text-center w-48">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {processedBills.map(bill => (
                                <tr key={bill._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-mono font-bold text-slate-900 dark:text-white text-xs text-teal-600">#{bill._id.slice(-8).toUpperCase()}</span>
                                            <span className="text-[10px] text-slate-500 mt-0.5">{new Date(bill.createdAt).toLocaleDateString()} at {new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 dark:text-white text-sm">{bill.customerInfo.name}</span>
                                            <span className="text-[10px] text-slate-500">{bill.customerInfo.phone || 'No phone'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right font-black text-slate-900 dark:text-white font-mono">₹{bill.totalAmount.toLocaleString()}</td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => { const url = `${window.location.origin}/bill/${bill._id}`; navigator.clipboard.writeText(url); alert("Public link copied to clipboard!"); }} className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-all hover:scale-110" title="Copy Public Link"><Share2 className="size-4" /></button>
                                            <button onClick={() => generateBillPDF(bill, false)} className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-all hover:scale-110" title="Export PDF"><Download className="size-4" /></button>
                                            <button onClick={() => generateBillPDF(bill, true)} className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all hover:scale-110" title="WhatsApp Share"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /><path d="M8 12h.01" /><path d="M12 12h.01" /><path d="M16 12h.01" /></svg></button>
                                            {canEdit && (
                                                <button onClick={() => onEditBill(bill)} className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all hover:scale-110" title="Edit Bill">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button onClick={() => handleDeleteBill(bill._id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all hover:scale-110" title="Delete Record"><Trash2 className="size-4" /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {processedBills.length === 0 && (
                                <tr><td colSpan={4} className="p-12 text-center text-slate-400 italic text-sm">No transactions found. Click "Add Bill" to create your first POS receipt.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BillsView;
