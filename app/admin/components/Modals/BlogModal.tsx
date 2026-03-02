"use client";

import React from "react";
import { X, Tag, ImageIcon, User as UserIcon, Loader2, Folder } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Blog } from "@/lib/types";

interface BlogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    editingBlog: Blog | null;
    currentBlog: any;
    setCurrentBlog: React.Dispatch<React.SetStateAction<any>>;
    isSubmitting: boolean;
}

const BlogModal = ({
    isOpen,
    onClose,
    onSubmit,
    editingBlog,
    currentBlog,
    setCurrentBlog,
    isSubmitting
}: BlogModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
                    >
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingBlog ? "Edit Blog Post" : "Compose New Blog"}
                            </h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X className="size-6" />
                            </button>
                        </div>
                        <form onSubmit={onSubmit} className="flex flex-col max-h-[90vh]">
                            <div className="p-6 space-y-4 overflow-y-auto">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Article Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={currentBlog.title || ""}
                                        onChange={(e) => setCurrentBlog({ ...currentBlog, title: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                                        placeholder="e.g. The Future of Cordless Tools"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Author Name</label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                            <input
                                                required
                                                type="text"
                                                value={currentBlog.author || ""}
                                                onChange={(e) => setCurrentBlog({ ...currentBlog, author: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Visual Image URL</label>
                                        <div className="relative">
                                            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                            <input
                                                required
                                                type="text"
                                                value={currentBlog.image || ""}
                                                onChange={(e) => setCurrentBlog({ ...currentBlog, image: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                                                placeholder="https://images.unsplash.com/..."
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags (comma separated)</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                        <input
                                            type="text"
                                            value={currentBlog.tags?.join(', ') || ""}
                                            onChange={(e) => setCurrentBlog({ ...currentBlog, tags: e.target.value.split(',').map(t => t.trim()) })}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                                            placeholder="technology, tools, drill"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Article Content (HTML/Markdown support)</label>
                                    <textarea
                                        required
                                        value={currentBlog.content || ""}
                                        onChange={(e) => setCurrentBlog({ ...currentBlog, content: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-teal-500 h-48 resize-none shadow-inner"
                                        placeholder="Write your article here..."
                                    />
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all border border-slate-200 dark:border-slate-600 active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin size-5" /> : (editingBlog ? 'Update Post' : 'Publish Blog')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BlogModal;
