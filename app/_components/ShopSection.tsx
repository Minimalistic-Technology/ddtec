"use client";

import { motion } from "framer-motion";
import { HardHat, Bell } from "lucide-react";

export default function ShopSection() {
    return (
        <section id="shop" className="py-24 min-h-[80vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden px-6">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 text-9xl opacity-5 dark:opacity-[0.02] rotate-12">🛠️</div>
                <div className="absolute bottom-20 right-10 text-9xl opacity-5 dark:opacity-[0.02] -rotate-12">⚙️</div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5 }}
                className="relative z-10 text-center max-w-lg"
            >
                <div className="mb-8 inline-flex p-6 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600 dark:text-yellow-500 animate-float shadow-xl shadow-yellow-500/10">
                    <HardHat className="size-16" />
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                    Store Under Construction
                </h2>

                <p className="text-slate-600 dark:text-slate-400 text-lg mb-10">
                    We are currently building a premium shopping experience for our professional tools.
                    Stay tuned for the grand opening.
                </p>

                <div className="bg-white dark:bg-slate-900 p-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-800 flex items-center max-w-sm mx-auto">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="flex-1 bg-transparent px-4 py-2 outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                    <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-full font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2">
                        Notify Me <Bell className="size-4" />
                    </button>
                </div>
            </motion.div>
        </section>
    );
}
