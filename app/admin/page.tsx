"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../_context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Package, DollarSign, ShoppingBag, Loader2, Trash2, Edit, Plus, X, Tag,
    Image as ImageIcon, Layers, Ticket, Shield, ChevronLeft, ChevronRight, Mail,
    Truck, Folder, Coins, Download, Share2, Receipt, Layout, Menu
} from "lucide-react";
import api from "@/lib/api";

// Types
import {
    DashboardStats, User, Product, Blog, Message,
    BillingItem, CustomerInfo, Tax
} from "@/lib/types";

// Base Components
import ToggleSwitch from "./components/ToggleSwitch";
import CategoriesView from "./components/CategoriesView";

// Modular Views
import DashboardOverview from "./components/Views/DashboardOverview";
import ProductsView from "./components/Views/ProductsView";
import UsersView from "./components/Views/UsersView";
import OrdersView from "./components/Views/OrdersView";
import InventoryView from "./components/Views/InventoryView";
import MessagesView from "./components/Views/MessagesView";
import BlogsView from "./components/Views/BlogsView";
import BillingView from "./components/Views/BillingView";
import CouponsView from "./components/Views/CouponsView";
import BillsView from "./components/Views/BillsView";
import ComponentsView from "./components/Views/ComponentsView";

// Modular Modals
import UserModal from "./components/Modals/UserModal";
import ProductModal from "./components/Modals/ProductModal";
import BlogModal from "./components/Modals/BlogModal";
import OrderEditModal from "./components/Modals/OrderEditModal";
import CreditModal from "./components/Modals/CreditModal";
import ViewCouponsModal from "./components/Modals/ViewCouponsModal";
import ViewOrderDetailsModal from "./components/Modals/ViewOrderDetailsModal";
import CouponModal from "./components/Modals/CouponModal";
import BillingModal from "./components/Modals/BillingModal";

const ROLE_PERMISSIONS: Record<string, string[]> = {
    super_admin: ['dashboard', 'categories', 'products', 'inventory', 'orders', 'billing', 'coupons', 'users', 'messages', 'blogs', 'components'],
    product_manager: ['products', 'inventory', 'categories', 'dashboard'],
    order_manager: ['orders', 'billing', 'dashboard'],
    customer_support: ['users', 'messages', 'orders', 'dashboard'],
    finance: ['dashboard', 'billing'],
    marketing: ['coupons', 'blogs', 'dashboard'],
    admin: ['dashboard', 'categories', 'products', 'inventory', 'orders', 'billing', 'coupons', 'users', 'messages', 'blogs']
};

const AdminDashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [activeView, setActiveView] = useState<'dashboard' | 'products' | 'users' | 'orders' | 'inventory' | 'messages' | 'coupons' | 'blogs' | 'categories' | 'billing' | 'components' | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Data for Manage Views
    const [usersList, setUsersList] = useState<User[]>([]);
    const [ordersList, setOrdersList] = useState<any[]>([]);
    const [messagesList, setMessagesList] = useState<Message[]>([]);
    const [couponsList, setCouponsList] = useState<any[]>([]);
    const [blogsList, setBlogsList] = useState<Blog[]>([]);
    const [billsList, setBillsList] = useState<any[]>([]);

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
    const [newUser, setNewUser] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "user",
        customPages: [] as string[],
        editPages: [] as string[],
        addPages: [] as string[],
        deletePages: [] as string[]
    });

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
    const [creditAmount, setCreditAmount] = useState<string>("");
    const [creditOperation, setCreditOperation] = useState<'add' | 'set'>('add');
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
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: "", phone: "", email: "", address: "" });
    const [billingSearchQuery, setBillingSearchQuery] = useState("");
    const [billingSearchResults, setBillingSearchResults] = useState<Product[]>([]);
    const [showBillingSearchResults, setShowBillingSearchResults] = useState(false);
    const [globalTaxEnabled, setGlobalTaxEnabled] = useState(true);
    const [globalTaxRate, setGlobalTaxRate] = useState(18);
    const [isAddBillModalOpen, setIsAddBillModalOpen] = useState(false);
    const [editingBillId, setEditingBillId] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push("/login");
            } else if (user.role === "user") {
                router.push("/");
            } else {
                fetchStats();
                // Set initial view based on permissions
                const userRole = user.role || 'user';
                const allowed = ROLE_PERMISSIONS[userRole] || [];
                // Combine roles with custom pages.
                const userCustomPages = user.customPages || [];
                const allAllowed = Array.from(new Set([...allowed, ...userCustomPages]));
                if (!activeView) {
                    if (allAllowed.includes('dashboard')) {
                        setActiveView('dashboard');
                    } else if (allAllowed.length > 0) {
                        setActiveView(allAllowed[0] as any);
                    }
                }
            }
        }
    }, [user, authLoading, router, activeView]);

    // Listen for mobile sidebar toggle from Navbar hamburger
    useEffect(() => {
        const handler = () => setIsMobileMenuOpen(prev => !prev);
        window.addEventListener('toggle-admin-sidebar', handler);
        return () => window.removeEventListener('toggle-admin-sidebar', handler);
    }, []);

    useEffect(() => {
        if (user && activeView) {
            const allowed = ROLE_PERMISSIONS[user.role] || [];
            const userCustomPages = user.customPages || [];
            const allAllowed = Array.from(new Set([...allowed, ...userCustomPages]));
            if (!allAllowed.includes(activeView) && user.role !== 'super_admin' && user.role !== 'admin') {
                setActiveView(allAllowed[0] as any || null);
            }
        }
    }, [user, activeView]);

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

    const handleDeleteMessage = async (id: string) => {
        if (!confirm("Are you sure you want to delete this message?")) return;
        try {
            await api.delete(`/contact/${id}`);
            setMessagesList(prev => prev.filter(m => m._id !== id));
            alert("Message deleted successfully");
        } catch (error) {
            console.error(error);
            alert("Failed to delete message");
        }
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
        if (activeView === 'billing') fetchBills();
    }, [activeView]);

    const fetchBills = async () => {
        setLoadingData(true);
        try {
            const { data } = await api.get('/bills');
            setBillsList(data);
        } catch (error) { console.error("Failed to fetch bills", error); }
        finally { setLoadingData(false); }
    };

    const handleDeleteBill = async (id: string) => {
        if (!confirm("Are you sure you want to delete this bill record?")) return;
        try {
            await api.delete(`/bills/${id}`);
            setBillsList(prev => prev.filter(b => b._id !== id));
            alert("Bill deleted successfully");
        } catch (error) {
            console.error(error);
            alert("Failed to delete bill");
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


    const handleEditProductClick = (product: Product) => {
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

    const handleViewChange = (view: 'dashboard' | 'products' | 'users' | 'orders' | 'inventory' | 'messages' | 'coupons' | 'blogs' | 'categories' | 'billing' | 'components') => {
        const userRole = user?.role || 'user';
        const allowed = ROLE_PERMISSIONS[userRole] || [];
        const userCustomPages = user?.customPages || [];
        const allAllowed = Array.from(new Set([...allowed, ...userCustomPages]));

        if (allAllowed.includes(view) || userRole === 'super_admin') {
            setActiveView(view as any);
            if (view === 'users') fetchUsers();
            if (view === 'products' || view === 'inventory' || view === 'billing') fetchProducts();
            if (view === 'orders') fetchOrders();
            if (view === 'messages') fetchMessages();
            if (view === 'coupons') fetchCoupons();
            if (view === 'blogs') fetchBlogs();
            if (view === 'categories' || view === 'products') fetchCategories();
            if (view === 'billing') fetchBills();
        } else {
            alert("You do not have permission to access this view.");
        }
    };




    const canView = (module: string) => {
        if (!user) return false;
        if (user.role === 'super_admin') return true;
        const allowed = ROLE_PERMISSIONS[user.role] || [];
        const custom = user.customPages || [];
        return allowed.includes(module) || custom.includes(module);
    };

    const canAdd = (module: string) => {
        if (!user) return false;
        if (user.role === 'super_admin') return true;
        const adds = user.addPages || [];
        return adds.includes(module);
    };

    const canEdit = (module: string) => {
        if (!user) return false;
        if (user.role === 'super_admin') return true;
        const edits = user.editPages || [];
        return edits.includes(module);
    };

    const canDelete = (module: string) => {
        if (!user) return false;
        if (user.role === 'super_admin') return true;
        const deletes = user.deletePages || [];
        return deletes.includes(module);
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

    const handleEditBlogClick = (blog: Blog) => {
        setEditingBlog(blog);
        setIsEditBlogModalOpen(true);
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/auth/create-user', newUser);
            fetchUsers();
            setIsAddUserModalOpen(false);
            setNewUser({
                firstName: "", lastName: "", email: "", password: "", role: "user",
                customPages: [] as string[], editPages: [] as string[],
                addPages: [] as string[], deletePages: [] as string[]
            });
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
        // Prioritize user.customPages if it exists, otherwise fallback to ROLE_PERMISSIONS
        const cp = rest.customPages !== undefined ? rest.customPages : (ROLE_PERMISSIONS[rest.role || 'user'] || []);
        const ep = rest.editPages !== undefined ? rest.editPages : [];
        const ap = rest.addPages !== undefined ? rest.addPages : [];
        const dp = rest.deletePages !== undefined ? rest.deletePages : [];
        setEditingUser({ ...rest, customPages: cp, editPages: ep, addPages: ap, deletePages: dp });
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
                type: creditOperation // 'add' or 'set'
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

    const handleAdjustStock = async (productId: string, amount: number) => {
        const product = productsList.find(p => p._id === productId);
        if (!product) return;

        const newStock = Number(product.stock) + amount;

        try {
            // Optimistic update
            setProductsList(prev => prev.map(p => p._id === productId ? { ...p, stock: newStock } : p));

            await api.put(`/products/${productId}`, {
                ...product,
                stock: newStock
            });
        } catch (error) {
            console.error("Failed to adjust stock", error);
            alert("Failed to update stock. Please try again.");
            fetchProducts(); // Rollback
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

    const handleViewOrder = (order: any) => {
        setViewingOrder(order);
    };

    const handleGenerateBillData = async () => {
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
            const subtotal = billingItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
            const itemTaxes = billingItems.reduce((acc: number, item: any) => {
                const itemTotal = item.price * item.quantity;
                return acc + item.taxes.reduce((tAcc: number, tax: any) => tAcc + (itemTotal * (tax.rate / 100)), 0);
            }, 0);
            const globalTaxAmount = globalTaxEnabled ? (subtotal * (globalTaxRate / 100)) : 0;

            const billData = {
                items: billingItems.map(item => ({
                    ...item,
                    productId: item.productId // Ensure productId is passed if from inventory
                })),
                customerInfo,
                totalAmount: Math.round(subtotal + itemTaxes + globalTaxAmount),
                globalTax: globalTaxEnabled ? { rate: globalTaxRate, amount: globalTaxAmount } : null,
                source: 'admin_billing',
                user: customerInfo.user
            };

            if (editingBillId) {
                await api.put(`/bills/${editingBillId}`, billData);
                alert("Bill updated successfully!");
            } else {
                await api.post('/bills', billData);
                alert("Bill created and synced successfully!");
            }

            setBillingItems([]); // Clear cart
            setCustomerInfo({ name: "", phone: "", email: "", address: "" }); // Reset customer
            setIsAddBillModalOpen(false); // Close modal
            setEditingBillId(null);
            fetchBills(); // Refresh listing
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.msg || "Failed to create bill.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetBill = () => {
        if (!confirm("Are you sure you want to clear the current bill?")) return;
        setBillingItems([]);
        setCustomerInfo({ name: "", phone: "", email: "", address: "" });
        setEditingBillId(null);
    };

    const handleEditBillClick = (bill: any) => {
        setBillingItems(bill.items);
        setCustomerInfo({
            ...bill.customerInfo,
            user: bill.user
        });
        setGlobalTaxEnabled(!!bill.globalTax);
        setGlobalTaxRate(bill.globalTax?.rate || 18);
        setEditingBillId(bill._id);
        setIsAddBillModalOpen(true);
    };

    const allAdminRoles = ['super_admin', 'product_manager', 'order_manager', 'customer_support', 'finance', 'marketing', 'admin'];
    const isAnyAdmin = user && allAdminRoles.includes(user.role);

    if (authLoading || (isAnyAdmin && loadingStats && activeView === 'dashboard')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="animate-spin text-teal-600 size-10" />
            </div>
        );
    }

    if (!isAnyAdmin) return null;



    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-40 h-screen pt-24 transition-all duration-300 bg-white border-r border-slate-200 dark:bg-slate-800 dark:border-slate-700 ${isSidebarCollapsed ? 'w-20' : 'w-64'} ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`} aria-label="Sidebar">
                <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="absolute -right-3 top-28 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1.5 shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-all z-50 text-slate-500 hover:scale-110 active:scale-90"
                >
                    {isSidebarCollapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
                </button>

                <div className="h-full px-3 py-4 overflow-y-auto bg-white dark:bg-slate-800 scrollbar-hide">
                    <ul className="space-y-2 font-medium">
                        {[
                            { id: 'dashboard', label: 'Overview', icon: Layers },
                            { id: 'categories', label: 'Categories', icon: Folder },
                            { id: 'products', label: 'Products', icon: Package },
                            { id: 'inventory', label: 'Inventory', icon: Shield },
                            { id: 'orders', label: 'Orders', icon: ShoppingBag },
                            { id: 'billing', label: 'Billing (POS)', icon: Receipt },
                            { id: 'coupons', label: 'Coupons', icon: Ticket },
                            { id: 'users', label: 'Users & Staff', icon: Users },
                            { id: 'messages', label: 'Messages', icon: Mail },
                            { id: 'blogs', label: 'Blogs', icon: ImageIcon },
                            { id: 'components', label: 'Components', icon: Layout },
                        ].filter(item => {
                            const userRole = user?.role || 'user';
                            if (userRole === 'super_admin') return true;

                            const customPages = user?.customPages || [];
                            const rolePages = ROLE_PERMISSIONS[userRole] || [];

                            // Merge both for robustness, ensuring empty customPages doesn't block role defaults
                            const allowedPages = Array.from(new Set([...rolePages, ...customPages]));
                            return allowedPages.includes(item.id);
                        }).map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => { handleViewChange(item.id as any); setIsMobileMenuOpen(false); }}
                                    className={`w-full flex items-center p-2.5 rounded-xl group transition-all duration-200 ${activeView === item.id
                                        ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20 active:scale-95'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:scale-[1.02] active:scale-95'} ${isSidebarCollapsed ? 'justify-center' : ''}`}
                                >
                                    <item.icon className={`size-5 min-w-5 transition-all duration-200 ${activeView === item.id ? 'text-white scale-110' : 'text-slate-500 dark:text-slate-400 group-hover:text-teal-500 dark:group-hover:text-teal-400'}`} />
                                    {!isSidebarCollapsed && <span className={`ms-3 whitespace-nowrap text-sm font-bold ${activeView === item.id ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>{item.label}</span>}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} min-h-screen`}>
                <div className="w-full px-4 md:px-10 lg:px-16 pt-24 md:pt-28 pb-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeView}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeView === 'dashboard' && stats && <DashboardOverview stats={stats} user={user} />}
                            {activeView === 'users' && (
                                <UsersView
                                    users={usersList}
                                    onAddUser={() => setIsAddUserModalOpen(true)}
                                    onEditUser={handleEditUserClick}
                                    onDeleteUser={handleDeleteUser}
                                    onToggleStatus={toggleUserStatus}
                                    onManageCredit={(u) => {
                                        setSelectedUserForCredit(u);
                                        setShowCreditModal(true);
                                    }}
                                    user={user}
                                    canAdd={canAdd('users')}
                                    canEdit={canEdit('users')}
                                    canDelete={canDelete('users')}
                                />
                            )}

                            {activeView === "categories" && (
                                <CategoriesView
                                    canAdd={canAdd('categories')}
                                    canEdit={canEdit('categories')}
                                    canDelete={canDelete('categories')}
                                    user={user}
                                />
                            )}
                            {activeView === "products" && (
                                <ProductsView
                                    products={productsList}
                                    onAddProduct={() => setIsAddModalOpen(true)}
                                    onEditProduct={handleEditProductClick}
                                    onDeleteProduct={handleDeleteProduct}
                                    onToggleStatus={toggleProductStatus}
                                    onViewCoupons={(name, coupons) => {
                                        setViewingCoupons({ productName: name, coupons });
                                    }}
                                    canAdd={canAdd('products')}
                                    canEdit={canEdit('products')}
                                    canDelete={canDelete('products')}
                                    user={user}
                                />
                            )}
                            {activeView === "orders" && (
                                <OrdersView
                                    orders={ordersList}
                                    onEditOrder={(o) => {
                                        setEditingOrder(o);
                                        setIsEditOrderModalOpen(true);
                                    }}
                                    onViewOrderDetails={handleViewOrder}
                                    onUpdateStatus={handleUpdateOrderStatus}
                                    onDeleteOrder={handleDeleteOrder}
                                    user={user}
                                    canEdit={canEdit('orders')}
                                    canDelete={canDelete('orders')}
                                />
                            )}
                            {activeView === "inventory" && (
                                <InventoryView
                                    products={productsList}
                                    stockStats={stats?.stock}
                                    restockItems={stats?.restock}
                                    onAdjustStock={handleAdjustStock}
                                    onToggleStatus={toggleProductStatus}
                                    canEdit={canEdit('inventory')}
                                    user={user}
                                />
                            )}
                            {activeView === "blogs" && (
                                <BlogsView
                                    blogs={blogsList}
                                    onAddBlog={() => setIsAddBlogModalOpen(true)}
                                    onEditBlog={handleEditBlogClick}
                                    onDeleteBlog={handleDeleteBlog}
                                    canAdd={canAdd('blogs')}
                                    canEdit={canEdit('blogs')}
                                    canDelete={canDelete('blogs')}
                                    user={user}
                                />
                            )}
                            {activeView === "coupons" && (
                                <CouponsView
                                    couponsList={couponsList}
                                    setIsAddCouponModalOpen={setIsAddCouponModalOpen}
                                    toggleCouponStatus={toggleCouponStatus}
                                    handleDeleteCoupon={handleDeleteCoupon}
                                    canAdd={canAdd('coupons')}
                                    canEdit={canEdit('coupons')}
                                    canDelete={canDelete('coupons')}
                                    user={user}
                                />
                            )}
                            {activeView === 'messages' && (
                                <MessagesView
                                    messages={messagesList}
                                    onDeleteMessage={handleDeleteMessage}
                                    canDelete={canDelete('messages')}
                                    user={user}
                                />
                            )}
                            {activeView === 'components' && (
                                <ComponentsView canEdit={canEdit('components')} />
                            )}
                            {activeView === 'billing' && (
                                <BillsView
                                    bills={billsList}
                                    setIsAddBillModalOpen={(open) => {
                                        if (open) {
                                            setBillingItems([]);
                                            setCustomerInfo({ name: "", phone: "", email: "", address: "" });
                                            setEditingBillId(null);
                                        }
                                        setIsAddBillModalOpen(open);
                                    }}
                                    handleDeleteBill={handleDeleteBill}
                                    onEditBill={handleEditBillClick}
                                    canAdd={canAdd('billing')}
                                    canEdit={canEdit('billing')}
                                    canDelete={canDelete('billing')}
                                    user={user}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Modals */}
            <BillingModal
                isOpen={isAddBillModalOpen}
                onClose={() => {
                    setIsAddBillModalOpen(false);
                    setEditingBillId(null);
                }}
                title={editingBillId ? "Edit Transaction" : "New Transaction"}
                description={editingBillId ? "Modify and update existing POS record" : "Create and process a point-of-sale receipt"}
            >
                <BillingView
                    billingItems={billingItems}
                    customerInfo={customerInfo}
                    allProducts={productsList}
                    isSubmitting={isSubmitting}
                    globalTaxEnabled={globalTaxEnabled}
                    setGlobalTaxEnabled={setGlobalTaxEnabled}
                    globalTaxRate={globalTaxRate}
                    setGlobalTaxRate={setGlobalTaxRate}
                    setBillingItems={setBillingItems}
                    setCustomerInfo={setCustomerInfo}
                    onGenerateBill={handleGenerateBillData}
                    onResetBill={handleResetBill}
                    isEditMode={!!editingBillId}
                    billId={editingBillId || undefined}
                    allUsers={usersList}
                    canEditUsers={canEdit('users')}
                />
            </BillingModal>
            <UserModal
                isOpen={isAddUserModalOpen}
                onClose={() => setIsAddUserModalOpen(false)}
                onSubmit={handleCreateUser}
                editingUser={null}
                newUser={newUser}
                setNewUser={setNewUser}
                isSubmitting={isSubmitting}
                currentUser={user}
            />

            <UserModal
                isOpen={isEditUserModalOpen}
                onClose={() => setIsEditUserModalOpen(false)}
                onSubmit={handleUpdateUser}
                editingUser={editingUser}
                newUser={editingUser || {}}
                setNewUser={setEditingUser as any}
                isSubmitting={isSubmitting}
                currentUser={user}
            />

            <ProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddProduct}
                editingProduct={null}
                currentProduct={newProduct}
                setCurrentProduct={setNewProduct}
                categories={categoriesList}
                isSubmitting={isSubmitting}
            />

            <ProductModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleUpdateProduct}
                editingProduct={editingProduct}
                currentProduct={editingProduct || {}}
                setCurrentProduct={setEditingProduct as any}
                categories={categoriesList}
                isSubmitting={isSubmitting}
            />

            <BlogModal
                isOpen={isAddBlogModalOpen}
                onClose={() => setIsAddBlogModalOpen(false)}
                onSubmit={handleCreateBlog}
                editingBlog={null}
                currentBlog={newBlog}
                setCurrentBlog={setNewBlog}
                isSubmitting={isSubmitting}
            />

            <BlogModal
                isOpen={isEditBlogModalOpen}
                onClose={() => setIsEditBlogModalOpen(false)}
                onSubmit={handleUpdateBlog}
                editingBlog={editingBlog}
                currentBlog={editingBlog || {}}
                setCurrentBlog={setEditingBlog as any}
                isSubmitting={isSubmitting}
            />

            <OrderEditModal
                isOpen={isEditOrderModalOpen}
                onClose={() => setIsEditOrderModalOpen(false)}
                editingOrder={editingOrder}
                setEditingOrder={setEditingOrder}
                onSubmit={handleUpdateOrder}
                isSubmitting={isSubmitting}
            />

            <CreditModal
                isOpen={showCreditModal}
                onClose={() => setShowCreditModal(false)}
                onSubmit={handleUpdateCredit}
                user={selectedUserForCredit}
                isSubmitting={isProcessingCredit}
                creditAmount={creditAmount}
                setCreditAmount={setCreditAmount}
                creditOperation={creditOperation}
                setCreditOperation={setCreditOperation}
            />

            <ViewOrderDetailsModal
                isOpen={!!viewingOrder}
                order={viewingOrder}
                onClose={() => setViewingOrder(null)}
            />

            <ViewCouponsModal
                isOpen={!!viewingCoupons}
                onClose={() => setViewingCoupons(null)}
                productName={viewingCoupons?.productName || ""}
                coupons={viewingCoupons?.coupons || []}
            />

            <CouponModal
                isOpen={isAddCouponModalOpen}
                onClose={() => setIsAddCouponModalOpen(false)}
                isEdit={false}
                formData={newCoupon}
                setFormData={setNewCoupon}
                onSubmit={handleCreateCoupon}
                isSubmitting={isSubmitting}
            />

            <CouponModal
                isOpen={isEditCouponModalOpen}
                onClose={() => setIsEditCouponModalOpen(false)}
                isEdit={true}
                formData={editingCoupon}
                setFormData={setEditingCoupon}
                onSubmit={handleUpdateCoupon}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}

export default AdminDashboard;
