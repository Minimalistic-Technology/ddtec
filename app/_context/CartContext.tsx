
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import api from "@/lib/api";

interface CartItem {
    product: {
        _id: string;
        name: string;
        price: number;
        image: string;
        couponCode?: string;
        discountPercentage?: number;
    };
    quantity: number;
    _id: string; // Item ID (subdocument id)
}

interface CartContextType {
    cartItems: CartItem[];
    cartCount: number;
    subtotal: number;
    totalPrice: number;
    addToCart: (productId: string, quantity?: number) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    clearCart: () => void;
    loading: boolean;
    appliedCoupon: { code: string; discountAmount: number; type: string } | null;
    applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
    removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; type: string } | null>(null);

    // Fetch Cart on User Change
    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCartItems([]);
            setAppliedCoupon(null);
        }
    }, [user]);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const res = await api.get('/cart');
            setCartItems(res.data.items || []);
        } catch (error) {
            console.error("Failed to fetch cart", error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId: string, quantity: number = 1) => {
        if (!user) {
            alert("Please login to add items to cart");
            return;
        }
        try {
            const res = await api.post('/cart/add', { productId, quantity });
            if (res.status === 200 || res.status === 201) {
                setCartItems(res.data.items);
                // Re-validate coupon if applied? For now, remove it to be safe or re-calc on backend?
                // Simplest is to remove coupon on cart change to force re-validation, or just keep it and let checkout validate.
                // For now, let's keep it but maybe we should clear it if cart changes significantly.
                setAppliedCoupon(null);
                alert("Item added to cart!");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to add to cart");
        }
    };

    const removeFromCart = async (productId: string) => {
        try {
            const res = await api.delete(`/cart/${productId}`);
            if (res.status === 200) {
                setCartItems(res.data.items);
                setAppliedCoupon(null);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const updateQuantity = async (productId: string, quantity: number) => {
        try {
            const res = await api.put('/cart/update', { productId, quantity });
            if (res.status === 200) {
                setCartItems(res.data.items);
                setAppliedCoupon(null); // Clear coupon on update to ensure validity
            }
        } catch (error) {
            console.error(error);
        }
    };

    const clearCart = () => {
        setCartItems([]);
        setAppliedCoupon(null);
    };

    const applyCoupon = async (code: string) => {
        try {
            if (!api) {
                console.error("API instance is not defined");
                return { success: false, message: "System error: API unavailable" };
            }

            const subtotal = cartItems.reduce((acc, item) => acc + ((item.product?.price || 0) * item.quantity), 0);

            const payloadItems = cartItems.map(item => {
                if (!item.product || !item.product._id) return null;
                return {
                    product: item.product._id,
                    price: item.product.price,
                    quantity: item.quantity
                };
            }).filter(item => item !== null);

            const cartPayload = {
                code,
                cartTotal: subtotal,
                cartItems: payloadItems
            };

            const res = await api.post('/coupons/validate', cartPayload);
            if (res.data.isValid) {
                setAppliedCoupon({
                    code: res.data.coupon.code,
                    discountAmount: res.data.discountAmount,
                    type: res.data.coupon.type
                });
                return { success: true, message: `Coupon ${code} applied!` };
            }
        } catch (error: any) {
            console.error("Apply Coupon Error:", error);
            return { success: false, message: error.response?.data?.message || "Failed to apply coupon" };
        }
        return { success: false, message: "Invalid coupon" };
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + ((item.product?.price || 0) * item.quantity), 0);
    const totalPrice = Math.max(0, subtotal - (appliedCoupon?.discountAmount || 0));

    return (
        <CartContext.Provider value={{
            cartItems,
            cartCount,
            subtotal,
            totalPrice,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            loading,
            appliedCoupon,
            applyCoupon,
            removeCoupon
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
