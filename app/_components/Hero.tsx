"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  const pathname = usePathname();

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const sectionPaths = ["/shop", "/who", "/what", "/contact"];
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

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-sm font-medium mb-6 animate-fadeUp">
            <Sparkles className="size-4" />
            <span>Industrial Grade Excellence</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight text-slate-900 dark:text-white">
            Tools Built for <br />
            <span className="text-gradient">True Professionals</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Experience precision-crafted power tools designed for performance,
            unwavering reliability, and lifetime longevity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              onClick={(e) => handleScroll(e, "/shop")}
              className="w-full sm:w-auto px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2 group"
            >
              Shop Now
              <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/what"
              onClick={(e) => handleScroll(e, "/what")}
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-full font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center"
            >
              Explore Tools
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}