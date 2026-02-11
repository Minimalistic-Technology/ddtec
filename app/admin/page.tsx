"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../_context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Package, DollarSign, ShoppingBag, Loader2, Trash2, Edit, Plus, X, Tag, Image as ImageIcon, Layers, Ticket, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/api";
import ToggleSwitch from "./components/ToggleSwitch";

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
    }>;
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
}



interface Product {
    _id: string;
    name: string;
    price: number;
    category: string;
    stock: number;
    couponCode?: string;
    discountPercentage?: number;
    discountType?: 'percentage' | 'fixed';
    discountValue?: number;
    isActive: boolean;
}

const AdminDashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [activeView, setActiveView] = useState<'dashboard' | 'products' | 'users' | 'orders' | 'inventory'>('dashboard');

    // Data for Manage Views
    const [usersList, setUsersList] = useState<User[]>([]);
    const [ordersList, setOrdersList] = useState<any[]>([]);

    const [productsList, setProductsList] = useState<Product[]>([]);
    const [loadingData, setLoadingData] = useState(false);

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
        lastMonthSales: ""
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

    // Sidebar State
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

    const fetchOrders = async () => {
        setLoadingData(true);
        try {
            const res = await api.get('/orders');
            setOrdersList(res.data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoadingData(false);
        }
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
                modelName: newProduct.modelName
            });

            if (res.status === 200 || res.status === 201) {
                fetchProducts();
                setIsAddModalOpen(false);
                setNewProduct({
                    name: "", price: "", description: "", image: "", imagesInput: "", category: "", stock: "", brand: "",
                    modelName: "", rating: "", lastMonthSales: ""
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
            brand: (product as any).brand || "",
            modelName: (product as any).modelName || "",
            rating: String((product as any).rating || 0),
            lastMonthSales: String((product as any).lastMonthSales || 0)
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
                discountPercentage: Number(editingProduct.discountValue),
                discountType: editingProduct.discountType,
                discountValue: Number(editingProduct.discountValue)
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

    const handleViewChange = (view: 'dashboard' | 'products' | 'users' | 'orders' | 'inventory') => {
        setActiveView(view);
        if (view === 'users') fetchUsers();
        if (view === 'products' || view === 'inventory') fetchProducts();
        if (view === 'orders') fetchOrders();
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
            setOrdersList(prev => prev.map(order => order._id === orderId ? { ...order, status: newStatus } : order));
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.msg || "Failed to update order status");
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
                            <button onClick={() => router.push('/admin/coupons')} className={`w-full flex items-center p-2 rounded-lg group text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                <Ticket className="size-5 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                {!isSidebarCollapsed && <span className="ms-3">Coupons</span>}
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
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <StatCard
                                    title="Total Users"
                                    value={stats?.users || 0}
                                    icon={<Users className="size-6 text-blue-600" />}
                                    bg="bg-blue-50 dark:bg-blue-900/20"
                                />
                                <StatCard
                                    title="Total Products"
                                    value={stats?.products || 0}
                                    icon={<Package className="size-6 text-teal-600" />}
                                    bg="bg-teal-50 dark:bg-teal-900/20"
                                />
                                <StatCard
                                    title="Total Orders"
                                    value={stats?.orders || 0}
                                    icon={<ShoppingBag className="size-6 text-purple-600" />}
                                    bg="bg-purple-50 dark:bg-purple-900/20"
                                />
                                <StatCard
                                    title="Total Revenue"
                                    value={`₹${(stats?.revenue || 0).toLocaleString()}`}
                                    icon={<DollarSign className="size-6 text-green-600" />}
                                    bg="bg-green-50 dark:bg-green-900/20"
                                />
                            </div>

                            {/* Recent Activity */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
                                    <div className="space-y-4">
                                        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                                            stats.recentActivity.map((order) => (
                                                <div key={order._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                    <div className="size-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
                                                        <ShoppingBag className="size-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-slate-900 dark:text-white">Order placed by {order.shippingInfo.fullName}</p>
                                                        <p className="text-sm text-slate-500">
                                                            ₹{order.totalAmount.toFixed(2)} - {new Date(order.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 capitalize">
                                                        {order.status}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-500">No recent activity.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => handleViewChange('products')} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left group">
                                            <Package className="size-6 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="font-medium text-slate-900 dark:text-white block">Manage Products</span>
                                        </button>
                                        <button onClick={() => handleViewChange('users')} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left group">
                                            <Users className="size-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="font-medium text-slate-900 dark:text-white block">Manage Users</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
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
                                                <td className="p-4 text-right flex justify-end items-center gap-2">
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
                                            <th className="p-4">Stock</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {productsList.map(p => (
                                            <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                <td className="p-4 font-medium text-slate-900 dark:text-white">{p.name}</td>
                                                <td className="p-4 text-slate-600 dark:text-slate-400">{p.category}</td>
                                                <td className="p-4 text-slate-900 dark:text-white font-medium">₹{p.price}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {p.stock}
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
                                                <td className="p-4 text-slate-600 dark:text-slate-400">{p.category}</td>
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
                                                                if (amount && !isNaN(Number(amount))) {
                                                                    try {
                                                                        await api.put(`/products/${p._id}`, { stock: p.stock + Number(amount) });
                                                                        fetchProducts();
                                                                    } catch (e) { alert("Failed to restock"); }
                                                                }
                                                            }}
                                                            className="px-3 py-1 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 rounded-lg text-xs font-bold hover:bg-teal-100 transition-colors"
                                                        >
                                                            Add Stock
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
                                                        onClick={() => alert("Order Details View Coming Soon")}
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
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                                    <select
                                                        value={editingProduct.category}
                                                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
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


                </div>
            </main >
        </div >
    );
};

function StatCard({ title, value, icon, bg }: { title: string, value: string | number, icon: React.ReactNode, bg: string }) {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4" >
            <div className={`size-12 rounded-xl flex items-center justify-center ${bg}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
            </div>
        </div >
    );
}

export default AdminDashboard;
