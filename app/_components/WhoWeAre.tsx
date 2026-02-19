"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Users, Wrench } from "lucide-react";

const features = [
  {
    icon: <ShieldCheck className="size-6 text-teal-500" />,
    title: "Uncompromising Quality",
    description: "Every tool undergoes rigorous testing to meet industrial standards.",
  },
  {
    icon: <Users className="size-6 text-teal-500" />,
    title: "Customer Focused",
    description: "Built with the feedback of thousands of professional tradespeople.",
  },
  {
    icon: <Wrench className="size-6 text-teal-500" />,
    title: "Precision Engineering",
    description: "Designed for accuracy, durability, and maximum efficiency.",
  },
];

const WhoWeAre: React.FC = () => {
  return (
    <section id="who" className="py-12 md:py-24 bg-white dark:bg-slate-900/50 relative overflow-hidden">
      {/* Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: Text Content */}
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-sm font-bold tracking-wider text-teal-600 uppercase mb-2">
                About DDTEC
              </h2>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Empowering Professionals Since 2024
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                DDTEC is a trusted manufacturer of professional power tools, delivering
                industrial-grade quality to workshops worldwide. We believe in building
                tools that work as hard as you do.
              </p>

              <div className="space-y-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex gap-4 items-start"
                  >
                    <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Visual */}
          <div className="order-1 lg:order-2 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-emerald-500 rounded-2xl blur-xl opacity-30 animate-pulse" />
              <div className="relative bg-slate-100 dark:bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700">
                {/* Abstract representation of a tool or workshop */}
                <div className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center text-9xl">
                  🛠️
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="size-8 rounded-full bg-slate-200 border-2 border-white dark:border-slate-800" />
                    ))}
                  </div>
                  <div className="text-xs font-semibold">
                    <span className="block text-slate-900 dark:text-white">10k+</span>
                    <span className="text-slate-500">Happy Users</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;