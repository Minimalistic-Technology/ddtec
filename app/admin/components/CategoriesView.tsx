import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, Folder, ChevronRight, X, Loader2, Search, LayoutGrid, List, ChevronDown } from 'lucide-react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import ViewControls from "./ViewControls";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";

interface Category {
    _id: string;
    name: string;
    slug: string;
    parent?: { _id: string; name: string } | null;
    image?: string;
}

const CategoryItem = ({
    category,
    viewType,
    hasSubs,
    isExpanded,
    onToggle,
    onEdit,
    onDelete,
    isSub,
    canEdit = false,
    canDelete = false
}: {
    category: Category;
    viewType: 'grid' | 'list';
    hasSubs?: boolean;
    isExpanded?: boolean;
    onToggle?: () => void;
    onEdit: (c: Category) => void;
    onDelete: (id: string) => void;
    isSub?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
}) => {
    if (viewType === 'grid') {
        return (
            <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3.5 hover:shadow-md transition-all group ${isSub ? 'scale-95' : ''}`}>
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg ${isSub ? 'bg-teal-50 dark:bg-teal-900/20' : 'bg-slate-50 dark:bg-slate-900'}`}>
                            {isSub ? <ChevronRight className="size-3.5 text-teal-600" /> : <Folder className="size-4 text-teal-600" />}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors line-clamp-1">{category.name}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{isSub ? 'Sub' : 'Root'}</p>
                        </div>
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canEdit && (
                            <button onClick={() => onEdit(category)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all hover:scale-110">
                                <Edit className="size-3.5" />
                            </button>
                        )}
                        {canDelete && (
                            <button onClick={() => onDelete(category._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all hover:scale-110">
                                <Trash2 className="size-3.5" />
                            </button>
                        )}
                        {!canEdit && !canDelete && (
                            <span className="text-[10px] text-slate-400 italic">View Only</span>
                        )}
                    </div>
                </div>

                {hasSubs && (
                    <button
                        onClick={onToggle}
                        className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-slate-900/50 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-all border border-transparent hover:border-teal-100 dark:hover:border-teal-900/30"
                    >
                        <span>{isExpanded ? 'Hide' : 'View Sub-categories'}</span>
                        <ChevronDown className={`size-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-2 hover:shadow-sm transition-all group flex items-center justify-between ${isSub ? 'bg-slate-50/50 dark:bg-slate-900/30 ml-6' : ''}`}>
            <div className="flex items-center gap-3 flex-1">
                {hasSubs ? (
                    <button
                        onClick={onToggle}
                        className={`p-1 rounded-lg transition-all ${isExpanded ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200'}`}
                    >
                        <ChevronRight className={`size-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                ) : (
                    <div className="w-6 flex justify-center">
                        <div className={`size-1 rounded-full ${isSub ? 'bg-teal-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors uppercase text-xs tracking-tight">{category.name}</h3>
                    {!isSub && <span className="text-[9px] px-1 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 font-bold uppercase tracking-tighter">Root</span>}
                </div>
            </div>

            <div className="flex items-center gap-1">
                {canEdit && (
                    <button onClick={() => onEdit(category)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                        <Edit className="size-3.5" />
                    </button>
                )}
                {canDelete && (
                    <button onClick={() => onDelete(category._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                        <Trash2 className="size-3.5" />
                    </button>
                )}
                {!canEdit && !canDelete && (
                    <span className="text-[10px] text-slate-400 italic">View Only</span>
                )}
            </div>
        </div>
    );
};

const CategoriesView = ({
    canAdd = false,
    canEdit = false,
    canDelete = false,
    user = null
}: {
    canAdd?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    user?: any;
}) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc'>('name-asc');
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());

    const [formData, setFormData] = useState({
        name: '',
        parent: '',
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
            image: category.image || ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', parent: '', image: '' });
    };

    const toggleParent = (id: string) => {
        setExpandedParents(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const sortedAndFilteredCategories = useMemo(() => {
        let result = [...categories];

        // Search
        if (searchQuery) {
            result = result.filter(c =>
                c.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
            if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
            return 0;
        });

        return result;
    }, [categories, searchQuery, sortBy]);

    const rootCategories = useMemo(() => {
        return sortedAndFilteredCategories.filter(c => !c.parent);
    }, [sortedAndFilteredCategories]);

    const getSubCategories = (parentId: string) => {
        return sortedAndFilteredCategories.filter(c => c.parent?._id === parentId);
    };

    const handleExportCSV = () => {
        const data = sortedAndFilteredCategories.map(c => ({
            Name: c.name,
            Slug: c.slug,
            Parent: c.parent ? c.parent.name : "None",
            ID: c._id
        }));
        exportToCSV(data, `Categories_${new Date().toISOString().split('T')[0]}`);
    };

    const handleExportPDF = () => {
        const headers = ["Category Name", "Slug", "Parent Category"];
        const data = sortedAndFilteredCategories.map(c => ({
            name: c.name,
            slug: c.slug,
            parent: c.parent ? c.parent.name : "None"
        }));
        exportToPDF(data, headers, "Categories_Hierarchy_Report", "Product Categories Management Report");
    };

    const sortOptions = [
        { value: "name-asc", label: "Name (A-Z)" },
        { value: "name-desc", label: "Name (Z-A)" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Folder className="size-6 text-teal-600" />
                        Categories Management
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Organize and manage your product categories and hierarchy</p>
                </div>
                {canAdd && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-95 font-bold"
                    >
                        <Plus className="size-4" /> Add Category
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
                <ViewControls
                    title="Category Filters"
                    searchQuery={searchQuery}
                    onSearch={setSearchQuery}
                    sortBy={sortBy}
                    onSort={(val) => setSortBy(val as any)}
                    sortOptions={sortOptions}
                    onExportCSV={handleExportCSV}
                    onExportPDF={handleExportPDF}
                    canExport={user?.role === 'super_admin'}
                    noBorder
                >
                    <div className="flex items-center bg-slate-100 dark:bg-slate-900/50 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
                        <button
                            onClick={() => setViewType('grid')}
                            className={`p-2 rounded-lg transition-all ${viewType === 'grid' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            title="Grid View"
                        >
                            <LayoutGrid className="size-4" />
                        </button>
                        <button
                            onClick={() => setViewType('list')}
                            className={`p-2 rounded-lg transition-all ${viewType === 'list' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            title="List View"
                        >
                            <List className="size-4" />
                        </button>
                    </div>
                </ViewControls>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-teal-600 size-8" /></div>
            ) : rootCategories.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="bg-slate-50 dark:bg-slate-900 size-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Folder className="size-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Categories Found</h3>
                    <p className="text-slate-500">Try adjusting your search or add a new category.</p>
                </div>
            ) : (
                <div className={viewType === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    {rootCategories.map((category) => {
                        const subs = getSubCategories(category._id);
                        const isExpanded = expandedParents.has(category._id);

                        return (
                            <div key={category._id} className={`${viewType === 'grid' ? '' : 'w-full'}`}>
                                <CategoryItem
                                    category={category}
                                    viewType={viewType}
                                    hasSubs={subs.length > 0}
                                    isExpanded={isExpanded}
                                    onToggle={() => toggleParent(category._id)}
                                    onEdit={handleEditClick}
                                    onDelete={handleDelete}
                                    canEdit={canEdit}
                                    canDelete={canDelete}
                                />

                                <AnimatePresence>
                                    {isExpanded && subs.length > 0 && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className={`${viewType === 'grid' ? 'mt-2 ml-6 space-y-2 border-l-2 border-teal-100 dark:border-teal-900/30 pl-6' : 'mt-1 ml-10 space-y-1'}`}>
                                                {subs.map(sub => (
                                                    <CategoryItem
                                                        key={sub._id}
                                                        category={sub}
                                                        viewType={viewType}
                                                        isSub
                                                        onEdit={handleEditClick}
                                                        onDelete={handleDelete}
                                                        canEdit={canEdit}
                                                        canDelete={canDelete}
                                                    />
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
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
