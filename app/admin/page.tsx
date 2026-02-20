"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../_context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Package, DollarSign, ShoppingBag, Loader2, Trash2, Edit, Plus, X, Tag, Image as ImageIcon, Layers, Ticket, Shield, ChevronLeft, ChevronRight, Mail, Truck, Folder, Coins, Download, Share2, Receipt } from "lucide-react";
import api from "@/lib/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ToggleSwitch from "./components/ToggleSwitch";
import CategoriesView from "./components/CategoriesView";
import DashboardStatsCards from "./components/DashboardStatsCards";
import ProfitChart from "./components/ProfitChart";
import OrderSummaryChart from "./components/OrderSummaryChart";
import StockLevel from "./components/StockLevel";
import UpcomingRestock from "./components/UpcomingRestock";
import TopProducts from "./components/TopProducts";
import RecentActivity from "./components/RecentActivity";

interface DashboardStats {
    users: number;
    products: number;
    revenue: number;
    orders: number;
    recentActivity: Array<{
        _id: string;
        totalAmount: number;
        status: string;
        createdAt: string;
        shippingInfo: { fullName: string };
        user?: { firstName: string; email: string };
    }>;
    stock?: {
        totalStock: number;
        lowStock: number;
        outOfStock: number;
    };
    trends?: { name: string; value: number }[];
    categoryRevenue?: { name: string; value: number }[];
    restock?: { name: string; stock: number }[];
    topProducts?: { name: string; totalSold: number; revenue: number; stock: number }[];
}

interface User {
    _id: string;
    firstName?: string;
    lastName?: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    isActive: boolean;
    creditBalance?: number;
}



interface Product {
    _id: string;
    name: string;
    price: number;
    category: string | { _id: string; name: string };
    stock: number;
    couponCode?: string;
    discountPercentage?: number;
    discountType?: 'percentage' | 'fixed';
    discountValue?: number;
    isActive: boolean;
    showOnHome?: boolean;
    taxes?: { name: string; rate: number }[];
}

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

interface Message {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    message: string;
    createdAt: string;
}

const AdminDashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [activeView, setActiveView] = useState<'dashboard' | 'products' | 'users' | 'orders' | 'inventory' | 'messages' | 'coupons' | 'blogs' | 'categories' | 'billing'>('dashboard');

    // Data for Manage Views
    const [usersList, setUsersList] = useState<User[]>([]);
    const [ordersList, setOrdersList] = useState<any[]>([]);
    const [messagesList, setMessagesList] = useState<Message[]>([]);
    const [couponsList, setCouponsList] = useState<any[]>([]);
    const [blogsList, setBlogsList] = useState<Blog[]>([]);

    const [productsList, setProductsList] = useState<Product[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [categoriesList, setCategoriesList] = useState<any[]>([]);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategoriesList(data);
        } catch (error) { console.error("Failed to fetch categories", error); }
    };

    // Add Product Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: "",
        price: "",
        description: "",
        image: "",
        imagesInput: "",
        category: "",
        stock: "",
        brand: "",
        modelName: "",
        rating: "",
        lastMonthSales: "",
        couponCode: "",
        discountPercentage: "",
        showOnHome: false,
        taxes: [] as { name: string; rate: number }[]
    });

    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [viewingCoupons, setViewingCoupons] = useState<{ productName: string, coupons: any[] } | null>(null);

    // Create User State
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", role: "user" });

    // Edit User State
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    // Edit Order State
    const [isEditOrderModalOpen, setIsEditOrderModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<any>(null);

    // Order Details State
    const [viewingOrder, setViewingOrder] = useState<any>(null);

    // Sidebar State
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Coupon Modal State
    const [isAddCouponModalOpen, setIsAddCouponModalOpen] = useState(false);
    const [isEditCouponModalOpen, setIsEditCouponModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<any>(null);
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        expiresAt: '',
        applicableProducts: [] as string[],
        isActive: true
    });

    // Credit Management State
    const [creditAmount, setCreditAmount] = useState<number | "">("");
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [selectedUserForCredit, setSelectedUserForCredit] = useState<User | null>(null);
    const [isProcessingCredit, setIsProcessingCredit] = useState(false);

    // Blog Modal State
    const [isAddBlogModalOpen, setIsAddBlogModalOpen] = useState(false);
    const [isEditBlogModalOpen, setIsEditBlogModalOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
    const [newBlog, setNewBlog] = useState({
        title: '',
        content: '',
        author: '',
        image: '',
        slug: '',
        tags: [] as string[]
    });

    // Billing State
    const [billingItems, setBillingItems] = useState<any[]>([]);
    const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "", email: "", address: "" });
    const [billingSearchQuery, setBillingSearchQuery] = useState("");
    const [billingSearchResults, setBillingSearchResults] = useState<Product[]>([]);
    const [showBillingSearchResults, setShowBillingSearchResults] = useState(false);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push("/login");
            } else if (user.role !== "admin") {
                router.push("/");
            } else {
                fetchStats();
            }
        }
    }, [user, authLoading, router]);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
        } catch (error) {
            console.error("Failed to fetch admin stats", error);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchMessages = async () => {
        setLoadingData(true);
        try {
            const res = await api.get('/contact');
            setMessagesList(res.data);
        } catch (error) { console.error("Failed to fetch messages", error); }
        finally { setLoadingData(false); }
    };

    const fetchCoupons = async () => {
        setLoadingData(true);
        try {
            const [couponsRes, productsRes] = await Promise.all([
                api.get('/coupons'),
                api.get('/products') // Need products for the create/edit modal dropdowns
            ]);
            setCouponsList(couponsRes.data);
            setProductsList(productsRes.data);
        } catch (error) { console.error("Failed to fetch coupons", error); }
        finally { setLoadingData(false); }
    };

    const fetchBlogs = async () => {
        setLoadingData(true);
        try {
            const { data } = await api.get('/blogs');
            setBlogsList(data);
        } catch (error) {
            console.error("Failed to fetch blogs", error);
        } finally {
            setLoadingData(false);
        }
    };

    const fetchOrders = async () => {
        setLoadingData(true);
        try {
            const res = await api.get('/orders');
            setOrdersList(res.data);
        } catch (error) { console.error("Failed to fetch orders", error); }
        finally { setLoadingData(false); }
    };

    useEffect(() => {
        if (activeView === 'products' || activeView === 'inventory' || activeView === 'billing') fetchProducts();
        if (activeView === 'users') fetchUsers();
        if (activeView === 'orders') fetchOrders();
        if (activeView === 'messages') fetchMessages();
        if (activeView === 'coupons') fetchCoupons();
        if (activeView === 'blogs') fetchBlogs();
    }, [activeView]);

    const fetchUsers = async () => {
        setLoadingData(true);
        try {
            const res = await api.get('/admin/users');
            setUsersList(res.data);
        } catch (error) { console.error(error); }
        finally { setLoadingData(false); }
    };



    const fetchProducts = async () => {
        setLoadingData(true);
        try {
            const [productsRes, couponsRes] = await Promise.all([
                api.get('/products'),
                api.get('/coupons')
            ]);

            const coupons = couponsRes.data;
            const productsWithCoupons = productsRes.data.map((p: any) => {
                // Find ALL applicable coupons for this product
                const activeCoupons = coupons.filter((c: any) =>
                    c.type === 'product' &&
                    c.isActive &&
                    c.applicableProducts &&
                    c.applicableProducts.some((ap: any) => ap._id === p._id || ap === p._id)
                );

                return {
                    ...p,
                    couponDetails: activeCoupons // Now an array
                };
            });

            setProductsList(productsWithCoupons);
        } catch (error) { console.error(error); }
        finally { setLoadingData(false); }
    };



    const handleDeleteUser = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        await api.delete(`/admin/users/${id}`);
        fetchUsers();
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        await api.delete(`/products/${id}`);
        fetchProducts();
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const imageList = newProduct.imagesInput.split(',').map(url => url.trim()).filter(url => url.length > 0);

            const res = await api.post('/products', {
                ...newProduct,
                image: imageList[0] || "",
                images: imageList,
                price: Number(newProduct.price),
                stock: Number(newProduct.stock),
                rating: Number(newProduct.rating) || 0,
                lastMonthSales: Number(newProduct.lastMonthSales) || 0,
                brand: newProduct.brand,
                modelName: newProduct.modelName,
                couponCode: newProduct.couponCode || undefined,
                company: newProduct.brand, // Assuming company was meant to be brand

                discountPercentage: Number(newProduct.discountPercentage) || 0,
                showOnHome: newProduct.showOnHome
            });

            if (res.status === 200 || res.status === 201) {
                fetchProducts();
                setIsAddModalOpen(false);
                setNewProduct({
                    name: "", price: "", description: "", image: "", imagesInput: "", category: "", stock: "", brand: "",
                    modelName: "", rating: "", lastMonthSales: "", couponCode: "", discountPercentage: "", showOnHome: false,
                    taxes: []
                });
                alert("Product Added Successfully");
            }
        } catch (error: any) {
            console.error(error);
            alert(`Error: ${error.response?.data?.msg || 'Failed to add product'}`);
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleEditClick = (product: Product) => {
        const images = (product as any).images || [];
        const imagesInput = images.length > 0 ? images.join(', ') : (product as any).image;

        setEditingProduct({
            ...product,
            price: String(product.price),
            stock: String(product.stock),
            description: (product as any).description || "",
            image: (product as any).image || "",
            imagesInput: imagesInput || "",
            category: (typeof product.category === 'object' && product.category !== null) ? (product.category as any)._id : product.category,
            brand: (product as any).brand || "",
            modelName: (product as any).modelName || "",
            rating: String((product as any).rating || 0),
            lastMonthSales: String((product as any).lastMonthSales || 0),
            couponCode: (product as any).couponCode || "",
            discountPercentage: String((product as any).discountPercentage || 0),
            showOnHome: (product as any).showOnHome || false,
            taxes: product.taxes || []
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const imageList = editingProduct.imagesInput.split(',').map((url: string) => url.trim()).filter((url: string) => url.length > 0);

            const res = await api.put(`/products/${editingProduct._id}`, {
                ...editingProduct,
                image: imageList[0] || editingProduct.image,
                images: imageList,
                price: Number(editingProduct.price),
                stock: Number(editingProduct.stock),
                rating: Number(editingProduct.rating),
                lastMonthSales: Number(editingProduct.lastMonthSales),
                couponCode: editingProduct.couponCode || undefined,
                discountPercentage: Number(editingProduct.discountPercentage) || 0,
                showOnHome: editingProduct.showOnHome,
                taxes: editingProduct.taxes
            });

            if (res.status === 200) {
                fetchProducts();
                setIsEditModalOpen(false);
                setEditingProduct(null);
                alert("Product Updated Successfully");
            }
        } catch (error: any) {
            console.error(error);
            alert(`Error: ${error.response?.data?.msg || 'Failed to update product'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewChange = (view: 'dashboard' | 'products' | 'users' | 'orders' | 'inventory' | 'messages' | 'coupons' | 'blogs' | 'categories' | 'billing') => {
        setActiveView(view);
        if (view === 'users') fetchUsers();
        if (view === 'products' || view === 'inventory' || view === 'billing') fetchProducts();
        if (view === 'orders') fetchOrders();
        if (view === 'messages') fetchMessages();
        if (view === 'coupons') fetchCoupons();
        if (view === 'blogs') fetchBlogs();
        if (view === 'categories' || view === 'products') fetchCategories();
    };




    const toggleUserStatus = async (id: string, currentStatus: boolean) => {
        try {
            await api.put(`/auth/users/${id}/status`); // Assuming implemented
            setUsersList(prev => prev.map(u => u._id === id ? { ...u, isActive: !currentStatus } : u));
        } catch (error) {
            console.error(error);
            alert("Failed to update user status");
        }
    };

    const toggleProductStatus = async (id: string, currentStatus: boolean) => {
        try {
            await api.put(`/products/${id}/status`); // Assuming implemented
            setProductsList(prev => prev.map(p => p._id === id ? { ...p, isActive: !currentStatus } : p));
        } catch (error) {
            console.error(error);
            alert("Failed to update product status");
        }
    };

    const toggleCouponStatus = async (id: string, currentStatus: boolean) => {
        try {
            await api.put(`/coupons/${id}`, { isActive: !currentStatus });
            setCouponsList(prev => prev.map(c => c._id === id ? { ...c, isActive: !currentStatus } : c));
        } catch (error) {
            console.error(error);
            alert("Failed to update coupon status");
        }
    };

    const handleDeleteCoupon = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        try {
            await api.delete(`/coupons/${id}`);
            setCouponsList(prev => prev.filter(c => c._id !== id));
        } catch (error) {
            console.error(error);
            alert("Failed to delete coupon");
        }
    };

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { data } = await api.post('/coupons', newCoupon);
            setCouponsList(prev => [...prev, data]);
            setIsAddCouponModalOpen(false);
            setNewCoupon({
                code: '',
                discountType: 'percentage',
                discountValue: 0,
                expiresAt: '',
                applicableProducts: [],
                isActive: true
            });
            alert("Coupon created successfully");
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.msg || "Failed to create coupon");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCoupon) return;
        setIsSubmitting(true);
        try {
            const { data } = await api.put(`/coupons/${editingCoupon._id}`, editingCoupon);
            setCouponsList(prev => prev.map(c => c._id === editingCoupon._id ? data : c));
            setIsEditCouponModalOpen(false);
            setEditingCoupon(null);
            alert("Coupon updated successfully");
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.msg || "Failed to update coupon");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Blog Handlers
    const handleCreateBlog = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { data } = await api.post('/blogs', newBlog);
            setBlogsList(prev => [data, ...prev]);
            setIsAddBlogModalOpen(false);
            setNewBlog({ title: '', content: '', author: '', image: '', slug: '', tags: [] });
            alert("Blog created successfully");
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.msg || "Failed to create blog");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateBlog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBlog) return;
        setIsSubmitting(true);
        try {
            const { data } = await api.put(`/blogs/${editingBlog._id}`, editingBlog);
            setBlogsList(prev => prev.map(b => b._id === editingBlog._id ? data : b));
            setIsEditBlogModalOpen(false);
            setEditingBlog(null);
            alert("Blog updated successfully");
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.msg || "Failed to update blog");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteBlog = async (id: string) => {
        if (!confirm("Are you sure you want to delete this blog?")) return;
        try {
            await api.delete(`/blogs/${id}`);
            setBlogsList(prev => prev.filter(b => b._id !== id));
            alert("Blog deleted successfully");
        } catch (error) {
            console.error(error);
            alert("Failed to delete blog");
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/auth/create-user', newUser);
            fetchUsers();
            setIsAddUserModalOpen(false);
            setNewUser({ firstName: "", lastName: "", email: "", phone: "", password: "", role: "user" });
            alert("User created successfully");
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.msg || "Failed to create user");
        } finally {
            setIsSubmitting(false);
        }
    };



    const handleEditUserClick = (user: User) => {
        const { password, ...rest } = user as any; // distinct password from rest logic
        setEditingUser(rest);
        setIsEditUserModalOpen(true);
    };



    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = { ...editingUser };
            if (!payload.password) delete payload.password;

            await api.put(`/auth/users/${editingUser._id}`, payload);
            fetchUsers();
            setIsEditUserModalOpen(false);
            setEditingUser(null);
            alert("User updated successfully");
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.msg || "Failed to update user");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            fetchOrders();
        } catch (error) {
            console.error("Failed to update order status", error);
        }
    };

    const handleUpdateCredit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserForCredit) return;

        const amount = Number(creditAmount);
        if (isNaN(amount)) {
            alert("Please enter a valid number");
            return;
        }

        setIsProcessingCredit(true);
        try {
            const res = await api.put(`/auth/users/${selectedUserForCredit._id}/credit`, {
                amount: amount,
                type: 'add'
            });

            // Update user in list
            setUsersList(usersList.map(u => u._id === selectedUserForCredit._id ? { ...u, creditBalance: res.data.creditBalance } : u));
            setShowCreditModal(false);
            setCreditAmount("");
            setSelectedUserForCredit(null);
            alert("Credit updated successfully!");
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.msg || "Failed to update credit");
        } finally {
            setIsProcessingCredit(false);
        }
    };

    const handleEditOrderClick = (order: any) => {
        setEditingOrder({
            ...order,
            fullName: order.shippingInfo.fullName,
            address: order.shippingInfo.address,
            city: order.shippingInfo.city,
            pincode: order.shippingInfo.pincode,
            phone: order.shippingInfo.phone
        });
        setIsEditOrderModalOpen(true);
    };

    const handleUpdateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const updateData = {
                status: editingOrder.status,
                shippingInfo: {
                    fullName: editingOrder.fullName,
                    address: editingOrder.address,
                    city: editingOrder.city,
                    pincode: editingOrder.pincode,
                    phone: editingOrder.phone
                }
            };
            const res = await api.put(`/orders/${editingOrder._id}`, updateData);
            setOrdersList(prev => prev.map(o => o._id === editingOrder._id ? res.data : o));
            setIsEditOrderModalOpen(false);
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.msg || "Failed to update order");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!window.confirm("Are you sure you want to delete this order?")) return;
        try {
            await api.delete(`/orders/${orderId}`);
            setOrdersList(prev => prev.filter(o => o._id !== orderId));
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.msg || "Failed to delete order");
        }
    };




    if (authLoading || (user?.role === 'admin' && loadingStats)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="animate-spin text-teal-600 size-10" />
            </div>
        );
    }

    if (!user || user.role !== "admin") return null;



    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-40 h-screen pt-24 transition-all duration-300 bg-white border-r border-slate-200 dark:bg-slate-800 dark:border-slate-700 ${isSidebarCollapsed ? 'w-20' : 'w-64'} -translate-x-full md:translate-x-0`} aria-label="Sidebar">
                {/* Toggle Button */}
                <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="absolute -right-3 top-28 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors z-50 text-slate-500"
                >
                    {isSidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
                </button>

                <div className="h-full px-3 py-4 overflow-y-auto bg-white dark:bg-slate-800 scrollbar-hide">
                    <ul className="space-y-2 font-medium">
                        <li>
                            <button onClick={() => handleViewChange('dashboard')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'dashboard' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <Layers className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Overview</span>}
                            </button>
                        </li>
                        <li>
                            <button onClick={() => handleViewChange('categories')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'categories' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <Folder className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Categories</span>}
                            </button>
                        </li>
                        <li>
                            <button onClick={() => handleViewChange('products')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'products' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <Package className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Products</span>}
                            </button>
                        </li>
                        <li>
                            <button onClick={() => handleViewChange('inventory')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'inventory' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <Layers className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Inventory</span>}
                            </button>
                        </li>
                        <li>
                            <button onClick={() => handleViewChange('orders')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'orders' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <ShoppingBag className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Orders</span>}
                            </button>
                        </li>
                        <li>
                            <button onClick={() => handleViewChange('users')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'users' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <Users className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Users</span>}
                            </button>
                        </li>

                        <li>
                            <button onClick={() => handleViewChange('messages')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'messages' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <Mail className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Messages</span>}
                            </button>
                        </li>

                        <li>
                            <button onClick={() => handleViewChange('coupons')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'coupons' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <Ticket className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Coupons</span>}
                            </button>
                        </li>

                        <li>
                            <button onClick={() => handleViewChange('blogs')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'blogs' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <Edit className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Blogs</span>}
                            </button>
                        </li>
                        <li>
                            <button onClick={() => handleViewChange('billing')} className={`w-full flex items-center p-2 rounded-lg group ${activeView === 'billing' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <DollarSign className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Billing</span>}
                            </button>
                        </li>
                    </ul>
                </div>
            </aside>

            <main className={`flex-1 p-8 pt-24 transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                {/* View Coupons Modal */}
                <AnimatePresence>
                    {viewingCoupons && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700"
                            >
                                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Active Coupons for {viewingCoupons.productName}</h3>
                                    <button onClick={() => setViewingCoupons(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                                        <X className="size-6" />
                                    </button>
                                </div>
                                <div className="p-6 max-h-[60vh] overflow-y-auto">
                                    <div className="space-y-4">
                                        {viewingCoupons.coupons.length > 0 ? (
                                            viewingCoupons.coupons.map((coupon: any) => (
                                                <div key={coupon._id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <span className="text-lg font-bold text-teal-600 dark:text-teal-400 block">{coupon.code}</span>
                                                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                                                Discount: {coupon.discountType === 'fixed' ? '₹' : ''}{coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : ''} off
                                                            </span>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {coupon.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                    {coupon.expiresAt && (
                                                        <div className="text-xs text-slate-400">
                                                            Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                    {coupon.usageLimit && (
                                                        <div className="text-xs text-slate-400 mt-1">
                                                            Usage: {coupon.usedCount} / {coupon.usageLimit}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center text-slate-500 py-8">No active coupons found for this product.</div>
                                        )}
                                    </div>
                                </div>
                                <div className="p-6 border-t border-slate-100 dark:border-slate-700">
                                    <button
                                        onClick={() => setViewingCoupons(null)}
                                        className="w-full px-4 py-2 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">
                                Welcome back, {user.firstName || user.name?.split(' ')[0] || user.email?.split('@')[0] || user.phone || 'Admin'}.
                            </p>
                        </div>
                    </div>

                    {activeView === 'dashboard' && (
                        <div className="space-y-6">

                            {/* 1. Stats Cards Row */}
                            <DashboardStatsCards stats={{
                                totalProducts: stats?.products || 0,
                                totalStock: stats?.stock?.totalStock || 0,
                                lowStock: stats?.stock?.lowStock || 0,
                                outOfStock: stats?.stock?.outOfStock || 0
                            }} />

                            {/* 2. Charts Row (Profit & Order Summary) */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-1 min-h-[400px]">
                                    <ProfitChart data={stats?.categoryRevenue || []} />
                                </div>
                                <div className="lg:col-span-2 min-h-[400px]">
                                    <OrderSummaryChart data={stats?.trends || []} totalRevenue={stats?.revenue || 0} />
                                </div>
                            </div>

                            {/* 3. Stock Level & Upcoming Restock */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="min-h-[500px]">
                                    <StockLevel stockStats={stats?.stock} products={stats?.topProducts || []} />
                                </div>
                                <div className="min-h-[500px]">
                                    <UpcomingRestock products={stats?.restock || []} />
                                </div>
                            </div>

                            {/* 4. Top Products & Recent Activity */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                <div className="lg:col-span-1 min-h-[500px]">
                                    <TopProducts products={stats?.topProducts || []} />
                                </div>
                                <div className="lg:col-span-2 min-h-[500px]">
                                    <RecentActivity activities={stats?.recentActivity || []} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeView === 'users' && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Manage Users</h2>
                                <button onClick={() => setIsAddUserModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors">
                                    <Plus className="size-4" /> Add User
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                                        <tr>
                                            <th className="p-4">Name</th>
                                            <th className="p-4">Email</th>
                                            <th className="p-4">Role</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4">Credit</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {usersList.map(u => (
                                            <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                <td className="p-4 font-medium text-slate-900 dark:text-white">{u.firstName ? `${u.firstName} ${u.lastName || ''}` : (u.name || u.email.split('@')[0])}</td>
                                                <td className="p-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {u.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1 font-mono font-bold text-slate-700 dark:text-slate-300">
                                                        <Coins className="size-3 text-amber-500" />
                                                        {u.creditBalance || 0}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right flex justify-end items-center gap-2">
                                                    <button
                                                        onClick={() => { setSelectedUserForCredit(u); setShowCreditModal(true); }}
                                                        className="text-amber-500 hover:text-amber-700 p-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-full transition-colors"
                                                        title="Manage Credit"
                                                    >
                                                        <Coins className="size-4" />
                                                    </button>
                                                    <ToggleSwitch isOn={u.isActive} onToggle={() => toggleUserStatus(u._id, u.isActive)} />
                                                    <button onClick={() => handleEditUserClick(u)} className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors">
                                                        <Edit className="size-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteUser(u._id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors">
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeView === 'products' && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Manage Products</h2>
                                <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors">
                                    <Plus className="size-4" /> Add Product
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                                        <tr>
                                            <th className="p-4">Product</th>
                                            <th className="p-4">Category</th>
                                            <th className="p-4">Price</th>
                                            <th className="p-4">Coupons</th>
                                            <th className="p-4">Stock</th>
                                            <th className="p-4">Home</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {productsList.map(p => (
                                            <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                <td className="p-4 font-medium text-slate-900 dark:text-white">{p.name}</td>
                                                <td className="p-4 text-slate-600 dark:text-slate-400">
                                                    {(typeof p.category === 'object' && p.category !== null) ? (p.category as any).name : p.category}
                                                </td>
                                                <td className="p-4 text-slate-900 dark:text-white font-medium">₹{p.price}</td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        {p.couponCode && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 text-xs font-mono font-bold">
                                                                <Tag className="size-3" /> {p.couponCode}
                                                            </span>
                                                        )}
                                                        {(p as any).couponDetails && (p as any).couponDetails.length > 0 && (
                                                            <button
                                                                onClick={() => setViewingCoupons({ productName: p.name, coupons: (p as any).couponDetails })}
                                                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                                            >
                                                                <Ticket className="size-3" />
                                                                {(p as any).couponDetails.length} Linked Coupon{(p as any).couponDetails.length !== 1 ? 's' : ''}
                                                            </button>
                                                        )}
                                                        {!p.couponCode && (!(p as any).couponDetails || (p as any).couponDetails.length === 0) && (
                                                            <span className="text-xs text-slate-400 italic">None</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {p.stock}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.showOnHome ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                                                        {p.showOnHome ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {p.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right flex justify-end items-center gap-2">
                                                    <ToggleSwitch isOn={p.isActive} onToggle={() => toggleProductStatus(p._id, p.isActive)} />
                                                    <button onClick={() => handleEditClick(p)} className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors" title="Edit Product">
                                                        <Edit className="size-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteProduct(p._id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors" title="Delete Product">
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeView === 'inventory' && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Inventory Management</h2>
                                <div className="flex gap-2">
                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                        <div className="size-2 rounded-full bg-red-500"></div> Low Stock (&lt; 10)
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                                        <tr>
                                            <th className="p-4">SKU/Product</th>
                                            <th className="p-4">Category</th>
                                            <th className="p-4 text-center">Current Stock</th>
                                            <th className="p-4 text-center">Status</th>
                                            <th className="p-4 text-right">Quick Restock</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {productsList.map(p => (
                                            <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                <td className="p-4">
                                                    <div className="font-medium text-slate-900 dark:text-white">{p.name}</div>
                                                    <div className="text-xs text-slate-400 font-mono uppercase">{p._id.slice(-8)}</div>
                                                </td>
                                                <td className="p-4 text-slate-600 dark:text-slate-400">
                                                    {(typeof p.category === 'object' && p.category !== null) ? (p.category as any).name : p.category}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${p.stock < 10 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                                        {p.stock}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    {p.stock === 0 ? (
                                                        <span className="text-xs font-bold text-red-500 flex items-center justify-center gap-1"><X className="size-3" /> Out of Stock</span>
                                                    ) : p.stock < 10 ? (
                                                        <span className="text-xs font-bold text-orange-500 flex items-center justify-center gap-1"><Shield className="size-3" /> Reorder Soon</span>
                                                    ) : (
                                                        <span className="text-xs font-bold text-teal-500 flex items-center justify-center gap-1"><Shield className="size-3" /> Healthy</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={async () => {
                                                                const amount = prompt("How many units to add?");
                                                                if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
                                                                    try {
                                                                        await api.put(`/products/${p._id}`, { stock: p.stock + Number(amount) });
                                                                        fetchProducts();
                                                                    } catch (e: any) { alert(e.response?.data?.msg || "Failed to restock"); }
                                                                }
                                                            }}
                                                            className="px-3 py-1 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 rounded-lg text-xs font-bold hover:bg-teal-100 transition-colors"
                                                        >
                                                            <Plus className="size-3 inline mr-1" /> Add
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                const amount = prompt("How many units to remove?");
                                                                if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
                                                                    if (Number(amount) > p.stock) {
                                                                        alert("Cannot remove more than current stock");
                                                                        return;
                                                                    }
                                                                    try {
                                                                        await api.put(`/products/${p._id}`, { stock: Math.max(0, p.stock - Number(amount)) });
                                                                        fetchProducts();
                                                                    } catch (e: any) { alert(e.response?.data?.msg || "Failed to remove stock"); }
                                                                }
                                                            }}
                                                            className="px-3 py-1 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                                                        >
                                                            <Trash2 className="size-3 inline mr-1" /> Remove
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}


                    {activeView === 'orders' && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Order Management</h2>
                                <span className="text-sm text-slate-500">{ordersList.length} Total Orders</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                                        <tr>
                                            <th className="p-4">Order ID / Date</th>
                                            <th className="p-4">Customer</th>
                                            <th className="p-4">Total</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {ordersList.map(order => (
                                            <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                <td className="p-4">
                                                    <div className="font-mono text-xs uppercase text-slate-900 dark:text-white">#{order._id.slice(-8)}</div>
                                                    <div className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{order.shippingInfo.fullName}</div>
                                                    <div className="text-xs text-slate-400">{order.user?.email || 'Guest'}</div>
                                                </td>
                                                <td className="p-4 text-slate-900 dark:text-white font-bold">₹{order.totalAmount.toLocaleString()}</td>
                                                <td className="p-4">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                                        className={`text-xs font-bold rounded-lg px-2 py-1 outline-none border-none cursor-pointer
                                                                ${order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                                order.status === 'shipped' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}
                                                    >
                                                        <option value="processing">Processing</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td className="p-4 text-right flex justify-end items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditOrderClick(order)}
                                                        className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                                        title="Edit Order"
                                                    >
                                                        <Edit className="size-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteOrder(order._id)}
                                                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                        title="Delete Order"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setViewingOrder(order)}
                                                        className="p-2 text-slate-400 hover:text-teal-600 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Layers className="size-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeView === 'messages' && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Contact Messages</h2>
                                <span className="text-sm text-slate-500">{messagesList.length} Total Messages</span>
                            </div>
                            <div className="overflow-x-auto">
                                {loadingData ? (
                                    <div className="flex items-center justify-center py-16">
                                        <Loader2 className="animate-spin text-teal-600 size-10" />
                                    </div>
                                ) : messagesList.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Mail className="size-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                        <p className="text-slate-500 dark:text-slate-400 text-lg">No messages yet</p>
                                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Messages from the contact form will appear here</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                                            <tr>
                                                <th className="p-4">From</th>
                                                <th className="p-4">Message</th>
                                                <th className="p-4">Date</th>
                                                <th className="p-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {messagesList.map(msg => (
                                                <tr key={msg._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                    <td className="p-4">
                                                        <div className="font-medium text-slate-900 dark:text-white">{msg.firstName} {msg.lastName}</div>
                                                        <div className="text-sm text-slate-400">{msg.email}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2 max-w-md">{msg.message}</p>
                                                    </td>
                                                    <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">
                                                        {new Date(msg.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <a
                                                            href={`mailto:${msg.email}?subject=Re: Your message&body=Hi ${msg.firstName},%0D%0A%0D%0A`}
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-lg text-sm font-medium hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
                                                        >
                                                            <Mail className="size-4" />
                                                            Reply
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {activeView === 'blogs' && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Manage Blogs</h2>
                                <button onClick={() => setIsAddBlogModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors">
                                    <Plus className="size-4" /> Add Blog
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                {loadingData ? (
                                    <div className="flex items-center justify-center py-16">
                                        <Loader2 className="animate-spin text-teal-600 size-10" />
                                    </div>
                                ) : blogsList.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Edit className="size-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                        <p className="text-slate-500 dark:text-slate-400 text-lg">No blogs yet</p>
                                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Create your first blog post to get started</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                                            <tr>
                                                <th className="p-4">Title</th>
                                                <th className="p-4">Author</th>
                                                <th className="p-4">Slug</th>
                                                <th className="p-4">Date</th>
                                                <th className="p-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {blogsList.map(blog => (
                                                <tr key={blog._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                    <td className="p-4">
                                                        <div className="font-medium text-slate-900 dark:text-white line-clamp-1 max-w-xs">{blog.title}</div>
                                                        {blog.tags && blog.tags.length > 0 && (
                                                            <div className="flex gap-1 mt-1">
                                                                {blog.tags.slice(0, 2).map((tag, idx) => (
                                                                    <span key={idx} className="text-xs px-2 py-0.5 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded">
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-slate-600 dark:text-slate-400">{blog.author}</td>
                                                    <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-sm">{blog.slug}</td>
                                                    <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">
                                                        {new Date(blog.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4 text-right flex justify-end items-center gap-2">
                                                        <button
                                                            onClick={() => { setEditingBlog(blog); setIsEditBlogModalOpen(true); }}
                                                            className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                                            title="Edit Blog"
                                                        >
                                                            <Edit className="size-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteBlog(blog._id)}
                                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                            title="Delete Blog"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {activeView === 'categories' && <CategoriesView />}

                    {activeView === 'billing' && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Create New Bill</h2>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Left: Product Search & Bill Items */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="relative">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Search Product (Inventory)</label>
                                            <div className="relative">
                                                <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                                                <input
                                                    type="text"
                                                    value={billingSearchQuery}
                                                    onChange={(e) => {
                                                        const query = e.target.value;
                                                        setBillingSearchQuery(query);
                                                        if (query.length > 1) {
                                                            const filtered = productsList.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
                                                            setBillingSearchResults(filtered);
                                                            setShowBillingSearchResults(true);
                                                        } else {
                                                            setShowBillingSearchResults(false);
                                                        }
                                                    }}
                                                    placeholder="Search by product name..."
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                />
                                            </div>

                                            {showBillingSearchResults && billingSearchResults.length > 0 && (
                                                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                                    {billingSearchResults.map((p: Product) => (
                                                        <button
                                                            key={p._id}
                                                            onClick={() => {
                                                                const newItem = {
                                                                    productId: p._id,
                                                                    name: p.name,
                                                                    price: p.price,
                                                                    quantity: 1,
                                                                    taxes: p.taxes || [],
                                                                    fromInventory: true
                                                                };
                                                                setBillingItems([...billingItems, newItem]);
                                                                setBillingSearchQuery("");
                                                                setShowBillingSearchResults(false);
                                                            }}
                                                            className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-0 flex justify-between items-center"
                                                        >
                                                            <div>
                                                                <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                                                                <div className="text-xs text-slate-500 italic">Stock: {p.stock}</div>
                                                            </div>
                                                            <div className="text-teal-600 dark:text-teal-400 font-bold">₹{p.price}</div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                                            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800">
                                                <h3 className="font-bold text-slate-900 dark:text-white">Bill Items</h3>
                                                <button
                                                    onClick={() => setBillingItems([...billingItems, { name: "", price: 0, quantity: 1, taxes: [], fromInventory: false }])}
                                                    className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1"
                                                >
                                                    <Plus className="size-3" /> Add Custom Item
                                                </button>
                                            </div>
                                            <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                                                {billingItems.length === 0 ? (
                                                    <div className="text-center py-12 text-slate-400">
                                                        <ShoppingBag className="size-12 mx-auto mb-4 opacity-20" />
                                                        <p>No items added to the bill yet.</p>
                                                    </div>
                                                ) : (
                                                    billingItems.map((item: any, idx: number) => (
                                                        <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                                                            <div className="flex gap-4">
                                                                <div className="flex-1">
                                                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Item Name</label>
                                                                    <input
                                                                        type="text"
                                                                        value={item.name}
                                                                        readOnly={item.fromInventory}
                                                                        onChange={(e) => {
                                                                            const updated = [...billingItems];
                                                                            updated[idx].name = e.target.value;
                                                                            setBillingItems(updated);
                                                                        }}
                                                                        className={`w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none ${item.fromInventory ? 'opacity-70' : ''}`}
                                                                        placeholder="Item name..."
                                                                    />
                                                                </div>
                                                                <div className="w-32">
                                                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Price</label>
                                                                    <input
                                                                        type="number"
                                                                        value={item.price}
                                                                        readOnly={item.fromInventory}
                                                                        onChange={(e) => {
                                                                            const updated = [...billingItems];
                                                                            updated[idx].price = Number(e.target.value);
                                                                            setBillingItems(updated);
                                                                        }}
                                                                        className={`w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none ${item.fromInventory ? 'opacity-70' : ''}`}
                                                                    />
                                                                </div>
                                                                <div className="w-24">
                                                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Qty</label>
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        value={item.quantity}
                                                                        onChange={(e) => {
                                                                            const updated = [...billingItems];
                                                                            updated[idx].quantity = Number(e.target.value);
                                                                            setBillingItems(updated);
                                                                        }}
                                                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none"
                                                                    />
                                                                </div>
                                                                <button
                                                                    onClick={() => setBillingItems(billingItems.filter((_, i) => i !== idx))}
                                                                    className="self-end p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                                >
                                                                    <Trash2 className="size-5" />
                                                                </button>
                                                            </div>
                                                            {/* Item Taxes */}
                                                            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-2">
                                                                <span className="text-[10px] uppercase font-bold text-slate-400 self-center">Taxes:</span>
                                                                {item.taxes.map((tax: any, tIdx: number) => (
                                                                    <div key={tIdx} className="px-2 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded text-xs flex items-center gap-1">
                                                                        {tax.name} ({tax.rate}%)
                                                                        {!item.fromInventory && (
                                                                            <button onClick={() => {
                                                                                const updated = [...billingItems];
                                                                                updated[idx].taxes = updated[idx].taxes.filter((_: any, i: number) => i !== tIdx);
                                                                                setBillingItems(updated);
                                                                            }} className="hover:text-red-500"><X className="size-3" /></button>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                                {!item.fromInventory && (
                                                                    <button
                                                                        onClick={() => {
                                                                            const tName = prompt("Tax Name (e.g. GST)");
                                                                            const tRate = prompt("Tax Rate (%)");
                                                                            if (tName && tRate && !isNaN(Number(tRate))) {
                                                                                const updated = [...billingItems];
                                                                                updated[idx].taxes.push({ name: tName, rate: Number(tRate) });
                                                                                setBillingItems(updated);
                                                                            }
                                                                        }}
                                                                        className="text-[10px] px-2 py-1 border border-dashed border-slate-300 dark:border-slate-600 rounded text-slate-500 hover:bg-slate-50"
                                                                    >
                                                                        + Add Tax
                                                                    </button>
                                                                )}
                                                                {item.taxes.length === 0 && item.fromInventory && <span className="text-xs text-slate-400 italic">No taxes</span>}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Customer Info & Summary */}
                                    <div className="space-y-6">
                                        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-4">
                                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <Users className="size-5 text-teal-500" /> Customer Details
                                            </h3>
                                            <div className="space-y-3">
                                                <input
                                                    type="text"
                                                    value={customerInfo.name}
                                                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                                    placeholder="Customer Name"
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                                                />
                                                <input
                                                    type="text"
                                                    value={customerInfo.phone}
                                                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                                    placeholder="Phone Number"
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                                                />
                                                <textarea
                                                    value={customerInfo.address}
                                                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                                                    placeholder="Full Address (Optional)"
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-teal-500 h-24 resize-none shadow-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-teal-600 p-6 rounded-2xl shadow-xl shadow-teal-600/20 text-white space-y-4">
                                            <h3 className="font-bold text-lg border-b border-white/20 pb-2">Bill Summary</h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="opacity-80">Subtotal</span>
                                                    <span className="font-bold">₹{billingItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0).toLocaleString()}</span>
                                                </div>
                                                {/* Calculate merged taxes */}
                                                {(() => {
                                                    const taxesMap: Record<string, number> = {};
                                                    billingItems.forEach((item: any) => {
                                                        item.taxes.forEach((tax: any) => {
                                                            const amount = (item.price * item.quantity) * (tax.rate / 100);
                                                            taxesMap[tax.name] = (taxesMap[tax.name] || 0) + amount;
                                                        });
                                                    });
                                                    return Object.entries(taxesMap).map(([name, amount]: [string, number]) => (
                                                        <div key={name} className="flex justify-between">
                                                            <span className="opacity-80">{name}</span>
                                                            <span className="font-bold">₹{amount.toLocaleString()}</span>
                                                        </div>
                                                    ));
                                                })()}
                                                <div className="pt-4 mt-4 border-t border-white/20 flex justify-between items-end">
                                                    <span className="text-lg font-bold">Total Amount</span>
                                                    <span className="text-3xl font-black">
                                                        ₹{(() => {
                                                            const subtotal = billingItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
                                                            let taxTotal = 0;
                                                            billingItems.forEach((item: any) => {
                                                                item.taxes.forEach((tax: any) => {
                                                                    taxTotal += (item.price * item.quantity) * (tax.rate / 100);
                                                                });
                                                            });
                                                            return Math.round(subtotal + taxTotal).toLocaleString();
                                                        })()}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    if (billingItems.length === 0) {
                                                        alert("Please add at least one item.");
                                                        return;
                                                    }
                                                    if (!customerInfo.name) {
                                                        alert("Customer name is required.");
                                                        return;
                                                    }

                                                    setIsSubmitting(true);
                                                    try {
                                                        // For now, we'll create an order with status 'delivered'
                                                        // This assumes the backend /orders endpoint can handle this.
                                                        // Real billing might need a separate API, but this is a good start.
                                                        const billData = {
                                                            billingItems,
                                                            customerInfo,
                                                            totalAmount: billingItems.reduce((acc: number, item: any) => {
                                                                const itemTotal = item.price * item.quantity;
                                                                const itemTax = item.taxes.reduce((tAcc: number, tax: any) => tAcc + (itemTotal * (tax.rate / 100)), 0);
                                                                return acc + itemTotal + itemTax;
                                                            }, 0),
                                                            source: 'admin_billing'
                                                        };

                                                        // Mocking the creation success if API not ready, 
                                                        // or implementing if possible.
                                                        console.log("Generating Bill:", billData);

                                                        // Update state to show that bill is "generated" but still editable
                                                        alert("Bill Data Prepared! You can now Download or Share the PDF.");

                                                    } catch (error) {
                                                        console.error(error);
                                                        alert("Failed to create bill.");
                                                    } finally {
                                                        setIsSubmitting(false);
                                                    }
                                                }}
                                                disabled={isSubmitting}
                                                className="w-full py-4 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {isSubmitting ? <Loader2 className="animate-spin size-5" /> : <Receipt className="size-5" />}
                                                {isSubmitting ? "Processing..." : "Generate Bill Data"}
                                            </button>

                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => {
                                                        if (billingItems.length === 0) {
                                                            alert("Please add items first.");
                                                            return;
                                                        }

                                                        const doc = new jsPDF();

                                                        // --- PROFESSIONAL HEADER ---
                                                        // Top Teal Accent Bar
                                                        doc.setFillColor(20, 184, 166);
                                                        doc.rect(0, 0, 210, 25, 'F');

                                                        // Company Name & Invoice Label
                                                        doc.setTextColor(255);
                                                        doc.setFont("helvetica", "bold");
                                                        doc.setFontSize(24);
                                                        doc.text("DDTECH", 20, 17);

                                                        doc.setFontSize(14);
                                                        doc.setFont("helvetica", "normal");
                                                        doc.text("INVOICE", 190, 17, { align: "right" });

                                                        // --- COMPANY & BILLING DETAILS ---
                                                        doc.setTextColor(50);
                                                        doc.setFontSize(10);

                                                        // Left Side: Company Address (Mock)
                                                        doc.setFont("helvetica", "bold");
                                                        doc.text("DDTECH TOOLS", 20, 45);
                                                        doc.setFont("helvetica", "normal");
                                                        doc.text("123 Tech Lane, Silicon Valley", 20, 51);
                                                        doc.text("Contact: +91 98765 43210", 20, 57);
                                                        doc.text("Email: support@ddtech.com", 20, 63);

                                                        // Right Side: Billing Details
                                                        doc.setFont("helvetica", "bold");
                                                        doc.text("BILL TO:", 120, 45);
                                                        doc.setFont("helvetica", "normal");
                                                        doc.text(`${customerInfo.name || "Valued Customer"}`, 120, 51);
                                                        doc.text(`${customerInfo.phone || "No Phone"}`, 120, 57);
                                                        doc.text(`${customerInfo.address || "No Address Provided"}`, 120, 63, { maxWidth: 70 });

                                                        // Horizontal Separator
                                                        doc.setDrawColor(230);
                                                        doc.line(20, 75, 190, 75);

                                                        // Date and Invoice Number
                                                        doc.setFont("helvetica", "bold");
                                                        doc.text("DATE:", 20, 85);
                                                        doc.setFont("helvetica", "normal");
                                                        doc.text(new Date().toLocaleDateString(), 40, 85);

                                                        doc.setFont("helvetica", "bold");
                                                        doc.text("INVOICE NO:", 120, 85);
                                                        doc.setFont("helvetica", "normal");
                                                        doc.text(`INV-${new Date().getTime().toString().slice(-6)}`, 150, 85);

                                                        // --- ITEMS TABLE ---
                                                        const tableData = billingItems.map((item: any) => {
                                                            const itemTotal = item.price * item.quantity;
                                                            const itemTax = item.taxes.reduce((tAcc: number, tax: any) => tAcc + (itemTotal * (tax.rate / 100)), 0);
                                                            return [
                                                                item.name,
                                                                `Rs. ${item.price.toLocaleString()}`,
                                                                item.quantity,
                                                                `Rs. ${itemTax.toLocaleString()}`,
                                                                `Rs. ${(itemTotal + itemTax).toLocaleString()}`
                                                            ];
                                                        });

                                                        autoTable(doc, {
                                                            startY: 95,
                                                            head: [["Product Name", "Unit Price", "Quantity", "Tax Amount", "Total"]],
                                                            body: tableData,
                                                            theme: 'striped',
                                                            headStyles: {
                                                                fillColor: [20, 184, 166],
                                                                fontSize: 10,
                                                                fontStyle: 'bold',
                                                                halign: 'center'
                                                            },
                                                            columnStyles: {
                                                                0: { cellWidth: 70 },
                                                                1: { halign: 'right' },
                                                                2: { halign: 'center' },
                                                                3: { halign: 'right' },
                                                                4: { halign: 'right', fontStyle: 'bold' }
                                                            },
                                                            didParseCell: (data) => {
                                                                if (data.section === 'body' && data.column.index === 0) {
                                                                    // Limits the text to 1 line as requested
                                                                    if (Array.isArray(data.cell.text) && data.cell.text.length > 1) {
                                                                        data.cell.text = [data.cell.text[0]];
                                                                    }
                                                                }
                                                            }
                                                        });

                                                        // --- SUMMARY & TOTALS ---
                                                        const finalY = (doc as any).lastAutoTable.finalY + 10;
                                                        const subtotal = billingItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
                                                        let taxTotal = 0;
                                                        billingItems.forEach((item: any) => {
                                                            item.taxes.forEach((tax: any) => {
                                                                taxTotal += (item.price * item.quantity) * (tax.rate / 100);
                                                            });
                                                        });

                                                        // Calculation Box
                                                        doc.setFillColor(245, 245, 245);
                                                        doc.rect(130, finalY, 60, 35, 'F');

                                                        doc.setFontSize(10);
                                                        doc.setTextColor(100);
                                                        doc.text("Subtotal:", 135, finalY + 10);
                                                        doc.text(`Rs. ${subtotal.toLocaleString()}`, 185, finalY + 10, { align: "right" });

                                                        doc.text("Tax Amount:", 135, finalY + 18);
                                                        doc.text(`Rs. ${taxTotal.toLocaleString()}`, 185, finalY + 18, { align: "right" });

                                                        doc.setDrawColor(200);
                                                        doc.line(135, finalY + 23, 185, finalY + 23);

                                                        doc.setFontSize(12);
                                                        doc.setTextColor(20, 184, 166);
                                                        doc.setFont("helvetica", "bold");
                                                        doc.text("Total:", 135, finalY + 30);
                                                        doc.text(`Rs. ${(subtotal + taxTotal).toLocaleString()}`, 185, finalY + 30, { align: "right" });

                                                        // --- FOOTER SECTION ---
                                                        const pageHeight = doc.internal.pageSize.height;

                                                        doc.setFontSize(8);
                                                        doc.setTextColor(150);
                                                        doc.setFont("helvetica", "normal");
                                                        doc.text("Terms & Conditions", 20, pageHeight - 30);
                                                        doc.text("1. All sales are final. 2. Please mention the invoice number for any queries.", 20, pageHeight - 25);

                                                        doc.setFontSize(10);
                                                        doc.setTextColor(20, 184, 166);
                                                        doc.setFont("helvetica", "bold");
                                                        doc.text("Authorized Signatory", 190, pageHeight - 15, { align: "right" });

                                                        doc.setFontSize(8);
                                                        doc.setTextColor(180);
                                                        doc.text("www.ddtech.com | Support: support@ddtech.com", 105, pageHeight - 10, { align: "center" });

                                                        doc.save(`Invoice_${customerInfo.name || "Customer"}_${new Date().getTime().toString().slice(-6)}.pdf`);
                                                    }}
                                                    className="py-3 bg-white text-teal-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-teal-50 transition-colors"
                                                >
                                                    <Download className="size-4" /> Download PDF
                                                </button>

                                                <button
                                                    onClick={async () => {
                                                        if (billingItems.length === 0) {
                                                            alert("Please add items first.");
                                                            return;
                                                        }

                                                        const doc = new jsPDF();

                                                        // --- REUSE GENERATION LOGIC FOR SHARING ---
                                                        doc.setFillColor(20, 184, 166);
                                                        doc.rect(0, 0, 210, 25, 'F');
                                                        doc.setTextColor(255);
                                                        doc.setFont("helvetica", "bold");
                                                        doc.setFontSize(24);
                                                        doc.text("DDTECH", 20, 17);
                                                        doc.setFontSize(14);
                                                        doc.setFont("helvetica", "normal");
                                                        doc.text("INVOICE", 190, 17, { align: "right" });
                                                        doc.setTextColor(50);
                                                        doc.setFontSize(10);
                                                        doc.setFont("helvetica", "bold");
                                                        doc.text("DDTECH TOOLS", 20, 45);
                                                        doc.setFont("helvetica", "normal");
                                                        doc.text("123 Tech Lane, Silicon Valley", 20, 51);
                                                        doc.text("Contact: +91 98765 43210", 20, 57);
                                                        doc.text("Email: support@ddtech.com", 20, 63);
                                                        doc.setFont("helvetica", "bold");
                                                        doc.text("BILL TO:", 120, 45);
                                                        doc.setFont("helvetica", "normal");
                                                        doc.text(`${customerInfo.name || "Valued Customer"}`, 120, 51);
                                                        doc.text(`${customerInfo.phone || "No Phone"}`, 120, 57);
                                                        doc.text(`${customerInfo.address || "No Address Provided"}`, 120, 63, { maxWidth: 70 });
                                                        doc.setDrawColor(230);
                                                        doc.line(20, 75, 190, 75);
                                                        doc.setFont("helvetica", "bold");
                                                        doc.text("DATE:", 20, 85);
                                                        doc.setFont("helvetica", "normal");
                                                        doc.text(new Date().toLocaleDateString(), 40, 85);
                                                        doc.setFont("helvetica", "bold");
                                                        doc.text("INVOICE NO:", 120, 85);
                                                        doc.setFont("helvetica", "normal");
                                                        doc.text(`INV-${new Date().getTime().toString().slice(-6)}`, 150, 85);

                                                        const tableData = billingItems.map((item: any) => {
                                                            const itemTotal = item.price * item.quantity;
                                                            const itemTax = item.taxes.reduce((tAcc: number, tax: any) => tAcc + (itemTotal * (tax.rate / 100)), 0);
                                                            return [item.name, `Rs. ${item.price.toLocaleString()}`, item.quantity, `Rs. ${itemTax.toLocaleString()}`, `Rs. ${(itemTotal + itemTax).toLocaleString()}`];
                                                        });

                                                        autoTable(doc, {
                                                            startY: 95,
                                                            head: [["Product Name", "Unit Price", "Quantity", "Tax Amount", "Total"]],
                                                            body: tableData,
                                                            theme: 'striped',
                                                            headStyles: { fillColor: [20, 184, 166], fontSize: 10, fontStyle: 'bold', halign: 'center' },
                                                            columnStyles: { 0: { cellWidth: 70 }, 1: { halign: 'right' }, 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right', fontStyle: 'bold' } },
                                                            didParseCell: (data) => { if (data.section === 'body' && data.column.index === 0) { if (Array.isArray(data.cell.text) && data.cell.text.length > 1) { data.cell.text = [data.cell.text[0]]; } } }
                                                        });

                                                        const finalY = (doc as any).lastAutoTable.finalY + 10;
                                                        const subtotal = billingItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
                                                        let taxTotal = 0;
                                                        billingItems.forEach((item: any) => {
                                                            item.taxes.forEach((tax: any) => { taxTotal += (item.price * item.quantity) * (tax.rate / 100); });
                                                        });
                                                        doc.setFillColor(245, 245, 245);
                                                        doc.rect(130, finalY, 60, 35, 'F');
                                                        doc.setFontSize(10);
                                                        doc.setTextColor(100);
                                                        doc.text("Subtotal:", 135, finalY + 10);
                                                        doc.text(`Rs. ${subtotal.toLocaleString()}`, 185, finalY + 10, { align: "right" });
                                                        doc.text("Tax Amount:", 135, finalY + 18);
                                                        doc.text(`Rs. ${taxTotal.toLocaleString()}`, 185, finalY + 18, { align: "right" });
                                                        doc.setDrawColor(200);
                                                        doc.line(135, finalY + 23, 185, finalY + 23);
                                                        doc.setFontSize(12);
                                                        doc.setTextColor(20, 184, 166);
                                                        doc.setFont("helvetica", "bold");
                                                        doc.text("Total:", 135, finalY + 30);
                                                        doc.text(`Rs. ${(subtotal + taxTotal).toLocaleString()}`, 185, finalY + 30, { align: "right" });

                                                        const pageHeight = doc.internal.pageSize.height;
                                                        doc.setFontSize(8);
                                                        doc.setTextColor(150);
                                                        doc.text("Terms & Conditions", 20, pageHeight - 30);
                                                        doc.text("1. All sales are final. 2. Please mention the invoice number for any queries.", 20, pageHeight - 25);
                                                        doc.setFontSize(10);
                                                        doc.setTextColor(20, 184, 166);
                                                        doc.setFont("helvetica", "bold");
                                                        doc.text("Authorized Signatory", 190, pageHeight - 15, { align: "right" });
                                                        doc.setFontSize(8);
                                                        doc.setTextColor(180);
                                                        doc.text("www.ddtech.com | Support: support@ddtech.com", 105, pageHeight - 10, { align: "center" });

                                                        // --- PDF SHARING LOGIC ---
                                                        const pdfBlob = doc.output('blob');
                                                        const fileName = `Invoice_${customerInfo.name || "Customer"}.pdf`;
                                                        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

                                                        const shareData = {
                                                            files: [file],
                                                            title: 'Invoice - DDTECH TOOLS',
                                                            text: `Invoice for ${customerInfo.name || "Customer"}`,
                                                        };

                                                        if (navigator.canShare && navigator.canShare(shareData)) {
                                                            try {
                                                                await navigator.share(shareData);
                                                            } catch (err) {
                                                                console.log("PDF share failed:", err);
                                                            }
                                                        } else {
                                                            // Fallback to WhatsApp text share
                                                            const total = subtotal + taxTotal;
                                                            const message = `Hello ${customerInfo.name || "Customer"},\n\nYour invoice from DDTECH TOOLS is ready.\nTotal: Rs. ${total.toLocaleString()}\n\n(PDF Sharing not supported on this browser)`;
                                                            const encodedMessage = encodeURIComponent(message);
                                                            const phone = customerInfo.phone ? customerInfo.phone.replace(/\D/g, '') : "";
                                                            window.open(`https://wa.me/${phone ? "91" + phone : ""}?text=${encodedMessage}`, '_blank');
                                                        }
                                                    }}
                                                    className="py-3 bg-teal-500 text-white border border-teal-400 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-teal-600 transition-colors"
                                                >
                                                    <Share2 className="size-4" /> Share PDF
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to reset the current bill?")) {
                                                        setBillingItems([]);
                                                        setCustomerInfo({ name: "", phone: "", email: "", address: "" });
                                                    }
                                                }}
                                                className="w-full py-2 text-xs text-white/60 hover:text-white transition-all underline decoration-white/20"
                                            >
                                                Reset Bill
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeView === 'categories' && <CategoriesView />}

                    {/* Add Product Modal */}
                    <AnimatePresence>
                        {
                            isAddModalOpen && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add New Product</h3>
                                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
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
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Brand</label>
                                                        <input
                                                            type="text"
                                                            value={newProduct.brand}
                                                            onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="e.g. Bosch"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Model Name</label>
                                                        <input
                                                            type="text"
                                                            value={newProduct.modelName}
                                                            onChange={(e) => setNewProduct({ ...newProduct, modelName: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="e.g. GSB 600"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rating</label>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            min="0"
                                                            max="5"
                                                            value={newProduct.rating}
                                                            onChange={(e) => setNewProduct({ ...newProduct, rating: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="4.5"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Month Sales</label>
                                                        <input
                                                            type="number"
                                                            value={newProduct.lastMonthSales}
                                                            onChange={(e) => setNewProduct({ ...newProduct, lastMonthSales: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="50"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2 ml-1">
                                                    <input
                                                        type="checkbox"
                                                        id="showOnHome"
                                                        checked={newProduct.showOnHome}
                                                        onChange={(e) => setNewProduct({ ...newProduct, showOnHome: e.target.checked })}
                                                        className="size-4 text-teal-600 rounded focus:ring-teal-500 border-gray-300"
                                                    />
                                                    <label htmlFor="showOnHome" className="text-sm font-medium text-slate-700 dark:text-slate-300">Show on Home Page</label>
                                                </div>

                                                {/* Tax Management */}
                                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                            <DollarSign className="size-4 text-teal-500" /> Tax Management
                                                        </h4>
                                                        <button
                                                            type="button"
                                                            onClick={() => setNewProduct({ ...newProduct, taxes: [...newProduct.taxes, { name: "", rate: 0 }] })}
                                                            className="text-xs px-2 py-1 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 rounded hover:bg-teal-200 transition-colors"
                                                        >
                                                            + Add Tax
                                                        </button>
                                                    </div>
                                                    {newProduct.taxes.map((tax, idx) => (
                                                        <div key={idx} className="flex gap-2 items-end">
                                                            <div className="flex-1">
                                                                <input
                                                                    type="text"
                                                                    value={tax.name}
                                                                    onChange={(e) => {
                                                                        const updatedTaxes = [...newProduct.taxes];
                                                                        updatedTaxes[idx].name = e.target.value;
                                                                        setNewProduct({ ...newProduct, taxes: updatedTaxes });
                                                                    }}
                                                                    placeholder="Tax Name (e.g. GST)"
                                                                    className="w-full px-3 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                                                                />
                                                            </div>
                                                            <div className="w-24">
                                                                <input
                                                                    type="number"
                                                                    value={tax.rate}
                                                                    onChange={(e) => {
                                                                        const updatedTaxes = [...newProduct.taxes];
                                                                        updatedTaxes[idx].rate = Number(e.target.value);
                                                                        setNewProduct({ ...newProduct, taxes: updatedTaxes });
                                                                    }}
                                                                    placeholder="Rate %"
                                                                    className="w-full px-3 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                                                                />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updatedTaxes = newProduct.taxes.filter((_, i) => i !== idx);
                                                                    setNewProduct({ ...newProduct, taxes: updatedTaxes });
                                                                }}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded"
                                                            >
                                                                <X className="size-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {newProduct.taxes.length === 0 && (
                                                        <p className="text-xs text-slate-400 italic">No taxes added.</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                                    <select
                                                        required
                                                        value={newProduct.category}
                                                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categoriesList.map(cat => (
                                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
                                                    <div className="relative">
                                                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URLs (comma separated)</label>
                                                        <div className="relative">
                                                            <ImageIcon className="absolute left-3 top-3 text-slate-400 size-4" />
                                                            <textarea
                                                                value={newProduct.imagesInput}
                                                                onChange={(e) => setNewProduct({ ...newProduct, imagesInput: e.target.value })}
                                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none h-24 resize-none"
                                                                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                                                            />
                                                        </div>
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
                                                    onClick={() => setIsAddModalOpen(false)}
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
                    </AnimatePresence >

                    {/* Edit Product Modal */}
                    <AnimatePresence>
                        {
                            isEditModalOpen && editingProduct && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Product</h3>
                                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                <X className="size-6" />
                                            </button>
                                        </div>
                                        <form onSubmit={handleUpdateProduct} className="flex flex-col max-h-[90vh]">
                                            <div className="p-6 space-y-4 overflow-y-auto">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                                                    <div className="relative">
                                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                                        <input
                                                            required
                                                            type="text"
                                                            value={editingProduct.name}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
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
                                                                value={editingProduct.price}
                                                                onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
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
                                                            value={editingProduct.stock}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="100"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Brand</label>
                                                        <input
                                                            type="text"
                                                            value={editingProduct.brand}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="e.g. Bosch"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Model Name</label>
                                                        <input
                                                            type="text"
                                                            value={editingProduct.modelName}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, modelName: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="e.g. GSB 600"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rating</label>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            min="0"
                                                            max="5"
                                                            value={editingProduct.rating}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, rating: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="4.5"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Month Sales</label>
                                                        <input
                                                            type="number"
                                                            value={editingProduct.lastMonthSales}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, lastMonthSales: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="50"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2 ml-1">
                                                    <input
                                                        type="checkbox"
                                                        id="editShowOnHome"
                                                        checked={editingProduct.showOnHome}
                                                        onChange={(e) => setEditingProduct({ ...editingProduct, showOnHome: e.target.checked })}
                                                        className="size-4 text-teal-600 rounded focus:ring-teal-500 border-gray-300"
                                                    />
                                                    <label htmlFor="editShowOnHome" className="text-sm font-medium text-slate-700 dark:text-slate-300">Show on Home Page</label>
                                                </div>

                                                {/* Tax Management */}
                                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                            <DollarSign className="size-4 text-teal-500" /> Tax Management
                                                        </h4>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingProduct({ ...editingProduct, taxes: [...(editingProduct.taxes || []), { name: "", rate: 0 }] })}
                                                            className="text-xs px-2 py-1 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 rounded hover:bg-teal-200 transition-colors"
                                                        >
                                                            + Add Tax
                                                        </button>
                                                    </div>
                                                    {(editingProduct.taxes || []).map((tax: any, idx: number) => (
                                                        <div key={idx} className="flex gap-2 items-end">
                                                            <div className="flex-1">
                                                                <input
                                                                    type="text"
                                                                    value={tax.name}
                                                                    onChange={(e) => {
                                                                        const updatedTaxes = [...editingProduct.taxes];
                                                                        updatedTaxes[idx].name = e.target.value;
                                                                        setEditingProduct({ ...editingProduct, taxes: updatedTaxes });
                                                                    }}
                                                                    placeholder="Tax Name (e.g. GST)"
                                                                    className="w-full px-3 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                                                                />
                                                            </div>
                                                            <div className="w-24">
                                                                <input
                                                                    type="number"
                                                                    value={tax.rate}
                                                                    onChange={(e) => {
                                                                        const updatedTaxes = [...editingProduct.taxes];
                                                                        updatedTaxes[idx].rate = Number(e.target.value);
                                                                        setEditingProduct({ ...editingProduct, taxes: updatedTaxes });
                                                                    }}
                                                                    placeholder="Rate %"
                                                                    className="w-full px-3 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                                                                />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updatedTaxes = editingProduct.taxes.filter((_: any, i: number) => i !== idx);
                                                                    setEditingProduct({ ...editingProduct, taxes: updatedTaxes });
                                                                }}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded"
                                                            >
                                                                <X className="size-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {(!editingProduct.taxes || editingProduct.taxes.length === 0) && (
                                                        <p className="text-xs text-slate-400 italic">No taxes added.</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                                    <select
                                                        required
                                                        value={editingProduct.category}
                                                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categoriesList.map(cat => (
                                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
                                                    <div className="relative">
                                                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URLs (comma separated)</label>
                                                        <div className="relative">
                                                            <ImageIcon className="absolute left-3 top-3 text-slate-400 size-4" />
                                                            <textarea
                                                                value={editingProduct.imagesInput}
                                                                onChange={(e) => setEditingProduct({ ...editingProduct, imagesInput: e.target.value })}
                                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none h-24 resize-none"
                                                                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                                    <textarea
                                                        value={editingProduct.description}
                                                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none h-24 resize-none"
                                                        placeholder="Product details..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditModalOpen(false)}
                                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                                >
                                                    {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Update Product'}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                </div>
                            )
                        }
                    </AnimatePresence >

                    {/* Coupons View */}
                    {activeView === 'coupons' && (
                        <div className="space-y-8">
                            {/* Header & Create Button */}
                            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Coupon Management</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Create and manage discount codes</p>
                                </div>
                                <button
                                    onClick={() => setIsAddCouponModalOpen(true)}
                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-teal-500/20"
                                >
                                    <Plus className="size-4" /> Create Coupon
                                </button>
                            </div>

                            {/* Active Coupons */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Ticket className="size-5 text-teal-500" /> Active Coupons
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                                            <tr>
                                                <th className="p-4">Code</th>
                                                <th className="p-4">Discount</th>
                                                <th className="p-4">Expiry</th>
                                                <th className="p-4 text-center">Status</th>
                                                <th className="p-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {couponsList.filter(c => !c.expiresAt || new Date(c.expiresAt) > new Date()).map(coupon => (
                                                <tr key={coupon._id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${!coupon.isActive ? 'opacity-60' : ''}`}>
                                                    <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                                                        {coupon.code}
                                                    </td>
                                                    <td className="p-4 text-slate-600 dark:text-slate-400">
                                                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                                                    </td>
                                                    <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">
                                                        {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Never'}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={coupon.isActive}
                                                            onChange={() => toggleCouponStatus(coupon._id, coupon.isActive)}
                                                            className="size-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button onClick={() => handleDeleteCoupon(coupon._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {couponsList.filter(c => !c.expiresAt || new Date(c.expiresAt) > new Date()).length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-slate-500">No active coupons found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Expired Coupons */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden opacity-80">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/30">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Trash2 className="size-5 text-slate-400" /> Expired Coupons
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                                            <tr>
                                                <th className="p-4">Code</th>
                                                <th className="p-4">Discount</th>
                                                <th className="p-4">Expired On</th>
                                                <th className="p-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {couponsList.filter(c => c.expiresAt && new Date(c.expiresAt) <= new Date()).map(coupon => (
                                                <tr key={coupon._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors bg-red-50/10">
                                                    <td className="p-4 font-mono font-bold text-slate-500 dark:text-slate-400 line-through">
                                                        {coupon.code}
                                                    </td>
                                                    <td className="p-4 text-slate-500 dark:text-slate-500">
                                                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                                                    </td>
                                                    <td className="p-4 text-red-500 text-sm font-medium">
                                                        {new Date(coupon.expiresAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button onClick={() => handleDeleteCoupon(coupon._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {couponsList.filter(c => c.expiresAt && new Date(c.expiresAt) <= new Date()).length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="p-8 text-center text-slate-500">No expired coupons found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* View Order Modal */}
                    <AnimatePresence>
                        {viewingOrder && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]"
                                >
                                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Order Details</h3>
                                            <p className="text-sm text-slate-500">#{viewingOrder._id}</p>
                                        </div>
                                        <button onClick={() => setViewingOrder(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <X className="size-6" />
                                        </button>
                                    </div>

                                    <div className="p-6 overflow-y-auto space-y-6">
                                        {/* Status & Date */}
                                        <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Status</p>
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${viewingOrder.status === 'delivered' ? 'bg-green-100 text-green-700' : viewingOrder.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {viewingOrder.status}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Date</p>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{new Date(viewingOrder.createdAt).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {/* Customer & Shipping */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <Users className="size-4" /> Customer Details
                                                </h4>
                                                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <p><span className="font-medium text-slate-900 dark:text-white">Name:</span> {viewingOrder.shippingInfo.fullName}</p>
                                                    <p><span className="font-medium text-slate-900 dark:text-white">Email:</span> {viewingOrder.shippingInfo.email}</p>
                                                    <p><span className="font-medium text-slate-900 dark:text-white">Phone:</span> {viewingOrder.shippingInfo.phone || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <Truck className="size-4" /> Shipping Address
                                                </h4>
                                                <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                                    <p>{viewingOrder.shippingInfo.address}</p>
                                                    <p>{viewingOrder.shippingInfo.city}, {viewingOrder.shippingInfo.pincode}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                                <ShoppingBag className="size-4" /> Ordered Items
                                            </h4>
                                            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500">
                                                        <tr>
                                                            <th className="p-3 font-medium">Product</th>
                                                            <th className="p-3 font-medium text-center">Qty</th>
                                                            <th className="p-3 font-medium text-right">Price</th>
                                                            <th className="p-3 font-medium text-right">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                                        {viewingOrder.items.map((item: any, idx: number) => (
                                                            <tr key={idx}>
                                                                <td className="p-3">
                                                                    <div className="flex items-center gap-3">
                                                                        {item.product?.image ? (
                                                                            <img src={item.product?.image} alt={item.product?.name} className="size-10 rounded-lg object-cover bg-slate-100" />
                                                                        ) : (
                                                                            <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">IMG</div>
                                                                        )}
                                                                        <div>
                                                                            <p className="font-medium text-slate-900 dark:text-white line-clamp-1">{item.product?.name || 'Unknown Product'}</p>
                                                                            <p className="text-xs text-slate-400">ID: {item.product?._id || item.product}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="p-3 text-center text-slate-600 dark:text-slate-400">{item.quantity}</td>
                                                                <td className="p-3 text-right text-slate-600 dark:text-slate-400">₹{item.price.toLocaleString()}</td>
                                                                <td className="p-3 text-right font-medium text-slate-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString()}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Payment & Totals */}
                                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Payment Method</span>
                                                <span className="font-bold text-slate-900 dark:text-white uppercase">{viewingOrder.paymentMethod}</span>
                                            </div>
                                            {viewingOrder.coupon && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Coupon Applied</span>
                                                    <span className="font-medium text-teal-600">{viewingOrder.coupon}</span>
                                                </div>
                                            )}
                                            {viewingOrder.discountAmount > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Discount</span>
                                                    <span className="font-medium text-green-600">-₹{viewingOrder.discountAmount.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-end">
                                                <span className="text-slate-900 dark:text-white font-bold">Total Amount</span>
                                                <span className="text-2xl font-bold text-teal-600">₹{viewingOrder.totalAmount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 border-t border-slate-100 dark:border-slate-700">
                                        <button
                                            onClick={() => setViewingOrder(null)}
                                            className="w-full px-4 py-3 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Add User Modal */}
                    <AnimatePresence>
                        {
                            isAddUserModalOpen && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add New User</h3>
                                            <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                <X className="size-6" />
                                            </button>
                                        </div>
                                        <form onSubmit={handleCreateUser} className="flex flex-col max-h-[90vh]">
                                            <div className="p-6 space-y-4 overflow-y-auto">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                                                        <input
                                                            required
                                                            type="text"
                                                            value={newUser.firstName}
                                                            onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                                                        <input
                                                            required
                                                            type="text"
                                                            value={newUser.lastName}
                                                            onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                                    <input
                                                        required
                                                        type="email"
                                                        value={newUser.email}
                                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                                                    <input
                                                        type="text"
                                                        value={newUser.phone}
                                                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                                                    <input
                                                        required
                                                        type="password"
                                                        value={newUser.password}
                                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                                                    <select
                                                        value={newUser.role}
                                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAddUserModalOpen(false)}
                                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                                >
                                                    {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Create User'}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                </div>
                            )
                        }
                    </AnimatePresence >



                    {/* Edit User Modal */}
                    <AnimatePresence>
                        {
                            isEditUserModalOpen && editingUser && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit User</h3>
                                            <button onClick={() => setIsEditUserModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                <X className="size-6" />
                                            </button>
                                        </div>
                                        <form onSubmit={handleUpdateUser} className="flex flex-col max-h-[90vh]">
                                            <div className="p-6 space-y-4 overflow-y-auto">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                                                        <input
                                                            type="text"
                                                            value={editingUser.firstName || ''}
                                                            onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                                                        <input
                                                            type="text"
                                                            value={editingUser.lastName || ''}
                                                            onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                                    <input
                                                        type="email"
                                                        value={editingUser.email || ''}
                                                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                                                    <input
                                                        type="text"
                                                        value={editingUser.phone || ''}
                                                        onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password (leave blank to keep current)</label>
                                                    <input
                                                        type="password"
                                                        value={editingUser.password || ''}
                                                        onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditUserModalOpen(false)}
                                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                                >
                                                    {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Update User'}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                </div>
                            )
                        }
                    </AnimatePresence >

                    {/* Edit Order Modal */}
                    <AnimatePresence>
                        {
                            isEditOrderModalOpen && editingOrder && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Order Details</h3>
                                            <button onClick={() => setIsEditOrderModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                <X className="size-6" />
                                            </button>
                                        </div>
                                        <form onSubmit={handleUpdateOrder} className="flex flex-col max-h-[90vh]">
                                            <div className="p-6 space-y-4 overflow-y-auto">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                                    <select
                                                        value={editingOrder.status}
                                                        onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    >
                                                        <option value="processing">Processing</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                                    <input
                                                        type="text"
                                                        value={editingOrder.fullName}
                                                        onChange={(e) => setEditingOrder({ ...editingOrder, fullName: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                                                    <textarea
                                                        value={editingOrder.address}
                                                        onChange={(e) => setEditingOrder({ ...editingOrder, address: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none min-h-[100px]"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City</label>
                                                        <input
                                                            type="text"
                                                            value={editingOrder.city}
                                                            onChange={(e) => setEditingOrder({ ...editingOrder, city: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pincode</label>
                                                        <input
                                                            type="text"
                                                            value={editingOrder.pincode}
                                                            onChange={(e) => setEditingOrder({ ...editingOrder, pincode: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                                                    <input
                                                        type="text"
                                                        value={editingOrder.phone}
                                                        onChange={(e) => setEditingOrder({ ...editingOrder, phone: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditOrderModalOpen(false)}
                                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                                >
                                                    {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Save Changes'}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                </div>
                            )
                        }
                    </AnimatePresence >

                    {/* Create Coupon Modal */}
                    <AnimatePresence>
                        {isAddCouponModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                                >
                                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create New Coupon</h3>
                                        <button onClick={() => setIsAddCouponModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <X className="size-6" />
                                        </button>
                                    </div>
                                    <form onSubmit={handleCreateCoupon} className="flex flex-col max-h-[90vh]">
                                        <div className="p-6 space-y-4 overflow-y-auto">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Code</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={newCoupon.code}
                                                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                                                    placeholder="SUMMER25"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                                                    <select
                                                        value={newCoupon.discountType}
                                                        onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    >
                                                        <option value="percentage">Percentage (%)</option>
                                                        <option value="fixed">Fixed Amount ($)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Value</label>
                                                    <input
                                                        required
                                                        type="number"
                                                        min="0"
                                                        value={newCoupon.discountValue}
                                                        onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expiry Date</label>
                                                <input
                                                    type="date"
                                                    value={newCoupon.expiresAt}
                                                    onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                />
                                            </div>
                                            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                                <input
                                                    type="checkbox"
                                                    id="newCouponActive"
                                                    checked={newCoupon.isActive}
                                                    onChange={(e) => setNewCoupon({ ...newCoupon, isActive: e.target.checked })}
                                                    className="size-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                />
                                                <label htmlFor="newCouponActive" className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer">
                                                    Active immediately
                                                </label>
                                            </div>
                                        </div>
                                        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsAddCouponModalOpen(false)}
                                                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Create Coupon'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Edit Coupon Modal */}
                    <AnimatePresence>
                        {isEditCouponModalOpen && editingCoupon && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                                >
                                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Coupon</h3>
                                        <button onClick={() => setIsEditCouponModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <X className="size-6" />
                                        </button>
                                    </div>
                                    <form onSubmit={handleUpdateCoupon} className="flex flex-col max-h-[90vh]">
                                        <div className="p-6 space-y-4 overflow-y-auto">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Code</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={editingCoupon.code}
                                                    onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                                                    <select
                                                        value={editingCoupon.discountType}
                                                        onChange={(e) => setEditingCoupon({ ...editingCoupon, discountType: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    >
                                                        <option value="percentage">Percentage (%)</option>
                                                        <option value="fixed">Fixed Amount ($)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Value</label>
                                                    <input
                                                        required
                                                        type="number"
                                                        min="0"
                                                        value={editingCoupon.discountValue}
                                                        onChange={(e) => setEditingCoupon({ ...editingCoupon, discountValue: Number(e.target.value) })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expiry Date</label>
                                                <input
                                                    type="date"
                                                    value={editingCoupon.expiresAt ? new Date(editingCoupon.expiresAt).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => setEditingCoupon({ ...editingCoupon, expiresAt: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                />
                                            </div>
                                            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                                <input
                                                    type="checkbox"
                                                    id="editCouponActive"
                                                    checked={editingCoupon.isActive}
                                                    onChange={(e) => setEditingCoupon({ ...editingCoupon, isActive: e.target.checked })}
                                                    className="size-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                />
                                                <label htmlFor="editCouponActive" className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer">
                                                    Active
                                                </label>
                                            </div>
                                        </div>
                                        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditCouponModalOpen(false)}
                                                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Add Blog Modal */}
                    <AnimatePresence>
                        {isAddBlogModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
                                >
                                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create New Blog</h3>
                                        <button onClick={() => setIsAddBlogModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <X className="size-6" />
                                        </button>
                                    </div>
                                    <form onSubmit={handleCreateBlog} className="flex flex-col max-h-[90vh]">
                                        <div className="p-6 space-y-4 overflow-y-auto">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={newBlog.title}
                                                    onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    placeholder="Enter blog title"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Slug (URL-friendly)</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={newBlog.slug}
                                                    onChange={(e) => setNewBlog({ ...newBlog, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none font-mono text-sm"
                                                    placeholder="my-blog-post"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Author</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={newBlog.author}
                                                        onChange={(e) => setNewBlog({ ...newBlog, author: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                        placeholder="John Doe"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
                                                    <input
                                                        type="url"
                                                        value={newBlog.image}
                                                        onChange={(e) => setNewBlog({ ...newBlog, image: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags (comma-separated)</label>
                                                <input
                                                    type="text"
                                                    value={newBlog.tags.join(', ')}
                                                    onChange={(e) => setNewBlog({ ...newBlog, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    placeholder="technology, tools, tips"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
                                                <textarea
                                                    required
                                                    value={newBlog.content}
                                                    onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none min-h-[200px] resize-y"
                                                    placeholder="Write your blog content here..."
                                                />
                                            </div>
                                        </div>
                                        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsAddBlogModalOpen(false)}
                                                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Create Blog'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Edit Blog Modal */}
                    <AnimatePresence>
                        {isEditBlogModalOpen && editingBlog && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
                                >
                                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Blog</h3>
                                        <button onClick={() => setIsEditBlogModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <X className="size-6" />
                                        </button>
                                    </div>
                                    <form onSubmit={handleUpdateBlog} className="flex flex-col max-h-[90vh]">
                                        <div className="p-6 space-y-4 overflow-y-auto">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={editingBlog.title}
                                                    onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Slug (URL-friendly)</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={editingBlog.slug}
                                                    onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none font-mono text-sm"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Author</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={editingBlog.author}
                                                        onChange={(e) => setEditingBlog({ ...editingBlog, author: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
                                                    <input
                                                        type="url"
                                                        value={editingBlog.image}
                                                        onChange={(e) => setEditingBlog({ ...editingBlog, image: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags (comma-separated)</label>
                                                <input
                                                    type="text"
                                                    value={editingBlog.tags.join(', ')}
                                                    onChange={(e) => setEditingBlog({ ...editingBlog, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
                                                <textarea
                                                    required
                                                    value={editingBlog.content}
                                                    onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none min-h-[200px] resize-y"
                                                />
                                            </div>
                                        </div>
                                        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditBlogModalOpen(false)}
                                                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                </div>
            </main >
            {/* Credit Management Modal */}
            <AnimatePresence>
                {showCreditModal && selectedUserForCredit && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6 border border-slate-100 dark:border-slate-800"
                        >
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Coins className="size-5 text-amber-500" />
                                Manage Credit Points
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Update credit points for <strong>{selectedUserForCredit.firstName}</strong>.
                                Current Balance: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{selectedUserForCredit.creditBalance || 0}</span>
                            </p>

                            <form onSubmit={handleUpdateCredit} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Points to Add (or subtract)</label>
                                    <input
                                        type="number"
                                        autoFocus
                                        value={creditAmount}
                                        onChange={(e) => setCreditAmount(parseInt(e.target.value) || "")}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-teal-500 outline-none"
                                        placeholder="e.g. 100 or -50"
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreditModal(false)}
                                        className="flex-1 py-2 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isProcessingCredit || creditAmount === ""}
                                        className="flex-1 py-2 px-4 rounded-lg bg-teal-600 text-white hover:bg-teal-700 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isProcessingCredit ? <Loader2 className="animate-spin size-4" /> : "Update"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

function StatCard({ title, value, icon, bg }: { title: string, value: string | number, icon: React.ReactNode, bg: string }) {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
            <div className={`size-12 rounded-xl flex items-center justify-center ${bg}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
            </div>
        </div>
    );
}

export default AdminDashboard;
