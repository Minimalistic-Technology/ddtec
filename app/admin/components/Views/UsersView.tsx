"use client";

import React, { useState, useMemo } from "react";
import { Plus, Edit, Trash2, Coins, Users, Shield } from "lucide-react";
import ToggleSwitch from "../ToggleSwitch";
import ViewControls from "../ViewControls";
import { User } from "@/lib/types";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";

interface UsersViewProps {
    users: User[];
    onAddUser: () => void;
    onEditUser: (user: User) => void;
    onDeleteUser: (id: string) => void;
    onToggleStatus: (id: string, currentStatus: boolean) => void;
    onManageCredit: (user: User) => void;
    user: User | null;
    canAdd?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
}

const UsersView = ({
    users,
    onAddUser,
    onEditUser,
    onDeleteUser,
    onToggleStatus,
    onManageCredit,
    user,
    canAdd = false,
    canEdit = false,
    canDelete = false
}: UsersViewProps) => {
    const [viewMode, setViewMode] = useState<'customers' | 'staff'>('customers');
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    const sortOptions = [
        { value: "newest", label: "Newest Joined" },
        { value: "oldest", label: "Oldest Joined" },
        { value: "name-asc", label: "Name (A-Z)" },
        { value: "name-desc", label: "Name (Z-A)" },
        { value: "credit-high", label: "Highest Credit" },
        { value: "credit-low", label: "Lowest Credit" },
    ];

    const processedUsers = useMemo(() => {
        let result = users.filter(u => viewMode === 'customers' ? u.role === 'user' : u.role !== 'user');

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(u =>
            (u.firstName?.toLowerCase().includes(q) ||
                u.lastName?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                u.name?.toLowerCase().includes(q))
            );
        }

        result.sort((a, b) => {
            if (sortBy === "newest") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            if (sortBy === "oldest") return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
            if (sortBy === "name-asc") return (a.firstName || a.name || "").localeCompare(b.firstName || b.name || "");
            if (sortBy === "name-desc") return (b.firstName || b.name || "").localeCompare(a.firstName || a.name || "");
            if (sortBy === "credit-high") return (b.creditBalance || 0) - (a.creditBalance || 0);
            if (sortBy === "credit-low") return (a.creditBalance || 0) - (b.creditBalance || 0);
            return 0;
        });

        return result;
    }, [users, viewMode, searchQuery, sortBy]);

    const handleExportCSV = () => {
        const data = processedUsers.map(u => ({
            Name: u.firstName ? `${u.firstName} ${u.lastName || ""}` : (u.name || u.email),
            Email: u.email,
            Phone: u.phone || "N/A",
            Role: u.role,
            Status: u.isActive ? "Active" : "Inactive",
            Credit: u.creditBalance || 0,
            Joined: new Date(u.createdAt || "").toLocaleDateString()
        }));
        exportToCSV(data, `Users_${viewMode}_${new Date().toISOString().split('T')[0]}`);
    };

    const handleExportPDF = () => {
        const headers = ["Name", "Email", "Phone", "Role", "Status", "Credit", "Joined"];
        const data = processedUsers.map(u => ({
            name: u.firstName ? `${u.firstName} ${u.lastName || ""}` : (u.name || u.email),
            email: u.email,
            phone: u.phone || "N/A",
            role: u.role,
            status: u.isActive ? "Active" : "Inactive",
            credit: u.creditBalance || 0,
            joined: new Date(u.createdAt || "").toLocaleDateString()
        }));
        exportToPDF(data, headers, `Users_${viewMode}`, `User Accounts - ${viewMode === 'customers' ? 'Customers' : 'Staff'}`);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account Management</h2>
                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('customers')}
                            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${viewMode === 'customers'
                                ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <Users className="size-4" /> Customers
                        </button>
                        <button
                            onClick={() => setViewMode('staff')}
                            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${viewMode === 'staff'
                                ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <Shield className="size-4" /> Staff Members
                        </button>
                    </div>
                </div>
                {canAdd && (
                    <button
                        onClick={onAddUser}
                        className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-95 shrink-0"
                    >
                        <Plus className="size-4" /> Add {viewMode === 'customers' ? 'User' : 'Staff'}
                    </button>
                )}
            </div>

            <ViewControls
                title={`${viewMode} List`}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                sortBy={sortBy}
                onSort={setSortBy}
                sortOptions={sortOptions}
                onExportCSV={handleExportCSV}
                onExportPDF={handleExportPDF}
                canExport={user?.role === 'super_admin'}
            />

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700">
                {processedUsers.map((u: User) => (
                    <div key={u._id} className="p-4 flex flex-col gap-2">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                                    {u.firstName ? `${u.firstName} ${u.lastName || ''}` : (u.name || u.email.split('@')[0])}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {u.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : u.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                                    {u.role.replace('_', ' ')}
                                </span>
                                {viewMode === 'customers' && (
                                    <span className="flex items-center gap-1 text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                                        <Coins className="size-3 text-amber-500" />{u.creditBalance || 0}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {viewMode === 'customers' && canEdit && (
                                    <button onClick={() => onManageCredit(u)} className="text-amber-500 p-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all" title="Manage Credit">
                                        <Coins className="size-4" />
                                    </button>
                                )}
                                {canEdit && (
                                    <>
                                        <ToggleSwitch isOn={u.isActive} onToggle={() => onToggleStatus(u._id, u.isActive)} />
                                        <button onClick={() => onEditUser(u)} className="text-blue-500 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all">
                                            <Edit className="size-4" />
                                        </button>
                                    </>
                                )}
                                {canDelete && (
                                    <button onClick={() => onDeleteUser(u._id)} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                                        <Trash2 className="size-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {processedUsers.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-sm">No users found.</div>
                )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Status</th>
                            {viewMode === 'customers' && <th className="p-4">Credit</th>}
                            <th className="p-4 text-center w-40">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {processedUsers.map((u: User) => (
                            <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                <td className="p-4 font-medium text-slate-900 dark:text-white">
                                    {u.firstName ? `${u.firstName} ${u.lastName || ''}` : (u.name || u.email.split('@')[0])}
                                </td>
                                <td className="p-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : u.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                                        {u.role.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {u.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                {viewMode === 'customers' && (
                                    <td className="p-4">
                                        <div className="flex items-center gap-1 font-mono font-bold text-slate-700 dark:text-slate-300">
                                            <Coins className="size-3 text-amber-500" />{u.creditBalance || 0}
                                        </div>
                                    </td>
                                )}
                                <td className="p-4 flex justify-center items-center gap-2">
                                    {viewMode === 'customers' && canEdit && (
                                        <button onClick={() => onManageCredit(u)} className="text-amber-500 hover:text-amber-700 p-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all hover:scale-110" title="Manage Credit">
                                            <Coins className="size-4" />
                                        </button>
                                    )}
                                    {canEdit && (
                                        <>
                                            <ToggleSwitch isOn={u.isActive} onToggle={() => onToggleStatus(u._id, u.isActive)} />
                                            <button onClick={() => onEditUser(u)} className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all hover:scale-110">
                                                <Edit className="size-4" />
                                            </button>
                                        </>
                                    )}
                                    {canDelete && (
                                        <button onClick={() => onDeleteUser(u._id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all hover:scale-110">
                                            <Trash2 className="size-4" />
                                        </button>
                                    )}
                                    {!canEdit && !canDelete && (
                                        <span className="text-slate-400 italic text-sm">View Only</span>
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

export default UsersView;
