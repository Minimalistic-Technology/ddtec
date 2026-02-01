"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);

    // Trigger loading animation on route change
    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 800); // Fake consistent loading time for visual feedback

        return () => clearTimeout(timeout);
    }, [pathname, searchParams]);

    return (
        <AnimatePresence>
            {loading && (
                <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] pointer-events-none">
                    {/* Background container (optional) */}
                    <div className="absolute inset-0 bg-transparent" />

                    {/* Animated Bar */}
                    <motion.div
                        initial={{ width: "0%", opacity: 1 }}
                        animate={{
                            width: ["0%", "40%", "80%", "100%"],
                            opacity: [1, 1, 1, 0]
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 0.8,
                            ease: "easeInOut",
                            times: [0, 0.4, 0.7, 1]
                        }}
                        className="h-full bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-600 shadow-[0_0_10px_rgba(20,184,166,0.5)]"
                    />
                </div>
            )}
        </AnimatePresence>
    );
}
