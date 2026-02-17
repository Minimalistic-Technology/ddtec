"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    createdAt?: string;
    address?: string;
    creditBalance?: number;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    checkUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const checkUser = async () => {
        try {
            // Add timestamp to prevent caching
            const res = await api.get(`/auth/me?t=${new Date().getTime()}`);
            setUser(res.data);
            console.log("User refresh: ", res.data);
        } catch (error) {
            console.log("No active session");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Explicitly clear legacy localstorage items to satisfy user request
        localStorage.removeItem("ddtec_user");
        localStorage.removeItem("ddtec_token");

        // Check session cookie on mount via /me
        checkUser();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const res = await api.post('/auth/login', { email, password });

            setUser(res.data.user);

            if (res.data.user.role === 'admin') {
                router.push("/admin");
            } else {
                router.push("/");
            }
        } catch (error: any) {
            const msg = error.response?.data?.msg || 'Login failed';
            console.error("Login failed:", msg);
            throw new Error(msg);
        }
    };



    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            setUser(null);
            router.push("/login");
        }
    };

    // Signup logic is now handled directly in app/signup/page.tsx due to complexity (OTP, etc)
    // We keep interface clean.

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, checkUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
