export interface Category {
    _id: string;
    name: string;
    slug: string;
    parent?: any; // Can be string or populated object
}

export interface Tax {
    name: string;
    rate: number;
}

export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    images?: string[]; // Add support for multiple images
    image?: string; // Fallback for single image
    category: any; // Can be string or populated object
    stock: number;
    rating: number;
    numReviews?: number;
    lastMonthSales: number;
    brand?: string;
    modelName?: string;
    isActive: boolean;
    showOnHome?: boolean;
    couponCode?: string;
    discountPercentage?: number;
    taxes?: Tax[];
    createdAt?: string;
    updatedAt?: string;
}

export interface User {
    _id: string;
    id?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
    phone?: string;
    role: 'user' | 'super_admin' | 'product_manager' | 'order_manager' | 'customer_support' | 'finance' | 'marketing' | 'admin';
    isActive: boolean;
    creditBalance?: number;
    customPages?: string[];
    editPages?: string[];
    addPages?: string[];
    deletePages?: string[];
    address?: string;
    createdAt?: string;
}

export interface Message {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    message: string;
    createdAt: string;
}

export interface Blog {
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

export interface DashboardStats {
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
        lowStockProducts?: Product[];
        outOfStockProducts?: Product[];
    };
    trends?: { name: string; value: number }[];
    categoryRevenue?: { name: string; value: number }[];
    topProducts?: (Product & { totalSold: number; revenue: number })[];
    restock?: { name: string; stock: number }[];
}

export interface BillingItem {
    productId?: string;
    name: string;
    price: number;
    quantity: number;
    taxes: Tax[];
    fromInventory: boolean;
}

export interface CustomerInfo {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    user?: string;
}

export interface Coupon {
    _id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    expiresAt?: string;
    applicableProducts?: string[];
    isActive: boolean;
}
