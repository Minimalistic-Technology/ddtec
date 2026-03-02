"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useComponentSettings } from "@/app/_context/ComponentSettingsContext";
import { useAuth } from "@/app/_context/AuthContext";

export default function Hero() {
  const router = useRouter();
  const pathname = usePathname();
  const { settings } = useComponentSettings();
  const { user } = useAuth();

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const sectionPaths = ["/who", "/what", "/contact"];
    if (sectionPaths.includes(href)) {
      e.preventDefault();
      const sectionId = href.substring(1);
      if (pathname === "/") {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        sessionStorage.setItem("scroll-target", sectionId);
        router.push("/");
      }
    }
  };

  const isSuperAdmin = user?.role === 'super_admin';
  if (!settings.Hero && !isSuperAdmin) return null;

  return (
    <section
      id="home"
      className="relative flex items-center justify-center overflow-hidden pt-38 pb-20 sm:pt-28 sm:pb-32 md:pt-36 md:pb-36 group/hero"
    >
      {/* Background Gradient Overlay - Adjusted for seamless transition */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-slate-50 dark:to-slate-950 z-0" />

      {/* Static Gradients - Shared with next sections */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-1/4 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Hero Bottom Organic Bridge */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 via-slate-50/50 to-transparent dark:from-slate-950 dark:via-slate-950/50 dark:to-transparent z-[2] pointer-events-none" />

      {/* Organic Shapes that spill over */}
      <div className="absolute bottom-[-50px] left-[10%] w-[300px] h-[300px] bg-teal-500/5 dark:bg-teal-500/3 rounded-full blur-[80px] pointer-events-none z-[1]" />

      <div className="w-full px-4 md:px-10 lg:px-16 relative z-10 text-left sm:text-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl sm:mx-auto pointer-events-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs sm:text-sm font-medium mb-4 md:mb-6 animate-fadeUp backdrop-blur-sm">
            <Sparkles className="size-3.5 sm:size-4" />
            <span>Industrial Grade Excellence</span>
          </div>

          <h1 className="text-5xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 md:mb-6 leading-tight text-slate-900 dark:text-white">
            Tools Built for <br />
            <span className="text-gradient">True Professionals</span>
          </h1>

          <div className="flex justify-start sm:justify-center w-full mb-10 md:mb-12">
            <p className="text-sm sm:text-base md:text-xl text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed text-left sm:text-center">
              Experience precision-crafted power tools designed for performance,
              unwavering reliability, and lifetime longevity.
            </p>
          </div>

          <div className="flex flex-row items-start sm:items-center justify-start sm:justify-center gap-3 flex-wrap mb-18 md:mb-7">
            <Link
              href="/shop"
              onClick={(e) => handleScroll(e, "/shop")}
              className="px-7 py-3 sm:px-8 sm:py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-full text-sm font-semibold transition-all shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2 group"
            >
              Shop Now
              <ArrowRight className="size-4 md:size-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/what"
              onClick={(e) => handleScroll(e, "/what")}
              className="px-7 py-3 sm:px-8 sm:py-3.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-full text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center"
            >
              Explore Tools
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
