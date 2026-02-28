"use client";

import React, { useState } from "react";
import { Plus, Trash2, X, Users, Receipt, Loader2, Package, Share2, LayoutGrid, List, ArrowRight, ArrowLeft, Search, Check, Save } from "lucide-react";
import { motion } from "framer-motion";
import { BillingItem, CustomerInfo, Product } from "@/lib/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "@/lib/api";

interface BillingViewProps {
    billingItems: BillingItem[];
    customerInfo: CustomerInfo;
    allProducts: Product[];
    isSubmitting: boolean;
    globalTaxEnabled: boolean;
    setGlobalTaxEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    globalTaxRate: number;
    setGlobalTaxRate: React.Dispatch<React.SetStateAction<number>>;
    setBillingItems: React.Dispatch<React.SetStateAction<BillingItem[]>>;
    setCustomerInfo: React.Dispatch<React.SetStateAction<CustomerInfo>>;
    onGenerateBill: () => Promise<void>;
    onResetBill: () => void;
    isEditMode?: boolean;
    billId?: string;
    allUsers?: any[];
}

const BillingView = ({
    billingItems,
    customerInfo,
    allProducts,
    isSubmitting,
    globalTaxEnabled,
    setGlobalTaxEnabled,
    globalTaxRate,
    setGlobalTaxRate,
    setBillingItems,
    setCustomerInfo,
    onGenerateBill,
    onResetBill,
    isEditMode,
    billId,
    allUsers = []
}: BillingViewProps) => {
    const [activeTaxItemIdx, setActiveTaxItemIdx] = useState<number | null>(null);
    const [newTax, setNewTax] = useState({ name: "", rate: "" });
    const [copySuccess, setCopySuccess] = useState(false);
    const [productSearchQuery, setProductSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [inventoryWidth, setInventoryWidth] = useState(70); // Initial width in percentage
    const [isResizing, setIsResizing] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [isUpdatingUser, setIsUpdatingUser] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    const filteredUsers = allUsers.filter(u =>
        u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.phone?.toLowerCase().includes(userSearchQuery.toLowerCase())
    ).slice(0, 5); // Limit results for performance

    const handleSelectUser = (u: any) => {
        setCustomerInfo({
            name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim(),
            email: u.email || "",
            phone: u.phone || "",
            address: customerInfo.address, // Keep existing address
            user: u._id
        });
        setUserSearchQuery("");
        setShowUserDropdown(false);
    };

    const handleSyncCustomer = async () => {
        if (!customerInfo.user) return;
        setIsUpdatingUser(true);
        try {
            // Split name back to first/last if possible, or just send as name if backend supports
            const nameParts = customerInfo.name.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');

            await api.put(`/auth/users/${customerInfo.user}`, {
                firstName,
                lastName,
                email: customerInfo.email,
                phone: customerInfo.phone
            });
            setUpdateSuccess(true);
            setTimeout(() => setUpdateSuccess(false), 2000);
        } catch (error) {
            console.error("Failed to sync customer", error);
            alert("Failed to update customer record");
        } finally {
            setIsUpdatingUser(false);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsResizing(true);
        document.addEventListener('mousemove', handleMouseMove as any);
        document.addEventListener('mouseup', handleMouseUp as any);
    };

    const handleMouseMove = (e: MouseEvent) => {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        if (newWidth > 40 && newWidth < 85) { // Set min/max limits
            setInventoryWidth(newWidth);
        }
    };

    const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp as any);
    };

    const filteredProducts = allProducts.filter(p =>
        (p as any).isActive &&
        (p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
            (p.brand?.toLowerCase().includes(productSearchQuery.toLowerCase())) ||
            (p.modelName?.toLowerCase().includes(productSearchQuery.toLowerCase())))
    );



    const handleAddTax = (idx: number) => {
        if (newTax.name && newTax.rate && !isNaN(Number(newTax.rate))) {
            const updated = [...billingItems];
            updated[idx].taxes.push({ name: newTax.name, rate: Number(newTax.rate) });
            setBillingItems(updated);
            setNewTax({ name: "", rate: "" });
            setActiveTaxItemIdx(null);
        }
    };

    const calculateTotals = () => {
        const subtotal = billingItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        let itemTaxes = 0;
        billingItems.forEach((item) => {
            item.taxes.forEach((tax) => {
                itemTaxes += (item.price * item.quantity) * (tax.rate / 100);
            });
        });

        const globalTaxAmount = globalTaxEnabled ? (subtotal * (globalTaxRate / 100)) : 0;
        const total = Math.round(subtotal + itemTaxes + globalTaxAmount);

        return { subtotal, itemTaxes, globalTaxAmount, total };
    };


    const totals = calculateTotals();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Receipt className="size-6 text-teal-500" /> {isEditMode ? 'Edit Bill' : 'POS Checkout'}
                    </h2>
                    {isEditMode && <p className="text-teal-600 text-[10px] font-black uppercase mt-1">Modifying Bill #{billId?.slice(-8)}</p>}
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    {billId && (
                        <button
                            onClick={() => {
                                const url = `${window.location.origin}/bill/${billId}`;
                                navigator.clipboard.writeText(url);
                                setCopySuccess(true);
                                setTimeout(() => setCopySuccess(false), 2000);
                            }}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all text-sm"
                        >
                            <Share2 className="size-4" />
                            {copySuccess ? 'Copied!' : 'Public Link'}
                        </button>
                    )}
                </div>
            </div>


            <div className={`flex flex-col lg:flex-row gap-6 h-full ${isResizing ? 'cursor-col-resize' : ''}`}>
                {/* Products Inventory (Left Side) */}
                <div
                    className="lg:h-[calc(100vh-140px)] flex flex-col"
                    style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${inventoryWidth}%` : '100%' }}
                >
                    {/* Quick Add from Inventory */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex-1 flex flex-col min-h-0">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Package className="size-3" /> Quick Add Inventory
                            </h3>
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="relative flex-1 sm:w-64">
                                    <input
                                        type="text"
                                        placeholder="Search product name, brand..."
                                        value={productSearchQuery}
                                        onChange={(e) => setProductSearchQuery(e.target.value)}
                                        className="w-full px-4 py-2 pl-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-teal-500 text-[10px] font-bold"
                                    />
                                    <svg className="absolute left-3 top-2.5 size-3.5 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                </div>
                                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-teal-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        title="Grid View"
                                    >
                                        <LayoutGrid className="size-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-teal-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        title="List View"
                                    >
                                        <List className="size-3.5" />
                                    </button>
                                </div>
                                <span className="text-[9px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full whitespace-nowrap">{filteredProducts.length} Products</span>
                            </div>
                        </div>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-1.5 flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0">
                                {filteredProducts.map(p => {
                                    const imgSrc = (p as any).images?.[0] || p.image;
                                    const currentInCart = billingItems.find(i => i.productId === p._id)?.quantity || 0;
                                    return (
                                        <button
                                            key={p._id}
                                            onClick={() => {
                                                const existing = billingItems.find(i => i.productId === p._id);
                                                if (existing) {
                                                    setBillingItems(billingItems.map(i => i.productId === p._id ? { ...i, quantity: i.quantity + 1 } : i));
                                                } else {
                                                    setBillingItems([...billingItems, {
                                                        productId: p._id,
                                                        name: p.name,
                                                        price: Number(p.price),
                                                        quantity: 1,
                                                        taxes: (p as any).taxes || [],
                                                        fromInventory: true
                                                    }]);
                                                }
                                            }}
                                            className={`h-28 p-1.5 bg-white dark:bg-slate-800 border rounded-xl transition-all hover:bg-teal-600 hover:border-teal-600 group text-left shadow-sm flex flex-col justify-start relative ${currentInCart > 0 ? 'border-teal-500 shadow-teal-500/20' : 'border-slate-200 dark:border-slate-700'}`}
                                        >
                                            {/* Selection Indicator */}
                                            {currentInCart > 0 && (
                                                <div className="absolute top-1 right-1 bg-teal-600 text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow-md z-10 border border-white dark:border-slate-800">
                                                    {currentInCart}
                                                </div>
                                            )}
                                            {/* Product Image */}
                                            <div className="w-full h-12 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden mb-1 flex items-center justify-center flex-shrink-0">
                                                {imgSrc ? (
                                                    <img
                                                        src={imgSrc.startsWith('http') || imgSrc.startsWith('/') ? imgSrc : `/${imgSrc}`}
                                                        alt={p.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <Package className="size-5 text-slate-300 dark:text-slate-500 group-hover:text-white/50 transition-colors" />
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between overflow-hidden">
                                                <div className="font-bold text-slate-900 dark:text-white text-[9px] leading-tight line-clamp-2 group-hover:text-white transition-colors" title={p.name}>{p.name}</div>
                                                <div className="text-[9px] text-slate-500 mt-0.5 font-bold font-mono group-hover:text-teal-100 transition-colors">₹{p.price}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                                {filteredProducts.map(p => {
                                    const imgSrc = (p as any).images?.[0] || p.image;
                                    const currentInCart = billingItems.find(i => i.productId === p._id)?.quantity || 0;
                                    return (
                                        <button
                                            key={p._id}
                                            onClick={() => {
                                                const existing = billingItems.find(i => i.productId === p._id);
                                                if (existing) {
                                                    setBillingItems(billingItems.map(i => i.productId === p._id ? { ...i, quantity: i.quantity + 1 } : i));
                                                } else {
                                                    setBillingItems([...billingItems, {
                                                        productId: p._id,
                                                        name: p.name,
                                                        price: Number(p.price),
                                                        quantity: 1,
                                                        taxes: (p as any).taxes || [],
                                                        fromInventory: true
                                                    }]);
                                                }
                                            }}
                                            className={`flex items-center gap-3 p-2 bg-white dark:bg-slate-800 border rounded-xl transition-all hover:bg-teal-600 hover:border-teal-600 group text-left shadow-sm w-full relative ${currentInCart > 0 ? 'border-teal-500 shadow-teal-500/20' : 'border-slate-200 dark:border-slate-700'}`}
                                        >
                                            {/* Product Thumbnail */}
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                {imgSrc ? (
                                                    <img
                                                        src={imgSrc.startsWith('http') || imgSrc.startsWith('/') ? imgSrc : `/${imgSrc}`}
                                                        alt={p.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Package className="size-4 text-slate-300 dark:text-slate-500 group-hover:text-white/50 transition-colors" />
                                                )}
                                            </div>
                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-slate-900 dark:text-white text-[10px] line-clamp-1 group-hover:text-white transition-colors" title={p.name}>{p.name}</div>
                                                {p.brand && <div className="text-[8px] text-slate-400 group-hover:text-teal-100 transition-colors">{p.brand}</div>}
                                            </div>
                                            {/* Price */}
                                            <div className="text-[10px] text-slate-600 dark:text-slate-300 font-mono font-bold group-hover:text-white transition-colors whitespace-nowrap">₹{p.price}</div>
                                            {/* Stock Badge */}
                                            <div className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md flex-shrink-0 ${Number(p.stock) <= 0 ? 'bg-red-50 text-red-600 group-hover:bg-red-500 group-hover:text-white' : 'bg-green-50 text-green-600 group-hover:bg-green-400 group-hover:text-white'}`}>
                                                {p.stock}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Vertical Divider for Resizing */}
                <div
                    className="hidden lg:flex w-1 hover:w-2 bg-slate-200 dark:bg-slate-800 hover:bg-teal-500 dark:hover:bg-teal-600 cursor-col-resize transition-all items-center justify-center rounded-full group mx-[-12px] z-20"
                    onMouseDown={handleMouseDown}
                >
                    <div className="w-1 h-8 bg-slate-300 dark:bg-slate-700 rounded-full group-hover:bg-white/50" />
                </div>

                {/* Cart & Checkout (Right Side) */}
                <div
                    className="lg:h-[calc(100vh-140px)] flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 pb-6"
                    style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${100 - inventoryWidth}%` : '100%' }}
                >
                    {/* Billing Items List */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm flex-shrink-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">
                                    <tr>
                                        <th className="p-4">Item Details</th>
                                        <th className="p-4 w-32 text-center">Qty</th>
                                        <th className="p-4 w-32 text-right">Unit / Total</th>
                                        <th className="p-4 w-12"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {billingItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-12 text-center text-slate-400 italic text-sm">Cart is empty</td>
                                        </tr>
                                    ) : (
                                        billingItems.map((item, idx) => (
                                            <React.Fragment key={idx}>
                                                <tr className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2 max-w-[12rem] sm:max-w-xs">
                                                            <span className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1" title={item.name}>{item.name}</span>
                                                            {item.fromInventory && <span className="text-[8px] flex-shrink-0 bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full uppercase font-black tracking-tighter">Stock</span>}
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                            {item.taxes.map((tax, tIdx) => (
                                                                <div key={tIdx} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded text-[8px] flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                                                                    {tax.name} {tax.rate}%
                                                                    <button onClick={() => {
                                                                        const updated = [...billingItems];
                                                                        updated[idx].taxes = updated[idx].taxes.filter((_, i) => i !== tIdx);
                                                                        setBillingItems(updated);
                                                                    }} className="hover:text-red-500"><X className="size-2" /></button>
                                                                </div>
                                                            ))}
                                                            <button
                                                                onClick={() => setActiveTaxItemIdx(activeTaxItemIdx === idx ? null : idx)}
                                                                className="text-[8px] px-1.5 py-0.5 border border-dashed border-slate-300 dark:border-slate-600 rounded text-slate-400 hover:bg-white flex items-center gap-1"
                                                            >
                                                                {activeTaxItemIdx === idx ? 'Cancel' : '+ Tax'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-lg p-1 w-fit mx-auto border border-slate-200 dark:border-slate-700 shadow-inner">
                                                            <button onClick={() => setBillingItems(billingItems.map((bi, i) => i === idx ? { ...bi, quantity: Math.max(1, bi.quantity - 1) } : bi))} className="w-7 h-7 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 rounded-md transition-colors text-slate-500">-</button>
                                                            <span className="w-8 text-center font-bold text-slate-900 dark:text-white tabular-nums text-xs">{item.quantity}</span>
                                                            <button onClick={() => setBillingItems(billingItems.map((bi, i) => i === idx ? { ...bi, quantity: bi.quantity + 1 } : bi))} className="w-7 h-7 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 rounded-md transition-colors text-slate-500">+</button>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="text-[10px] text-slate-400 font-mono">₹{item.price.toLocaleString()}</div>
                                                        <div className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5">₹{(item.price * item.quantity).toLocaleString()}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <button onClick={() => setBillingItems(billingItems.filter((_, i) => i !== idx))} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                                            <Trash2 className="size-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                                {activeTaxItemIdx === idx && (
                                                    <tr>
                                                        <td colSpan={4} className="p-4 bg-teal-50/30 dark:bg-teal-900/10 border-x border-teal-100 dark:border-teal-900">
                                                            <div className="flex items-center gap-2 max-w-xs ml-auto">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Tax Name"
                                                                    value={newTax.name}
                                                                    onChange={(e) => setNewTax({ ...newTax, name: e.target.value })}
                                                                    className="flex-1 px-3 py-1.5 rounded-lg border text-[10px] outline-none focus:ring-1 focus:ring-teal-500 dark:bg-slate-800 dark:border-slate-700"
                                                                />
                                                                <input
                                                                    type="number"
                                                                    placeholder="%"
                                                                    value={newTax.rate}
                                                                    onChange={(e) => setNewTax({ ...newTax, rate: e.target.value })}
                                                                    className="w-12 px-3 py-1.5 rounded-lg border text-[10px] outline-none focus:ring-1 focus:ring-teal-500 dark:bg-slate-800 dark:border-slate-700"
                                                                />
                                                                <button
                                                                    onClick={() => handleAddTax(idx)}
                                                                    className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-[10px] font-bold"
                                                                >
                                                                    Add
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Checkout button removed for single-step layout */}
                    </div>

                    {/* Customer Info */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Users className="size-3" /> Customer Details
                            </h3>
                            {customerInfo.user ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleSyncCustomer}
                                        disabled={isUpdatingUser}
                                        className={`text-[8px] px-2 py-0.5 rounded-full uppercase font-black transition-all flex items-center gap-1 ${updateSuccess ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-teal-500 hover:text-white'}`}
                                        title="Save changes to customer profile"
                                    >
                                        {isUpdatingUser ? <Loader2 className="size-2 animate-spin" /> : updateSuccess ? <Check className="size-2" /> : <Save className="size-2" />}
                                        {updateSuccess ? 'Updated' : 'Update Record'}
                                    </button>
                                    <button
                                        onClick={() => setCustomerInfo({ ...customerInfo, user: undefined })}
                                        className="text-[8px] bg-teal-600 text-white px-2 py-0.5 rounded-full uppercase font-black hover:bg-red-500 transition-colors flex items-center gap-1"
                                    >
                                        Linked User <X className="size-2" />
                                    </button>
                                </div>
                            ) : (
                                <span className="text-[7px] text-slate-400 font-bold uppercase italic">Guest Customer</span>
                            )}
                        </div>

                        <div className="space-y-4">
                            {/* User Search Bar */}
                            <div className="relative group">
                                <label className="text-[8px] font-black uppercase text-slate-400 ml-1 mb-1 block">Quick Find (Name, Phone, Email)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={userSearchQuery}
                                        onChange={(e) => {
                                            setUserSearchQuery(e.target.value);
                                            setShowUserDropdown(true);
                                        }}
                                        onFocus={() => setShowUserDropdown(true)}
                                        placeholder="Search existing users..."
                                        className="w-full px-4 py-2.5 pl-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-teal-500 text-xs font-bold transition-all"
                                    />
                                    <svg className="absolute left-3 top-3 size-3.5 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                </div>

                                {/* User Dropdown */}
                                {showUserDropdown && userSearchQuery && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2">
                                        {filteredUsers.length > 0 ? (
                                            <div className="p-1">
                                                {filteredUsers.map((u: any) => (
                                                    <button
                                                        key={u._id}
                                                        onClick={() => handleSelectUser(u)}
                                                        className="w-full flex items-center gap-3 p-3 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg text-left transition-colors border-b last:border-0 border-slate-50 dark:border-slate-700/50"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 font-bold text-xs">
                                                            {(u.name?.[0] || u.firstName?.[0] || '?').toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-black text-slate-900 dark:text-white truncate">{u.name || `${u.firstName || ''} ${u.lastName || ''}`}</div>
                                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{u.phone || u.email}</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-4 text-center text-xs text-slate-400 italic">No users found</div>
                                        )}
                                        <button
                                            onClick={() => setShowUserDropdown(false)}
                                            className="w-full py-2 bg-slate-50 dark:bg-slate-900 text-[9px] font-black uppercase text-slate-400 hover:text-teal-600 transition-colors border-t border-slate-100 dark:border-slate-800"
                                        >
                                            Close Results
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={customerInfo.name}
                                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                        placeholder="Customer Name"
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-teal-500 text-xs font-medium"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Phone Number</label>
                                    <input
                                        type="text"
                                        value={customerInfo.phone}
                                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                        placeholder="Number"
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-teal-500 text-xs font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    value={customerInfo.email}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                    placeholder="Email Address"
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-teal-500 text-xs font-medium"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Delivery Address</label>
                                <textarea
                                    value={customerInfo.address}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                                    placeholder="Full Address"
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-teal-500 text-xs h-16 resize-none font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 dark:bg-slate-950 p-6 rounded-[2rem] shadow-2xl text-white space-y-4 border border-white/5">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[9px] font-black uppercase opacity-50 tracking-[0.2em]">Grand Total</span>
                            <span className="text-3xl font-black italic font-mono">
                                ₹{totals.total.toLocaleString()}
                            </span>
                        </div>

                        <div className="space-y-1.5 pt-4 border-t border-white/10">
                            <div className="flex justify-between text-[10px] opacity-60">
                                <span>Net Amount</span>
                                <span>₹{totals.subtotal.toLocaleString()}</span>
                            </div>
                            {totals.itemTaxes > 0 && (
                                <div className="flex justify-between text-[10px] opacity-60">
                                    <span>Added Taxes</span>
                                    <span>₹{totals.itemTaxes.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-4 py-2">
                                <div className="flex items-center gap-2">
                                    <div
                                        onClick={() => setGlobalTaxEnabled(!globalTaxEnabled)}
                                        className={`size-3.5 rounded border border-white/20 flex items-center justify-center cursor-pointer transition-all ${globalTaxEnabled ? 'bg-teal-500 border-teal-500' : ''}`}
                                    >
                                        {globalTaxEnabled && <X className="size-2 text-white stroke-[4px]" />}
                                    </div>
                                    <span className="text-[9px] font-black uppercase opacity-60">GST (Global)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        value={globalTaxRate}
                                        onChange={(e) => setGlobalTaxRate(Number(e.target.value))}
                                        className="w-10 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[10px] font-black text-right outline-none focus:border-teal-500 transition-colors"
                                    />
                                    <span className="text-[9px] opacity-60">%</span>
                                </div>
                            </div>

                            {globalTaxEnabled && (
                                <div className="flex justify-between text-[10px] font-bold text-teal-400">
                                    <span>GST Amount</span>
                                    <span>₹{totals.globalTaxAmount.toLocaleString()}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 pt-6">
                            <button
                                onClick={onGenerateBill}
                                disabled={isSubmitting || billingItems.length === 0}
                                className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-teal-500/20 uppercase tracking-widest"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin size-4" /> : <Receipt className="size-4" />}
                                {isSubmitting ? "Processing..." : isEditMode ? "Save Changes" : "Confirm Order"}
                            </button>


                            {!isEditMode && (
                                <button
                                    onClick={onResetBill}
                                    className="w-full py-2 text-[8px] font-bold text-white/20 hover:text-red-400 transition-all uppercase tracking-widest"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default BillingView;
