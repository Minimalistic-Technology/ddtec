import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Folder, ChevronRight, X, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
    _id: string;
    name: string;
    slug: string;
    parent?: { _id: string; name: string } | null;
    description?: string;
    image?: string;
}

const CategoriesView = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        parent: '',
        description: '',
        image: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingCategory) {
                await api.put(`/categories/${editingCategory._id}`, formData);
                alert("Category updated successfully");
            } else {
                await api.post('/categories', formData);
                alert("Category created successfully");
            }
            fetchCategories();
            handleCloseModal();
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.msg || "Failed to save category");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return;
        try {
            await api.delete(`/categories/${id}`);
            setCategories(prev => prev.filter(c => c._id !== id));
        } catch (error) {
            console.error(error);
            alert("Failed to delete category");
        }
    };

    const handleEditClick = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            parent: category.parent?._id || '',
            description: category.description || '',
            image: category.image || ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', parent: '', description: '', image: '' });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Folder className="size-6 text-teal-600" />
                    Categories
                </h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                    <Plus className="size-4" /> Add Category
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-teal-600 size-8" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <div key={category._id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{category.name}</h3>
                                    {category.parent && (
                                        <div className="flex items-center text-sm text-slate-500 mt-1">
                                            <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs">
                                                Sub of: {category.parent.name}
                                            </span>
                                        </div>
                                    )}
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 line-clamp-2">
                                        {category.description || "No description"}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEditClick(category)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                        <Edit className="size-4" />
                                    </button>
                                    <button onClick={() => handleDelete(category._id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                                </h3>
                                <button onClick={handleCloseModal} className="text-slate-400 hover:text-red-500 transition-colors">
                                    <X className="size-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-teal-500 focus:border-teal-500 p-2.5 border"
                                        placeholder="e.g., Electronics"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Parent Category (Optional)</label>
                                    <select
                                        value={formData.parent}
                                        onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-teal-500 focus:border-teal-500 p-2.5 border"
                                    >
                                        <option value="">None (Root Category)</option>
                                        {categories
                                            .filter(c => c._id !== editingCategory?._id) // Prevent self-parenting
                                            .map(c => (
                                                <option key={c._id} value={c._id}>{c.name}</option>
                                            ))
                                        }
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-teal-500 focus:border-teal-500 p-2.5 border"
                                        rows={3}
                                        placeholder="Category description..."
                                    />
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:ring-4 focus:ring-teal-300 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin size-4" /> : null}
                                        {editingCategory ? 'Update Category' : 'Create Category'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CategoriesView;
