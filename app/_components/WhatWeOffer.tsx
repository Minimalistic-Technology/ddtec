"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Drill, Axe, Cog, Wrench, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  {
    icon: <Drill className="size-8 text-teal-100" />,
    title: "Drill Bits",
    desc: "Precision drilling tools for heavy-duty industrial application.",
    bg: "bg-teal-500"
  },
  {
    icon: <Axe className="size-8 text-emerald-100" />,
    title: "Wood Cutters",
    desc: "Razor-sharp blades for clean, smooth and effortless cutting.",
    bg: "bg-emerald-500"
  },
  {
    icon: <Cog className="size-8 text-cyan-100" />,
    title: "Grinding Tools",
    desc: "Durable abrasives ensuring the perfect finish every time.",
    bg: "bg-cyan-500"
  },
  {
    icon: <Wrench className="size-8 text-blue-100" />,
    title: "Fasteners",
    desc: "High-strength industrial fasteners you can trust with your life.",
    bg: "bg-blue-500"
  },
];

import { useRouter, usePathname } from "next/navigation";
import { useComponentSettings } from "../_context/ComponentSettingsContext";
import { useAuth } from "../_context/AuthContext";

const WhatWeOffer: React.FC = () => {
  const { settings } = useComponentSettings();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#")) {
      e.preventDefault();
      const elementId = href.replace("/#", "");
      if (pathname === "/") {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        router.push(`/?target=${elementId}`);
      }
    }
  };

  const isSuperAdmin = user?.role === 'super_admin';
  if (!settings.WhatWeOffer && !isSuperAdmin) return null;

  return (
    <section id="what" className="py-16 md:py-32 bg-white/30 dark:bg-slate-900/10 overflow-hidden relative">
      {/* Organic Flow Divider */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent opacity-50" />

      {/* Ambient Pulsing Glows */}
      <div className="absolute top-1/2 left-[-10%] w-[500px] h-[500px] bg-teal-500/5 dark:bg-teal-500/3 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-500/5 dark:bg-emerald-500/3 rounded-full blur-[100px] pointer-events-none animate-pulse delay-1000" />

      <div className="w-full px-4 md:px-10 lg:px-16 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 md:mb-4"
          >
            What We Offer
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 dark:text-slate-400 text-sm sm:text-base md:text-lg"
          >
            Premium tools engineered for the most demanding tasks.
          </motion.p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden"
            >
              <div className={cn("absolute -top-10 -right-10 size-32 rounded-full opacity-20 transition-transform group-hover:scale-150 blur-2xl", tool.bg)} />

              <div className={cn("inline-flex p-4 rounded-xl shadow-lg mb-6 relative z-10", tool.bg)}>
                {tool.icon}
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 relative z-10">
                {tool.title}
              </h3>

              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 relative z-10 h-14">
                {tool.desc}
              </p>

              <Link
                href="/#shop"
                onClick={(e) => handleScroll(e, "/#shop")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-400 group-hover:text-teal-500 transition-colors relative z-10"
              >
                Shop Now <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div >
    </section >
  );
};

export default WhatWeOffer;