"use client";

import React, { useState, useMemo } from "react";
import { Mail, Trash2 } from "lucide-react";
import ViewControls from "../ViewControls";
import { Message } from "@/lib/types";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";

interface MessagesViewProps {
    messages: Message[];
    onDeleteMessage: (id: string) => void;
    canDelete?: boolean;
    user?: any;
}

const MessagesView = ({
    messages,
    onDeleteMessage,
    canDelete = true,
    user = null
}: MessagesViewProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    const sortOptions = [
        { value: "newest", label: "Newest First" },
        { value: "oldest", label: "Oldest First" },
        { value: "name-asc", label: "Sender Name (A-Z)" },
    ];

    const processedMessages = useMemo(() => {
        let result = [...messages];

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(m =>
                m.firstName.toLowerCase().includes(q) ||
                m.lastName.toLowerCase().includes(q) ||
                m.email.toLowerCase().includes(q) ||
                m.message.toLowerCase().includes(q)
            );
        }

        result.sort((a, b) => {
            if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (sortBy === "name-asc") return a.firstName.localeCompare(b.firstName);
            return 0;
        });

        return result;
    }, [messages, searchQuery, sortBy]);

    const handleExportCSV = () => {
        const data = processedMessages.map(m => ({
            Date: new Date(m.createdAt).toLocaleString(),
            FirstName: m.firstName,
            LastName: m.lastName,
            Email: m.email,
            Message: m.message
        }));
        exportToCSV(data, `Messages_${new Date().toISOString().split('T')[0]}`);
    };

    const handleExportPDF = () => {
        const headers = ["Date", "Sender", "Email", "Message"];
        const data = processedMessages.map(m => ({
            date: new Date(m.createdAt).toLocaleDateString(),
            sender: `${m.firstName} ${m.lastName}`,
            email: m.email,
            message: m.message
        }));
        exportToPDF(data, headers, "System_Messages_Report", "Customer System Messages History");
    };
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Mail className="size-5 text-teal-600" /> System Messages
                </h2>
                <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 rounded-full">
                    {messages.length} total
                </span>
            </div>

            <ViewControls
                title="System Inquiries"
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                sortBy={sortBy}
                onSort={setSortBy}
                sortOptions={sortOptions}
                onExportCSV={handleExportCSV}
                onExportPDF={handleExportPDF}
                canExport={user?.role === 'super_admin'}
            />

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                        <tr>
                            <th className="p-4">Date</th>
                            <th className="p-4">Sender</th>
                            <th className="p-4">Content</th>
                            <th className="p-4 text-center w-32">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {processedMessages.length > 0 ? (
                            processedMessages.map((m) => (
                                <tr key={m._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 group">
                                    <td className="p-4 whitespace-nowrap text-xs text-slate-500">
                                        {new Date(m.createdAt).toLocaleString()}
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 dark:text-white">{m.firstName} {m.lastName}</span>
                                            <span className="text-xs text-slate-500">{m.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 max-w-md">
                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                            {m.message}
                                        </p>
                                    </td>
                                    <td className="p-4 flex justify-center">
                                        {canDelete && (
                                            <button
                                                onClick={() => onDeleteMessage(m._id)}
                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                                                title="Delete Message"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="p-12 text-center text-slate-500 italic">
                                    No messages found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MessagesView;
