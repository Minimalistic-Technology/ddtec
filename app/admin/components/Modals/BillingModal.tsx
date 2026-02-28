import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BillingModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    description?: string;
}

const BillingModal = ({
    isOpen,
    onClose,
    children,
    title = "New Transaction",
    description = "Create and process a point-of-sale receipt"
}: BillingModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-slate-50 dark:bg-slate-900 w-full h-full max-w-none max-h-none overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{title}</h3>
                                <p className="text-slate-500 text-sm font-medium">{description}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="group p-3 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 rounded-2xl transition-all duration-300"
                            >
                                <X className="size-6 group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-8">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BillingModal;
