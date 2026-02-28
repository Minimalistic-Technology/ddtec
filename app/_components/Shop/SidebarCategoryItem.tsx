"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Category } from "@/lib/types";
import { getCategoryDescendants } from "@/lib/utils";

interface SidebarCategoryItemProps {
    category: Category;
    allCategories: Category[];
    selectedCategory: string;
    onSelect: (id: string) => void;
    depth?: number;
}

const SidebarCategoryItem = ({
    category,
    allCategories,
    selectedCategory,
    onSelect,
    depth = 0
}: SidebarCategoryItemProps) => {
    const children = allCategories.filter(c => c.parent === category._id || (c.parent as any)?._id === category._id);
    const isSelected = selectedCategory === (category.slug || category._id) || selectedCategory === category._id;

    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (isSelected) {
            setIsExpanded(true);
        } else {
            const descendants = getCategoryDescendants(category._id, allCategories);
            if (descendants.some(id => id === selectedCategory || allCategories.find(c => c._id === id)?.slug === selectedCategory)) {
                setIsExpanded(true);
            }
        }
    }, [selectedCategory, category._id, allCategories, isSelected]);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="flex flex-col">
            <div className={`flex items-center justify-between w-full rounded-lg transition-colors ${isSelected
                ? "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
            >
                <button
                    onClick={() => onSelect(category.slug || category._id)}
                    className="flex-1 text-left px-3 py-1.5 text-sm font-medium truncate"
                    style={{ paddingLeft: `${depth * 12 + 12}px` }}
                >
                    {category.name}
                </button>
                {children.length > 0 && (
                    <button
                        onClick={handleToggle}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md mr-1"
                    >
                        {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                    </button>
                )}
            </div>

            {children.length > 0 && isExpanded && (
                <div className="flex flex-col mt-0.5 animate-in slide-in-from-top-2 duration-200">
                    {children.map(child => (
                        <SidebarCategoryItem
                            key={child._id}
                            category={child}
                            allCategories={allCategories}
                            selectedCategory={selectedCategory}
                            onSelect={onSelect}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SidebarCategoryItem;
