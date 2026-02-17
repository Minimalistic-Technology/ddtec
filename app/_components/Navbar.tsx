"use client";

import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, ShoppingBag, ChevronRight, User, LogOut, ChevronDown, Package, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingBar from "./LoadingBar";
import api from "@/lib/api";
import { useAuth } from "../_context/AuthContext";
import { useCart } from "../_context/CartContext";

// Helper component for recursive category rendering
const CategoryItem = ({ category, allCategories, depth = 0 }: { category: any, allCategories: any[], depth?: number }) => {
  const children = allCategories.filter(c => c.parent && (c.parent._id === category._id || c.parent === category._id));
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="flex flex-col">
      <div className={cn(
        "flex items-center justify-between pr-2 transition-colors",
        depth === 0 ? "hover:bg-slate-50 dark:hover:bg-slate-800" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
      )}>
        <Link
          href={`/shop?category=${category.slug || category._id}`}
          className={cn(
            "block py-1.5 text-sm transition-colors hover:text-teal-600 dark:hover:text-teal-400 truncate flex-1",
            depth === 0
              ? "font-bold text-slate-800 dark:text-slate-100 px-4 py-2"
              : "text-slate-600 dark:text-slate-400 border-l-2 border-transparent hover:border-teal-100"
          )}
          style={{ paddingLeft: depth > 0 ? `${depth * 12 + 16}px` : undefined }}
        >
          {category.name}
        </Link>
        {children.length > 0 && (
          <button
            onClick={handleToggle}
            className="p-1 rounded-md text-slate-400 hover:text-teal-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          </button>
        )}
      </div>
      {children.length > 0 && isExpanded && (
        <div className="flex flex-col">
          {children.map(child => (
            <CategoryItem key={child._id} category={child} allCategories={allCategories} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  // ... existing hooks
  const { user, logout } = useAuth();
  const { cartCount } = useCart(); // Cart Context Hook
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [currentHash, setCurrentHash] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);



  useEffect(() => {
    setMounted(true);
    if (window.location.hash) {
      setCurrentHash(window.location.hash.substring(1));
    }
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        console.log("Navbar: Fetched categories:", data);
        setCategories(data);
      } catch (error) {
        console.error("Navbar: Failed to fetch categories", error);
      }
    };
    fetchCategories();

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
    { name: "Blog", href: "/blogs" },
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
    const sectionPaths = ["/who", "/what", "/contact"];
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
        <nav className={cn("px-4 md:px-6 h-16 flex items-center justify-between relative", pathname?.startsWith('/admin') ? "w-full" : "container mx-auto")}>

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
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => {
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                  setHoveredLink(link.name);
                }}
                onMouseLeave={() => {
                  timeoutRef.current = setTimeout(() => setHoveredLink(null), 200);
                }}
              >
                <Link
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={cn(
                    "relative px-4 py-2 rounded-full text-sm font-medium transition-colors hover:text-teal-600 dark:hover:text-teal-400 block",
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

                {/* Shop Dropdown */}
                <AnimatePresence>
                  {link.name === "Shop" && hoveredLink === "Shop" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-3 overflow-hidden z-50"
                    >
                      {categories.length > 0 ? (
                        <div className="max-h-[60vh] overflow-y-auto">
                          {categories
                            .filter(cat => !cat.parent) // Top-level categories
                            .map((parent) => (
                              <CategoryItem key={parent._id} category={parent} allCategories={categories} depth={0} />
                            ))}
                        </div>
                      ) : (
                        <div className="px-4 py-2.5 text-sm text-slate-500 italic">No categories found</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
                <div className="hidden md:block relative">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    onBlur={() => setTimeout(() => setShowProfileDropdown(false), 200)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all hover:bg-slate-100 dark:hover:bg-slate-800",
                      scrolled ? "text-slate-700 dark:text-slate-200" : "text-slate-700 dark:text-slate-200"
                    )}
                  >
                    <div className="size-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
                      <User className="size-4" />
                    </div>
                    <span className="font-medium">
                      {user.firstName || user.name?.split(' ')[0] || user.email?.split('@')[0] || 'User'}
                    </span>
                    <ChevronDown className={cn("size-4 transition-transform", showProfileDropdown && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {showProfileDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 overflow-hidden"
                      >
                        <div className="px-4 py-2 border-b border-slate-50 dark:border-slate-800 mb-1">
                          <p className="text-xs font-bold text-slate-400 uppercase">Account</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.email}</p>
                        </div>

                        <Link
                          href="/orders"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Package className="size-4" />
                          Order History
                        </Link>

                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Settings className="size-4" />
                          Account Details
                        </Link>

                        <div className="mt-1 pt-1 border-t border-slate-50 dark:border-slate-800">
                          <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                          >
                            <LogOut className="size-4" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
