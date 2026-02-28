"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavCategoryItemProps {
    category: any;
    allCategories: any[];
    depth?: number;
}

const NavCategoryItem = ({ category, allCategories, depth = 0 }: NavCategoryItemProps) => {
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
                        <NavCategoryItem key={child._id} category={child} allCategories={allCategories} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default NavCategoryItem;
