"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, ShoppingBag, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingBar from "./LoadingBar";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Who we are", href: "/#who" },
    { name: "What we offer", href: "/#what" },
    { name: "Contact", href: "/components/Contact" },
  ];

  return (
    <>
      <LoadingBar />
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b",
          scrolled
            ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200 dark:border-slate-800 shadow-sm"
            : "bg-transparent border-transparent"
        )}
      >
        <nav className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="size-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-all">
              D
            </div>
            <span className={cn("font-bold text-xl tracking-tight transition-colors",
              scrolled ? "text-slate-900 dark:text-white" : "text-slate-800 dark:text-white"
            )}>
              DDTEC
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 rounded-full text-sm font-medium transition-colors hover:text-teal-600 dark:hover:text-teal-400",
                  pathname === link.href
                    ? "text-teal-600 dark:text-teal-400"
                    : scrolled
                      ? "text-slate-600 dark:text-slate-300"
                      : "text-slate-700 dark:text-slate-200 hover:text-teal-600"
                )}
              >
                {pathname === link.href && (
                  <motion.div
                    layoutId="navbar-pill"
                    className="absolute inset-0 bg-teal-50/50 dark:bg-teal-900/20 rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/#shop"
              className={cn(
                "p-2 rounded-full transition-colors relative group",
                scrolled
                  ? "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  : "text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10"
              )}
            >
              <ShoppingBag className="size-5" />
              <span className="absolute top-1.5 right-1.5 size-2 bg-teal-500 rounded-full border-2 border-white dark:border-slate-900" />
            </Link>

            {mounted && (
              <button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  scrolled
                    ? "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    : "text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10"
                )}
              >
                {theme === "light" ? <Moon className="size-5" /> : <Sun className="size-5" />}
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={cn(
                "md:hidden p-2 rounded-full transition-colors",
                scrolled
                  ? "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  : "text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10"
              )}
            >
              {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[280px] bg-white dark:bg-slate-900 z-50 md:hidden shadow-2xl flex flex-col"
            >
              <div className="p-5 border-b dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-lg dark:text-white">Menu</span>
                <button onClick={() => setMenuOpen(false)} className="p-2 -mr-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                  <X className="size-5" />
                </button>
              </div>

              <div className="flex flex-col p-4 gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl transition-all",
                      pathname === link.href
                        ? "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 font-semibold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    {link.name}
                    <ChevronRight className="size-4 opacity-50" />
                  </Link>
                ))}
              </div>

              <div className="mt-auto p-5 border-t dark:border-slate-800">
                <p className="text-xs text-center text-slate-400">© 2024 DDTEC</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
