"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, User, ArrowRight, Loader2, Tag } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface Blog {
    _id: string;
    title: string;
    content: string;
    author: string;
    image: string;
    slug: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export default function BlogsPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const { data } = await api.get('/blogs');
            setBlogs(data);
        } catch (error) {
            console.error("Failed to fetch blogs", error);
        } finally {
            setLoading(false);
        }
    };

    const getExcerpt = (content: string, maxLength: number = 150) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength).trim() + '...';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="animate-spin text-teal-600 size-10" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-16">
            <div className="container mx-auto px-4 md:px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                        Our Blog
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Insights, tips, and updates from the world of tools and technology
                    </p>
                </motion.div>

                {/* Blog Grid */}
                {blogs.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-slate-500 dark:text-slate-400 text-lg">
                            No blogs published yet. Check back soon!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map((blog, index) => (
                            <motion.div
                                key={blog._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link href={`/blogs/${blog.slug}`}>
                                    <div className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 h-full flex flex-col">
                                        {/* Image */}
                                        {blog.image && (
                                            <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-900">
                                                <img
                                                    src={blog.image}
                                                    alt={blog.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="p-6 flex-1 flex flex-col">
                                            {/* Tags */}
                                            {blog.tags && blog.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {blog.tags.slice(0, 3).map((tag, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-lg text-xs font-medium"
                                                        >
                                                            <Tag className="size-3" />
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Title */}
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                                                {blog.title}
                                            </h2>

                                            {/* Excerpt */}
                                            <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 flex-1">
                                                {getExcerpt(blog.content)}
                                            </p>

                                            {/* Meta */}
                                            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-700">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1">
                                                        <User className="size-4" />
                                                        <span>{blog.author}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="size-4" />
                                                        <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <ArrowRight className="size-5 text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
