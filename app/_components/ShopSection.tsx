"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HardHat, Plus, X, Search, Filter, Loader2 } from "lucide-react";
import { useAuth } from "../_context/AuthContext";
import { useCart } from "../_context/CartContext";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Category, Product } from "@/lib/types";
import { getCategoryDescendants } from "@/lib/utils";

// Sub-components
import SidebarCategoryItem from "./Shop/SidebarCategoryItem";
import ProductCard from "./Shop/ProductCard";
import AddProductModal from "./Shop/AddProductModal";
import { useComponentSettings } from "../_context/ComponentSettingsContext";

export default function ShopSection() {
    const { settings } = useComponentSettings();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category') || "All";

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state

    // Filters & Sort State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [sortOption, setSortOption] = useState("default");

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
            const priceA = Number(a.price);
            const priceB = Number(b.price);
            if (sortOption === "price-low") return priceA - priceB;
            if (sortOption === "price-high") return priceB - priceA;
            return 0;
        });

    const handleAddProduct = async (newProduct: any) => {
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
            }
        } catch (error: any) {
            console.error("Failed to add product", error);
            alert(`Error: ${error.response?.data?.msg || 'Failed to add product'}`);
            throw error; // Re-throw to allow modal to handle loading state
        }
    };

    const isSuperAdmin = user?.role === 'super_admin';
    if (!settings.ShopSection && !isSuperAdmin) return null;

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

                        {/* Filter Toggle (Mobile) */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <Filter className="size-5" />
                        </button>

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
                    <AnimatePresence>
                        {isSidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsSidebarOpen(false)}
                                className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                            />
                        )}
                    </AnimatePresence>

                    <aside className={`fixed inset-y-0 left-0 z-[60] w-72 bg-white dark:bg-slate-900 p-6 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 lg:w-64 lg:p-0 lg:shadow-none lg:bg-transparent ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <div className="flex items-center justify-between mb-6 lg:hidden">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Filters</h3>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-2 -mr-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-2xl lg:p-6 lg:border lg:border-slate-200 lg:dark:border-slate-800 lg:shadow-sm h-full overflow-y-auto lg:h-auto">
                            <div className="flex items-center gap-2 mb-4 hidden lg:flex">
                                <Filter className="size-5 text-teal-600" />
                                <h3 className="font-bold text-slate-900 dark:text-white">Categories</h3>
                            </div>
                            <div className="space-y-2">
                                <button
                                    onClick={() => { handleCategoryChange("All"); setIsSidebarOpen(false); }}
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
                                        onSelect={(id) => { handleCategoryChange(id); setIsSidebarOpen(false); }}
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
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        addToCart={addToCart}
                                        handleBuyNow={handleBuyNow}
                                    />
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
            <AddProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddProduct}
            />
        </section>
    );
}
