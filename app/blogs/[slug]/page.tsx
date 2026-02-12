"use client";

import React, { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import { Calendar, User, ArrowLeft, Loader2, Tag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchBlog();
    }, [resolvedParams.slug]);

    const fetchBlog = async () => {
        try {
            const { data } = await api.get(`/blogs/slug/${resolvedParams.slug}`);
            setBlog(data);
        } catch (error) {
            console.error("Failed to fetch blog", error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="animate-spin text-teal-600 size-10" />
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Blog Not Found</h1>
                <p className="text-slate-600 dark:text-slate-400 mb-8">The blog post you're looking for doesn't exist.</p>
                <Link
                    href="/blogs"
                    className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors"
                >
                    <ArrowLeft className="size-5" />
                    Back to Blogs
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-16">
            <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                {/* Back Button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                >
                    <Link
                        href="/blogs"
                        className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors font-medium"
                    >
                        <ArrowLeft className="size-5" />
                        Back to all blogs
                    </Link>
                </motion.div>

                {/* Blog Content */}
                <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700"
                >
                    {/* Hero Image */}
                    {blog.image && (
                        <div className="relative h-64 md:h-96 overflow-hidden bg-slate-100 dark:bg-slate-900">
                            <img
                                src={blog.image}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-6 md:p-10">
                        {/* Tags */}
                        {blog.tags && blog.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {blog.tags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-lg text-sm font-medium"
                                    >
                                        <Tag className="size-3" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                            {blog.title}
                        </h1>

                        {/* Meta Information */}
                        <div className="flex flex-wrap items-center gap-6 text-slate-600 dark:text-slate-400 mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                                <User className="size-5" />
                                <span className="font-medium">{blog.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="size-5" />
                                <span>{new Date(blog.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</span>
                            </div>
                        </div>

                        {/* Blog Content */}
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {blog.content}
                            </div>
                        </div>

                        {/* Updated Date */}
                        {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
                            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                                <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                                    Last updated: {new Date(blog.updatedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.article>

                {/* Back to Blogs Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8 text-center"
                >
                    <Link
                        href="/blogs"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <ArrowLeft className="size-5" />
                        View All Blogs
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
