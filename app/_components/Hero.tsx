"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Hammer, Wrench, Settings, Drill } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  const pathname = usePathname();

  // Mouse position for parallax
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring animation for mouse movement
  const mouseX = useSpring(x, { stiffness: 50, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Calculate normalized mouse position (-1 to 1)
      const xPos = (e.clientX / innerWidth - 0.5) * 2;
      const yPos = (e.clientY / innerHeight - 0.5) * 2;
      x.set(xPos);
      y.set(yPos);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  // Static positions with defined parallax depth factors
  const backgroundIcons = [
    { Icon: Hammer, top: "20%", left: "10%", rotate: 15, size: 48, depth: 20 },
    { Icon: Drill, top: "15%", left: "85%", rotate: -20, size: 56, depth: 30 },
    { Icon: Wrench, top: "70%", left: "15%", rotate: 45, size: 52, depth: 15 },
    { Icon: Settings, top: "80%", left: "80%", rotate: -10, size: 64, depth: 25 },
    { Icon: Hammer, top: "10%", left: "50%", rotate: 10, size: 40, depth: 10 },
    { Icon: Drill, top: "45%", left: "5%", rotate: -30, size: 48, depth: 35 },
    { Icon: Wrench, top: "50%", left: "90%", rotate: 10, size: 44, depth: 20 },
    { Icon: Settings, top: "90%", left: "40%", rotate: 20, size: 50, depth: 15 },
    { Icon: Hammer, top: "40%", left: "70%", rotate: -15, size: 46, depth: 25 },
    { Icon: Drill, top: "30%", left: "30%", rotate: 5, size: 54, depth: 30 },
    { Icon: Wrench, top: "85%", left: "60%", rotate: -25, size: 42, depth: 15 },
    { Icon: Settings, top: "60%", left: "20%", rotate: 30, size: 58, depth: 20 },
  ];

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
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 group/hero"
    >
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-slate-50/80 dark:to-slate-900/80 z-0" />

      {/* Interactive Parallax Icons */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {backgroundIcons.map((item, index) => (
          <ParallaxIcon key={index} item={item} mouseX={mouseX} mouseY={mouseY} />
        ))}
      </div>

      {/* Static Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto pointer-events-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-sm font-medium mb-6 animate-fadeUp backdrop-blur-sm">
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

// Separate component to handle per-icon transforms
function ParallaxIcon({ item, mouseX, mouseY }: { item: any, mouseX: any, mouseY: any }) {
  // Move opposite to mouse direction for depth effect
  const x = useTransform(mouseX, [-1, 1], [-item.depth, item.depth]);
  const y = useTransform(mouseY, [-1, 1], [-item.depth, item.depth]);

  return (
    <motion.div
      className="absolute text-slate-400 dark:text-slate-800 transition-colors duration-300 pointer-events-none"
      style={{
        left: item.left,
        top: item.top,
        rotate: item.rotate,
        x,
        y,
      }}
    >
      <item.Icon size={item.size} strokeWidth={1.5} />
    </motion.div>
  );
}