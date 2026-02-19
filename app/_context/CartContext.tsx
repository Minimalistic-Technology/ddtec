
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
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
    const { showToast } = useToast();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; type: string } | null>(null);
    const preventSave = React.useRef(false);

    // Initial Load from LocalStorage for Guest
    useEffect(() => {
        if (!user) {
            const localCart = localStorage.getItem('guestCart');
            if (localCart) {
                try {
                    const parsed = JSON.parse(localCart);
                    if (Array.isArray(parsed)) {
                        setCartItems(parsed.filter(item => item && item.product));
                    }
                } catch (e) {
                    console.error("Failed to parse local cart", e);
                }
            }
        }
    }, [user]); // Keep this for hydration

    // Fetch Cart on User Change (Moved UP)
    useEffect(() => {
        // Prevent saving to LS while we are switching context
        preventSave.current = true;

        if (user) {
            fetchCart().finally(() => {
                setTimeout(() => { preventSave.current = false; }, 500);
            });
        } else {
            // Logout: Load guest cart or clear
            const localCart = localStorage.getItem('guestCart');
            if (localCart) {
                try {
                    const parsed = JSON.parse(localCart);
                    if (Array.isArray(parsed)) {
                        setCartItems(parsed.filter(item => item && item.product));
                    } else {
                        setCartItems([]);
                    }
                } catch (e) {
                    setCartItems([]);
                }
            } else {
                setCartItems([]);
            }
            setAppliedCoupon(null);

            // Re-enable saving after a short delay to allow state to settle
            setTimeout(() => { preventSave.current = false; }, 500);
        }
    }, [user]);

    // Save to LocalStorage whenever cart changes (if guest) (Moved DOWN)
    useEffect(() => {
        if (!user && !preventSave.current) {
            localStorage.setItem('guestCart', JSON.stringify(cartItems));
        }
    }, [cartItems, user]);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const res = await api.get('/cart');
            const items = res.data.items || [];
            setCartItems(items.filter((item: any) => item && item.product));
        } catch (error) {
            console.error("Failed to fetch cart", error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId: string, quantity: number = 1) => {
        if (!user) {
            // Guest Logic
            try {
                // Fetch product details for UI since we can't populate via backend
                // For now, we might need a way to get product details if we don't have them.
                // Assuming we might need to fetch product info or the caller passes it? 
                // The current signature only takes productId.
                // We'll fetch the product from API to get details for the cart item.
                const productRes = await api.get(`/products/${productId}`);
                const product = productRes.data;


                if (product.isActive === false) {
                    showToast("This product is currently inactive and cannot be added to cart.", "error");
                    return;
                }

                setCartItems(prev => {
                    // Filter out any broken items already in cart
                    const cleanPrev = prev.filter(item => item && item.product);
                    const existingIndex = cleanPrev.findIndex(item => item.product?._id === productId);
                    let newItems = [...cleanPrev];
                    if (existingIndex > -1) {
                        newItems[existingIndex] = {
                            ...newItems[existingIndex],
                            quantity: newItems[existingIndex].quantity + quantity
                        };
                    } else {
                        newItems.push({
                            product: product,
                            quantity: quantity,
                            _id: `local_${Date.now()}_${Math.random()}` // Temp ID
                        });
                    }
                    return newItems;
                });
                showToast("Item added to cart!", "success");
            } catch (error) {
                console.error("Failed to add to local cart", error);
                showToast("Failed to add to cart", "error");
            }
            return;
        }

        try {
            const res = await api.post('/cart/add', { productId, quantity });
            if (res.status === 200 || res.status === 201) {
                setCartItems(res.data.items);
                setAppliedCoupon(null);
                showToast("Item added to cart!", "success");
            }
        } catch (error) {
            console.error(error);
            showToast("Failed to add to cart", "error");
        }
    };

    const removeFromCart = async (productId: string) => {
        if (!user) {
            setCartItems(prev => prev.filter(item => item.product?._id && item.product._id !== productId));
            setAppliedCoupon(null);
            return;
        }
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
        if (!user) {
            setCartItems(prev => {
                return prev
                    .filter(item => item && item.product) // Remove broken items
                    .map(item => {
                        if (item.product?._id === productId) {
                            return { ...item, quantity };
                        }
                        return item;
                    }).filter(item => item.quantity > 0);
            });
            setAppliedCoupon(null);
            return;
        }

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
        if (!user) {
            localStorage.removeItem('guestCart');
        }
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
