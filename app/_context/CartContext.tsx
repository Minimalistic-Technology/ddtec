
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

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
    totalPrice: number;
    addToCart: (productId: string, quantity?: number) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    clearCart: () => void;
    loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const backendUrl = '/api'; // Use relative path via proxy

    // Fetch Cart on User Change
    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCartItems([]);
        }
    }, [user]);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${backendUrl}/cart`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setCartItems(data.items || []);
            }
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
            const res = await fetch(`${backendUrl}/cart/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity }),
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setCartItems(data.items);
                alert("Item added to cart!");
            } else {
                alert("Failed to add to cart");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const removeFromCart = async (productId: string) => {
        try {
            const res = await fetch(`${backendUrl}/cart/${productId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setCartItems(data.items);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const updateQuantity = async (productId: string, quantity: number) => {
        try {
            const res = await fetch(`${backendUrl}/cart/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity }),
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setCartItems(data.items);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cartItems.reduce((acc, item) => acc + ((item.product?.price || 0) * item.quantity), 0);

    return (
        <CartContext.Provider value={{ cartItems, cartCount, totalPrice, addToCart, removeFromCart, updateQuantity, clearCart, loading }}>
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
