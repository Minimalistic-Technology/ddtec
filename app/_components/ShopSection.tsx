"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HardHat, Bell, Plus, X, Image as ImageIcon, Tag, DollarSign, Loader2, ShoppingBag, Search, Filter, Star, TrendingUp, Layers, ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "../_context/AuthContext";
import { useCart } from "../_context/CartContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

interface Category {
    _id: string;
    name: string;
    slug: string;
    parent?: string;
}

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: any; // Can be string or populated object
    stock: number;
    rating: number;
    numReviews: number;
    lastMonthSales: number;
    brand?: string;
    modelName?: string;
    isActive: boolean;
}

// Helper to get all descendant category IDs (recursive)
const getCategoryDescendants = (categoryId: string, allCategories: Category[]): string[] => {
    const children = allCategories.filter(c => c.parent === categoryId || (c.parent as any)?._id === categoryId);
    let ids = [categoryId];
    children.forEach(child => {
        ids = [...ids, ...getCategoryDescendants(child._id, allCategories)];
    });
    return ids;
};

// Recursive Sidebar Item
const SidebarCategoryItem = ({
    category,
    allCategories,
    selectedCategory,
    onSelect,
    depth = 0
}: {
    category: Category,
    allCategories: Category[],
    selectedCategory: string,
    onSelect: (id: string) => void,
    depth?: number
}) => {
    const children = allCategories.filter(c => c.parent === category._id || (c.parent as any)?._id === category._id);
    const isSelected = selectedCategory === (category.slug || category._id) || selectedCategory === category._id;

    // Auto-expand if selected category is a descendant
    const [isExpanded, setIsExpanded] = useState(false);

    // Effect to auto-expand if a child is selected
    useEffect(() => {
        if (isSelected) {
            setIsExpanded(true);
        } else {
            // Check if any descendant is selected
            const descendants = getCategoryDescendants(category._id, allCategories);
            if (descendants.some(id => id === selectedCategory || allCategories.find(c => c._id === id)?.slug === selectedCategory)) {
                setIsExpanded(true);
            }
        }
    }, [selectedCategory, category._id, allCategories, isSelected]);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="flex flex-col">
            <div className={`flex items-center justify-between w-full rounded-lg transition-colors ${isSelected
                ? "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
            >
                <button
                    onClick={() => onSelect(category.slug || category._id)}
                    className="flex-1 text-left px-3 py-1.5 text-sm font-medium truncate"
                    style={{ paddingLeft: `${depth * 12 + 12}px` }}
                >
                    {category.name}
                </button>
                {children.length > 0 && (
                    <button
                        onClick={handleToggle}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md mr-1"
                    >
                        {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                    </button>
                )}
            </div>

            {children.length > 0 && isExpanded && (
                <div className="flex flex-col mt-0.5 animate-in slide-in-from-top-2 duration-200">
                    {children.map(child => (
                        <SidebarCategoryItem
                            key={child._id}
                            category={child}
                            allCategories={allCategories}
                            selectedCategory={selectedCategory}
                            onSelect={onSelect}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function ShopSection() {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category') || "All";

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filters & Sort State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [sortOption, setSortOption] = useState("default");

    // Form State
    const [newProduct, setNewProduct] = useState({
        name: "",
        price: "",
        description: "",
        image: "",
        category: "",
        stock: "",
        rating: "",
        lastMonthSales: "",
        brand: "",
        modelName: "",
        couponCode: "",
        discountPercentage: ""
    });


    const fetchProducts = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories')
            ]);
            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Update selectedCategory when URL changes
    useEffect(() => {
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
            setSelectedCategory(categoryParam);
        }
    }, [searchParams]);

    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategory(categoryId);
        if (categoryId === "All") {
            router.push('/shop');
        } else {
            router.push(`/shop?category=${categoryId}`);
        }
    };

    const handleBuyNow = async (productId: string) => {
        await addToCart(productId);
        router.push('/cart');
    };

    const filteredProducts = products
        .filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase());

            let matchesCategory = true;
            if (selectedCategory !== "All") {
                // Resolve selectedCategory (which might be a slug) to an ID
                const targetCategory = categories.find(c => c.slug === selectedCategory || c._id === selectedCategory);
                const targetId = targetCategory ? targetCategory._id : selectedCategory;

                // Get all relevant category IDs (selected + all descendants)
                const relevantCategoryIds = getCategoryDescendants(targetId, categories);

                const productCatId = typeof product.category === 'object' ? product.category._id : product.category;

                // Match if product belongs to any of the relevant categories
                matchesCategory = relevantCategoryIds.includes(productCatId);
            }

            const matchesActivity = product.isActive !== false;

            return matchesSearch && matchesCategory && matchesActivity;
        })
        .sort((a, b) => {
            if (sortOption === "price-low") return a.price - b.price;
            if (sortOption === "price-high") return b.price - a.price;
            return 0;
        });

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post('/products', {
                ...newProduct,
                price: Number(newProduct.price),
                stock: Number(newProduct.stock),
                rating: Number(newProduct.rating) || 0,
                lastMonthSales: Number(newProduct.lastMonthSales) || 0,
                brand: newProduct.brand,
                modelName: newProduct.modelName,
                couponCode: newProduct.couponCode || undefined,
                discountPercentage: Number(newProduct.discountPercentage) || 0
            });

            if (res.status === 200 || res.status === 201) {
                fetchProducts();
                setIsModalOpen(false);
                setNewProduct({ name: "", price: "", description: "", image: "", category: "", stock: "", rating: "", lastMonthSales: "", brand: "", modelName: "", couponCode: "", discountPercentage: "" });
            }
        } catch (error: any) {
            console.error("Failed to add product", error);
            alert(`Error: ${error.response?.data?.msg || 'Failed to add product'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="shop" className="py-24 min-h-[80vh] flex flex-col items-center justify-start bg-slate-50 dark:bg-slate-950 relative overflow-hidden px-6">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 text-9xl opacity-5 dark:opacity-[0.02] rotate-12">🛠️</div>
                <div className="absolute bottom-20 right-10 text-9xl opacity-5 dark:opacity-[0.02] -rotate-12">⚙️</div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <div className="text-center md:text-left">
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Our Products</h2>
                        <p className="text-slate-600 dark:text-slate-400">Quality tools for professional results</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                            <input
                                type="text"
                                placeholder="Search tools..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full md:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>

                        {/* Filter Dropdown - HIDDEN on Desktop (moved to sidebar), visible on mobile if needed or just rely on sidebar */}
                        {/* <div className="relative md:hidden">
                           ... mobile filter could go here ...
                        </div> */}

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="w-full md:w-40 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer"
                            >
                                <option value="default">Sort By</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                            </select>
                        </div>

                        {user?.role === 'admin' && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-teal-500/30 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="size-5" /> Add
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Filter className="size-5 text-teal-600" />
                                <h3 className="font-bold text-slate-900 dark:text-white">Categories</h3>
                            </div>
                            <div className="space-y-2">
                                <button
                                    onClick={() => handleCategoryChange("All")}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === "All"
                                        ? "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                        }`}
                                >
                                    All Products
                                </button>
                                {categories.filter(c => !c.parent).map(category => (
                                    <SidebarCategoryItem
                                        key={category._id}
                                        category={category}
                                        allCategories={categories}
                                        selectedCategory={selectedCategory}
                                        onSelect={handleCategoryChange}
                                    />
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <main className="flex-1">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin text-teal-600"><Loader2 className="size-10" /></div>
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
                                    <motion.div
                                        key={product._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4 }}
                                        className={`group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden ${product.stock === 0 ? 'opacity-75 grayscale' : ''}`}
                                    >
                                        {/* Image Container */}
                                        <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100 dark:bg-slate-800 p-4">
                                            {product.image ? (
                                                <img
                                                    src={product.image.startsWith('http') || product.image.startsWith('/') ? product.image : `/${product.image}`}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                                                    <ImageIcon className="size-10" />
                                                </div>
                                            )}

                                            {/* Price Badge */}
                                            <div className="absolute top-2 right-2 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-lg border border-slate-100 dark:border-slate-800 z-10 hover:scale-105 transition-transform">
                                                <span className="text-teal-600 font-bold text-xs sm:text-sm">₹{product.price}</span>
                                            </div>

                                            {/* Sales Badges */}
                                            <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
                                                {product.lastMonthSales > 50 && (
                                                    <div className="bg-teal-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1 border border-teal-400/30">
                                                        <Star className="size-3 fill-current" />
                                                        BESTSELLER
                                                    </div>
                                                )}
                                            </div>

                                            {/* Overlay Actions (Desktop) */}
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                                <Link
                                                    href={`/product/${product._id}`}
                                                    className="size-10 bg-white text-slate-700 rounded-full flex items-center justify-center shadow-xl hover:bg-teal-50 hover:text-teal-600 hover:scale-110 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                                                    title="View Details"
                                                >
                                                    <Search className="size-5" />
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4 flex flex-col flex-1">
                                            <div className="mb-1">
                                                <Link href={`/product/${product._id}`} className="block group-hover:text-teal-600 transition-colors">
                                                    <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg line-clamp-1" title={product.name}>
                                                        {product.name}
                                                    </h3>
                                                </Link>
                                            </div>

                                            <div className="flex items-center gap-1.5 mb-2.5">
                                                <div className="flex items-center text-amber-400">
                                                    <Star className="size-3.5 fill-current" />
                                                    <span className="ml-1 text-xs font-bold text-slate-700 dark:text-slate-300">{product.rating || 0}</span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">• ({product.numReviews || 0})</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mt-auto">
                                                <button
                                                    disabled={product.stock === 0}
                                                    onClick={() => addToCart(product._id)}
                                                    className="group/btn py-2 px-3 rounded-lg font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                                                >
                                                    <ShoppingBag className="size-3.5" /> Add
                                                </button>
                                                <button
                                                    disabled={product.stock === 0}
                                                    onClick={() => handleBuyNow(product._id)}
                                                    className="py-2 px-3 rounded-lg font-bold text-xs bg-teal-600 text-white shadow-md hover:bg-teal-700 transition-all flex items-center justify-center disabled:opacity-50"
                                                >
                                                    Buy Now
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-20"
                            >
                                <div className="mb-8 inline-flex p-6 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600 dark:text-yellow-500">
                                    <HardHat className="size-16" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Products Found</h3>
                                <p className="text-slate-600 dark:text-slate-400">Try adjusting your search or filters.</p>
                                {(searchQuery || selectedCategory !== "All") && (
                                    <button
                                        onClick={() => { setSearchQuery(""); handleCategoryChange("All"); }}
                                        className="mt-6 text-teal-600 font-bold hover:underline"
                                    >
                                        Clear all filters
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </main>
                </div>
            </div>

            {/* Add Product Modal */}
            <AnimatePresence>
                {
                    isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                            >
                                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add New Product</h3>
                                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                        <X className="size-6" />
                                    </button>
                                </div>
                                <form onSubmit={handleAddProduct} className="flex flex-col max-h-[90vh]">
                                    <div className="p-6 space-y-4 overflow-y-auto">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                                            <div className="relative">
                                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                                <input
                                                    required
                                                    type="text"
                                                    value={newProduct.name}
                                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    placeholder="e.g. Cordless Drill"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price (₹)</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                                    <input
                                                        required
                                                        type="number"
                                                        value={newProduct.price}
                                                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stock</label>
                                                <input
                                                    required
                                                    type="number"
                                                    value={newProduct.stock}
                                                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    placeholder="100"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rating (0-5)</label>
                                                <div className="relative">
                                                    <Star className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="5"
                                                        step="0.1"
                                                        value={newProduct.rating}
                                                        onChange={(e) => setNewProduct({ ...newProduct, rating: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                        placeholder="4.5"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Month Sales</label>
                                                <input
                                                    type="number"
                                                    value={newProduct.lastMonthSales}
                                                    onChange={(e) => setNewProduct({ ...newProduct, lastMonthSales: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    placeholder="e.g. 120"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Coupon Code</label>
                                                <input
                                                    type="text"
                                                    value={newProduct.couponCode}
                                                    onChange={(e) => setNewProduct({ ...newProduct, couponCode: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    placeholder="e.g. SAVE10"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discount (%)</label>
                                                <input
                                                    type="number"
                                                    value={newProduct.discountPercentage}
                                                    onChange={(e) => setNewProduct({ ...newProduct, discountPercentage: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    placeholder="10"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                            <select
                                                value={newProduct.category}
                                                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                            >
                                                <option value="" disabled>Select Category</option>
                                                <option value="Drill Bits">Drill Bits</option>
                                                <option value="Wood Cutter">Wood Cutter</option>
                                                <option value="Grinding Tools">Grinding Tools</option>
                                                <option value="Fasteners">Fasteners</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
                                            <div className="relative">
                                                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                                <input
                                                    type="text"
                                                    value={newProduct.image}
                                                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    placeholder="https://example.com/image.jpg"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                            <textarea
                                                value={newProduct.description}
                                                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none h-24 resize-none"
                                                placeholder="Product details..."
                                            />
                                        </div>
                                    </div>
                                    <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Create Product'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence>
        </section>
    );
}
