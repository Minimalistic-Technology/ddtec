"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5004';
    const API_URL = `${backendUrl}/auth`;

    useEffect(() => {
        // Explicitly clear legacy localstorage items to satisfy user request
        localStorage.removeItem("ddtec_user");
        localStorage.removeItem("ddtec_token");

        // Check session cookie on mount via /me
        const checkUser = async () => {
            try {
                const res = await fetch(`${API_URL}/me`, { credentials: 'include' });
                if (res.ok) {
                    const userData = await res.json();
                    setUser(userData);
                }
            } catch (error) {
                console.log("No active session");
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.msg || 'Login failed');
            }

            setUser(data.user);
            // localStorage.setItem("ddtec_user", JSON.stringify(data.user)); // Removed
            // localStorage.setItem("ddtec_token", data.token); // Removed
            router.push("/");
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const signup = async (name: string, email: string, password: string) => {
        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.msg || 'Signup failed');
            }

            setUser(data.user);
            // localStorage.setItem("ddtec_user", JSON.stringify(data.user)); // Removed
            // localStorage.setItem("ddtec_token", data.token); // Removed
            router.push("/");
        } catch (error) {
            console.error("Signup failed:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await fetch(`${API_URL}/logout`, { method: 'POST', credentials: 'include' });
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            setUser(null);
            router.push("/login");
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
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
