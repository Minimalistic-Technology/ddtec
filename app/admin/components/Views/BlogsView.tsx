"use client";

import React, { useState, useMemo } from "react";
import { Plus, Edit, Trash2, Folder } from "lucide-react";
import ViewControls from "../ViewControls";
import { Blog } from "@/lib/types";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";

interface BlogsViewProps {
    blogs: Blog[];
    onAddBlog: () => void;
    onEditBlog: (blog: Blog) => void;
    onDeleteBlog: (id: string) => void;
    canAdd?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    user?: any;
}

const BlogsView = ({
    blogs,
    onAddBlog,
    onEditBlog,
    onDeleteBlog,
    canAdd = false,
    canEdit = false,
    canDelete = false,
    user = null
}: BlogsViewProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    const sortOptions = [
        { value: "newest", label: "Newest First" },
        { value: "oldest", label: "Oldest First" },
        { value: "title-asc", label: "Title (A-Z)" },
        { value: "author-asc", label: "Author (A-Z)" },
    ];

    const processedBlogs = useMemo(() => {
        let result = [...blogs];

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(b =>
                b.title.toLowerCase().includes(q) ||
                b.author.toLowerCase().includes(q) ||
                b.tags?.some(t => t.toLowerCase().includes(q))
            );
        }

        result.sort((a, b) => {
            if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (sortBy === "title-asc") return a.title.localeCompare(b.title);
            if (sortBy === "author-asc") return a.author.localeCompare(b.author);
            return 0;
        });

        return result;
    }, [blogs, searchQuery, sortBy]);

    const handleExportCSV = () => {
        const data = processedBlogs.map(b => ({
            Title: b.title,
            Author: b.author,
            Tags: b.tags?.join(', ') || "",
            Slug: b.slug,
            Date: new Date(b.createdAt).toLocaleDateString()
        }));
        exportToCSV(data, `Blogs_${new Date().toISOString().split('T')[0]}`);
    };

    const handleExportPDF = () => {
        const headers = ["Title", "Author", "Tags", "Date"];
        const data = processedBlogs.map(b => ({
            title: b.title,
            author: b.author,
            tags: b.tags?.join(', ') || "",
            date: new Date(b.createdAt).toLocaleDateString()
        }));
        exportToPDF(data, headers, "Blogs_Report", "Blog Posts Management Report");
    };
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Folder className="size-5 text-teal-600" /> Manage Blogs
                </h2>
                {canAdd && (
                    <button
                        onClick={onAddBlog}
                        className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-95"
                    >
                        <Plus className="size-4" /> Add Blog Post
                    </button>
                )}
            </div>

            <ViewControls
                title="Blog Articles"
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
                            <th className="p-4">Title</th>
                            <th className="p-4">Author</th>
                            <th className="p-4">Tags</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 text-center w-40">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {processedBlogs.map((b) => (
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
                                <td className="p-4 flex justify-center items-center gap-2">
                                    {canEdit && (
                                        <button
                                            onClick={() => onEditBlog(b)}
                                            className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all hover:scale-110"
                                            title="Edit Blog"
                                        >
                                            <Edit className="size-4" />
                                        </button>
                                    )}
                                    {canDelete && (
                                        <button
                                            onClick={() => onDeleteBlog(b._id)}
                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all hover:scale-110"
                                            title="Delete Blog"
                                        >
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

export default BlogsView;
