import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Category } from "./types";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Helper to get all descendant category IDs (recursive)
export const getCategoryDescendants = (categoryId: string, allCategories: Category[]): string[] => {
    const children = allCategories.filter(c => c.parent === categoryId || (c.parent as any)?._id === categoryId);
    let ids = [categoryId];
    children.forEach(child => {
        ids = [...ids, ...getCategoryDescendants(child._id, allCategories)];
    });
    return ids;
};
