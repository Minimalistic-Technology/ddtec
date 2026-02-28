"use client";

import React from "react";
import { Plus, Edit, Trash2, Folder } from "lucide-react";
import { Blog } from "@/lib/types";

interface BlogsViewProps {
    blogs: Blog[];
    onAddBlog: () => void;
    onEditBlog: (blog: Blog) => void;
    onDeleteBlog: (id: string) => void;
    canEdit?: boolean;
}

const BlogsView = ({
    blogs,
    onAddBlog,
    onEditBlog,
    onDeleteBlog,
    canEdit = false
}: BlogsViewProps) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Folder className="size-5 text-teal-600" /> Manage Blogs
                </h2>
                {canEdit && (
                    <button
                        onClick={onAddBlog}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors"
                    >
                        <Plus className="size-4" /> Add Blog Post
                    </button>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                        <tr>
                            <th className="p-4">Title</th>
                            <th className="p-4">Author</th>
                            <th className="p-4">Tags</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {blogs.map((b) => (
                            <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                <td className="p-4 font-medium text-slate-900 dark:text-white max-w-xs truncate">
                                    {b.title}
                                </td>
                                <td className="p-4 text-slate-600 dark:text-slate-400">{b.author}</td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1">
                                        {b.tags?.map((t, idx) => (
                                            <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-[10px]">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-4 text-xs text-slate-500">
                                    {new Date(b.createdAt).toLocaleDateString()}
                                </td>
                                {canEdit ? (
                                    <td className="p-4 text-right flex justify-end items-center gap-2">
                                        <button
                                            onClick={() => onEditBlog(b)}
                                            className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                            title="Edit Blog"
                                        >
                                            <Edit className="size-4" />
                                        </button>
                                        <button
                                            onClick={() => onDeleteBlog(b._id)}
                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                            title="Delete Blog"
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

export default BlogsView;
