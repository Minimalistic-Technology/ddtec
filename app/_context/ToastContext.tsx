"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "info") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            layout
                            className={`
                                pointer-events-auto flex items-center gap-3 min-w-[300px] max-w-sm w-full p-4 rounded-xl shadow-lg border backdrop-blur-md
                                ${toast.type === 'success' ? 'bg-white/90 dark:bg-slate-900/90 border-green-200 dark:border-green-800 text-slate-800 dark:text-slate-100' : ''}
                                ${toast.type === 'error' ? 'bg-white/90 dark:bg-slate-900/90 border-red-200 dark:border-red-800 text-slate-800 dark:text-slate-100' : ''}
                                ${toast.type === 'info' ? 'bg-white/90 dark:bg-slate-900/90 border-blue-200 dark:border-blue-800 text-slate-800 dark:text-slate-100' : ''}
                                ${toast.type === 'warning' ? 'bg-white/90 dark:bg-slate-900/90 border-yellow-200 dark:border-yellow-800 text-slate-800 dark:text-slate-100' : ''}
                            `}
                        >
                            <div className={`
                                shrink-0 size-8 rounded-full flex items-center justify-center
                                ${toast.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : ''}
                                ${toast.type === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : ''}
                                ${toast.type === 'info' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                                ${toast.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' : ''}
                            `}>
                                {toast.type === 'success' && <CheckCircle className="size-5" />}
                                {toast.type === 'error' && <AlertCircle className="size-5" />}
                                {toast.type === 'info' && <Info className="size-5" />}
                                {toast.type === 'warning' && <AlertTriangle className="size-5" />}
                            </div>

                            <p className="text-sm font-medium flex-1">{toast.message}</p>

                            <button
                                onClick={() => removeToast(toast.id)}
                                className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <X className="size-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
