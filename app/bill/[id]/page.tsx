"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Receipt, Printer, Download, Package } from "lucide-react";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

const PublicBillPage = () => {
    const { id } = useParams();
    const [bill, setBill] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchBill = async () => {
            try {
                const { data } = await api.get(`/bills/public/${id}`);
                setBill(data);
            } catch (err: any) {
                console.error("Failed to fetch bill", err);
                setError(err.response?.data?.msg || "Bill not found or error fetching data");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchBill();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-teal-600 size-10" />
            </div>
        );
    }

    if (error || !bill) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="size-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Receipt className="size-8" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 mb-2">Error Loading Bill</h1>
                    <p className="text-slate-500 mb-6">{error}</p>
                    <a href="/" className="inline-block px-6 py-2 bg-slate-900 text-white rounded-xl font-bold">Back to Home</a>
                </div>
            </div>
        );
    }

    const { subtotal, itemTaxes, globalTaxAmount, total } = (() => {
        const sub = bill.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
        const taxes = bill.items.reduce((acc: number, item: any) => {
            const itemTotal = item.price * item.quantity;
            return acc + (item.taxes?.reduce((tAcc: number, tax: any) => tAcc + (itemTotal * (tax.rate / 100)), 0) || 0);
        }, 0);
        const globalT = bill.globalTax?.amount || 0;
        return { subtotal: sub, itemTaxes: taxes, globalTaxAmount: globalT, total: bill.totalAmount };
    })();

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0 print:px-0">
            {/* Header / Actions - Hidden on print */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
                <div className="flex items-center gap-3">
                    <div className="size-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-600/20">
                        <Receipt className="size-5" />
                    </div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">E-INVOICE</h1>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <Printer className="size-4" /> Print
                    </button>
                </div>
            </div>

            {/* Bill Content */}
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 print:shadow-none print:border-none print:rounded-none">
                {/* Branding Strip */}
                <div className="h-2 bg-teal-600 w-full" />

                <div className="p-8 md:p-12">
                    {/* Bill Header */}
                    <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
                        <div>
                            <h2 className="text-3xl font-black text-teal-600 mb-2">DDTECH</h2>
                            <div className="text-slate-500 text-sm space-y-1">
                                <p>123 Tech Lane, Silicon Valley</p>
                                <p>Contact: +91 98765 43210</p>
                                <p>Email: support@ddtech.com</p>
                                <p>www.ddtech.com</p>
                            </div>
                        </div>
                        <div className="text-left md:text-right">
                            <h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-1">Invoice Number</h3>
                            <p className="text-xl font-mono font-bold text-slate-900 mb-4">#{bill._id.slice(-8).toUpperCase()}</p>
                            <h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-1">Date Issued</h3>
                            <p className="text-slate-900 font-bold">{new Date(bill.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 p-6 bg-slate-50 rounded-2xl border border-slate-100 print:bg-white">
                        <div>
                            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Billed To</h3>
                            <p className="text-lg font-bold text-slate-900">{bill.customerInfo.name}</p>
                            <p className="text-slate-500 text-sm mt-1">{bill.customerInfo.phone}</p>
                            {bill.customerInfo.email && <p className="text-slate-500 text-sm">{bill.customerInfo.email}</p>}
                        </div>
                        {bill.customerInfo.address && (
                            <div>
                                <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Address</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{bill.customerInfo.address}</p>
                            </div>
                        )}
                    </div>

                    {/* Items Table */}
                    <div className="mb-12 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="py-4 font-black text-[10px] uppercase tracking-widest text-slate-400">Description</th>
                                    <th className="py-4 text-center font-black text-[10px] uppercase tracking-widest text-slate-400">Qty</th>
                                    <th className="py-4 text-right font-black text-[10px] uppercase tracking-widest text-slate-400">Unit Price</th>
                                    <th className="py-4 text-right font-black text-[10px] uppercase tracking-widest text-slate-400">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {bill.items.map((item: any, idx: number) => (
                                    <tr key={idx}>
                                        <td className="py-4">
                                            <div className="font-bold text-slate-900">
                                                {item.name.length > 25 ? item.name.substring(0, 22) + "..." : item.name}
                                            </div>
                                            {item.taxes && item.taxes.length > 0 && (
                                                <div className="flex gap-2 mt-1">
                                                    {item.taxes.map((t: any, ti: number) => (
                                                        <span key={ti} className="text-[9px] text-slate-400 uppercase font-medium bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{t.name} {t.rate}%</span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 text-center text-slate-900 font-medium">{item.quantity}</td>
                                        <td className="py-4 text-right text-slate-900 font-mono">₹{item.price.toLocaleString()}</td>
                                        <td className="py-4 text-right text-slate-900 font-bold font-mono">₹{(item.price * item.quantity).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary */}
                    <div className="flex justify-end">
                        <div className="w-full md:w-64 space-y-3">
                            <div className="flex justify-between text-slate-500 text-sm px-2">
                                <span>Subtotal</span>
                                <span className="font-mono font-medium text-slate-900">₹{subtotal.toLocaleString()}</span>
                            </div>
                            {itemTaxes > 0 && (
                                <div className="flex justify-between text-slate-500 text-sm px-2">
                                    <span>Item Taxes</span>
                                    <span className="font-mono font-medium text-slate-900">₹{itemTaxes.toLocaleString()}</span>
                                </div>
                            )}
                            {bill.globalTax && (
                                <div className="flex justify-between text-slate-500 text-sm px-2">
                                    <span>Tax ({bill.globalTax.rate}%)</span>
                                    <span className="font-mono font-medium text-slate-900">₹{globalTaxAmount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="border-t border-slate-100 pt-3 flex justify-between items-end px-2">
                                <span className="text-xs font-black uppercase text-teal-600">Total Amount</span>
                                <span className="text-2xl font-black text-slate-900 font-mono italic">₹{total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-20 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Terms & Conditions</p>
                            <p className="text-[10px] text-slate-400 max-w-sm">All sales are final. Prices include applicable taxes. Generated electronically on {new Date().toLocaleDateString()}.</p>
                        </div>
                        <div className="text-center md:text-right">
                            <div className="size-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white mx-auto md:ml-auto">
                                <Package className="size-6" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="max-w-4xl mx-auto text-center mt-8 text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] print:hidden">
                Thank you for choosing DDTECH
            </p>
        </div>
    );
};

export default PublicBillPage;
