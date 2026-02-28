"use client";

import React from "react";
import { Mail, Trash2 } from "lucide-react";
import { Message } from "@/lib/types";

interface MessagesViewProps {
    messages: Message[];
    onDeleteMessage: (id: string) => void;
}

const MessagesView = ({
    messages,
    onDeleteMessage
}: MessagesViewProps) => {
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
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                        <tr>
                            <th className="p-4">Date</th>
                            <th className="p-4">Sender</th>
                            <th className="p-4">Content</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {messages.map((m) => (
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
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => onDeleteMessage(m._id)}
                                        className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete Message"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MessagesView;
