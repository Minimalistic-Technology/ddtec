"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, ShoppingBag, ChevronRight, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingBar from "./LoadingBar";
import { useAuth } from "../_context/AuthContext";
import { useCart } from "../_context/CartContext";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { cartCount } = useCart(); // Cart Context Hook
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentHash, setCurrentHash] = useState("");
  const pathname = usePathname();
  const router = useRouter();



  useEffect(() => {
    setMounted(true);
    if (window.location.hash) {
      setCurrentHash(window.location.hash.substring(1));
    }
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll Spy Logic
  useEffect(() => {
    if (pathname !== "/") return;

    const sections = ["home", "who", "what", "shop", "contact"];
    const observer = new IntersectionObserver((entries) => {
      const visibleSection = entries.find(entry => entry.isIntersecting);
      if (visibleSection) {
        const newHash = visibleSection.target.id === "home" ? "" : visibleSection.target.id;
        setCurrentHash(prev => prev === newHash ? prev : newHash);
      }
    }, {
      rootMargin: "-20% 0px -50% 0px",
      threshold: 0.1
    });

    sections.forEach(id => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Who we are", href: "/who" },
    { name: "What we offer", href: "/what" },
    { name: "Contact", href: "/contact" },
    ...(user && user.role === 'admin' ? [{ name: "Dashboard", href: "/admin" }] : [])
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === "/") {
      e.preventDefault();
      setCurrentHash("");
      if (pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        router.push("/");
      }
      setMenuOpen(false);
      return;
    }

    // List of clean paths that should scroll on home page
    const sectionPaths = ["/shop", "/who", "/what", "/contact"];
    const sectionId = href.startsWith("/") ? href.substring(1) : href;

    if (sectionPaths.includes(href)) {
      e.preventDefault();
      setCurrentHash(sectionId);

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
    else if (!href.startsWith("/#") && href !== "/") {
      setCurrentHash("");
    }
    setMenuOpen(false);
  };

  useEffect(() => {
    if (pathname === "/") {
      const storedTarget = sessionStorage.getItem("scroll-target");
      if (storedTarget) {
        setCurrentHash(storedTarget);
        setTimeout(() => {
          const element = document.getElementById(storedTarget);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
          sessionStorage.removeItem("scroll-target");
        }, 100);
      } else {
        if (window.location.hash) {
          setCurrentHash(window.location.hash.substring(1));
        } else {
          if (!currentHash) setCurrentHash("");
        }
      }
    } else {
      setCurrentHash("");
    }
  }, [pathname]);

  const isActive = (linkHref: string) => {
    if (pathname !== "/") {
      return linkHref === pathname;
    }
    if (linkHref === "/") {
      return currentHash === "";
    }
    const id = linkHref.startsWith("/") ? linkHref.substring(1) : linkHref;
    return currentHash === id;
  };

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
        <nav className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between relative">

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

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={cn(
                  "relative px-4 py-2 rounded-full text-sm font-medium transition-colors hover:text-teal-600 dark:hover:text-teal-400",
                  isActive(link.href)
                    ? "text-teal-600 dark:text-teal-400"
                    : scrolled
                      ? "text-slate-600 dark:text-slate-300"
                      : "text-slate-700 dark:text-slate-200 hover:text-teal-600"
                )}
              >
                {isActive(link.href) && (
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


          <div className="flex items-center gap-2 sm:gap-4">
            {(!user || user.role !== 'admin') && (
              <Link
                href="/cart"
                onClick={(e) => {
                  if (pathname === '/cart') e.preventDefault();
                  router.push('/cart');
                  setMenuOpen(false);
                }}
                className={cn(
                  "p-2 rounded-full transition-colors relative group",
                  scrolled
                    ? "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    : "text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10"
                )}
              >
                <ShoppingBag className="size-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 size-5 bg-teal-500 rounded-full border-2 border-white dark:border-slate-900 text-[10px] flex items-center justify-center text-white font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

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

            {mounted && (
              user ? (
                <div className="hidden md:flex items-center gap-4">
                  <span className={cn(
                    "font-medium",
                    scrolled ? "text-slate-700 dark:text-slate-200" : "text-slate-700 dark:text-slate-200"
                  )}>
                    Hi, {user.name.split(' ')[0]}
                  </span>
                  <button
                    onClick={logout}
                    title="Logout"
                    className={cn(
                      "p-2 rounded-full transition-colors font-medium items-center gap-2 flex",
                      scrolled
                        ? "hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400"
                        : "text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10"
                    )}
                  >
                    <LogOut className="size-5" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className={cn(
                    "hidden md:flex px-4 py-2 rounded-full text-sm font-bold transition-all items-center gap-2",
                    scrolled
                      ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                      : "bg-white text-slate-900 hover:bg-slate-100 shadow-lg"
                  )}
                >
                  <User className="size-4" /> Login
                </Link>
              )
            )}

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
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl transition-all",
                      isActive(link.href)
                        ? "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 font-semibold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    {link.name}
                    <ChevronRight className="size-4 opacity-50" />
                  </Link>
                ))}
              </div>

              <div className="p-4 border-t dark:border-slate-800">
                {user ? (
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-semibold"
                  >
                    <LogOut className="size-5" /> Logout
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-xl font-semibold"
                  >
                    <User className="size-5" /> Login / Signup
                  </Link>
                )}
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
