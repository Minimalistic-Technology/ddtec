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

const WhatWeOffer: React.FC = () => {
  return (
    <section id="what" className="py-24 bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      {/* Background patterns */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-[100px] -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4"
          >
            What We Offer
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 dark:text-slate-400 text-lg"
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
              viewport={{ once: false }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden"
            >
              <div className={cn("absolute -top-10 -right-10 size-32 rounded-full opacity-20 transition-transform group-hover:scale-150 blur-2xl", tool.bg)} />

              <div className={cn("inline-flex p-4 rounded-xl shadow-lg mb-6 relative z-10", tool.bg)}>
                {tool.icon}
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 relative z-10">
                {tool.title}
              </h3>

              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 relative z-10 h-14">
                {tool.desc}
              </p>

              <Link
                href="/#shop"
                className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-400 group-hover:text-teal-500 transition-colors relative z-10"
              >
                Shop Now <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeOffer;