"use client";

import React from "react";
import { Search, Download, FileText, ChevronDown } from "lucide-react";

interface SortOption {
    value: string;
    label: string;
}

interface ViewControlsProps {
    onSearch: (query: string) => void;
    searchQuery: string;
    onSort: (value: string) => void;
    sortBy: string;
    sortOptions: SortOption[];
    onExportCSV: () => void;
    onExportPDF: () => void;
    title?: string;
    canExport?: boolean;
    children?: React.ReactNode;
    noBorder?: boolean;
}

const ViewControls = ({
    onSearch,
    searchQuery,
    onSort,
    sortBy,
    sortOptions,
    onExportCSV,
    onExportPDF,
    title,
    canExport = false,
    children,
    noBorder = false
}: ViewControlsProps) => {
    return (
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 px-6 ${noBorder ? '' : 'border-b border-slate-100 dark:border-slate-700'} bg-white dark:bg-slate-800`}>
            <div className="flex flex-col gap-1">
                {title && <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight text-sm">{title}</h2>}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => onSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[160px]">
                    <select
                        value={sortBy}
                        onChange={(e) => onSort(e.target.value)}
                        className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 pr-10 outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium transition-all"
                    >
                        {sortOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                </div>

                {canExport && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onExportCSV}
                            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm hover:shadow-md active:scale-95"
                        >
                            <Download className="size-3.5" /> CSV
                        </button>
                        <button
                            onClick={onExportPDF}
                            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm hover:shadow-md active:scale-95"
                        >
                            <FileText className="size-3.5" /> PDF
                        </button>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};

export default ViewControls;
