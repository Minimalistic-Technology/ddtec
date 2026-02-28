"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2, Coins, Users, Shield } from "lucide-react";
import ToggleSwitch from "../ToggleSwitch";
import { User } from "@/lib/types";

interface UsersViewProps {
    users: User[];
    onAddUser: () => void;
    onEditUser: (user: User) => void;
    onDeleteUser: (id: string) => void;
    onToggleStatus: (id: string, currentStatus: boolean) => void;
    onManageCredit: (user: User) => void;
    user: User | null;
    canEdit?: boolean;
}

const UsersView = ({
    users,
    onAddUser,
    onEditUser,
    onDeleteUser,
    onToggleStatus,
    onManageCredit,
    user,
    canEdit = false
}: UsersViewProps) => {
    const [viewMode, setViewMode] = useState<'customers' | 'staff'>('customers');

    const filteredUsers = users.filter(u => viewMode === 'customers' ? u.role === 'user' : u.role !== 'user');

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
                {canEdit && (
                    <button
                        onClick={onAddUser}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors shrink-0"
                    >
                        <Plus className="size-4" /> Add {viewMode === 'customers' ? 'User' : 'Staff'}
                    </button>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Status</th>
                            {viewMode === 'customers' && <th className="p-4">Credit</th>}
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filteredUsers.map(u => (
                            <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                <td className="p-4 font-medium text-slate-900 dark:text-white">
                                    {u.firstName ? `${u.firstName} ${u.lastName || ''}` : (u.name || u.email.split('@')[0])}
                                </td>
                                <td className="p-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                                        u.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                                            'bg-slate-100 text-slate-700'
                                        }`}>
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
                                            <Coins className="size-3 text-amber-500" />
                                            {u.creditBalance || 0}
                                        </div>
                                    </td>
                                )}
                                {canEdit ? (
                                    <td className="p-4 text-right flex justify-end items-center gap-2">
                                        {viewMode === 'customers' && (
                                            <button
                                                onClick={() => onManageCredit(u)}
                                                className="text-amber-500 hover:text-amber-700 p-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-full transition-colors"
                                                title="Manage Credit"
                                            >
                                                <Coins className="size-4" />
                                            </button>
                                        )}
                                        <ToggleSwitch isOn={u.isActive} onToggle={() => onToggleStatus(u._id, u.isActive)} />
                                        <button
                                            onClick={() => onEditUser(u)}
                                            className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                        >
                                            <Edit className="size-4" />
                                        </button>
                                        <button
                                            onClick={() => onDeleteUser(u._id)}
                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </td>
                                ) : (
                                    <td className="p-4 text-right text-slate-400 italic text-sm">View Only</td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersView;
