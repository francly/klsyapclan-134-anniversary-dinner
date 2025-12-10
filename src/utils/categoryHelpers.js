import { CATEGORY_GROUPS } from '../data/categories.js';

export const CATEGORY_NAMES = {
    AFFILIATE: "属会宗亲会",
    ASSOCIATION: "其他社团",
    OTHER: "其他"
};

/**
 * Determines which broad group a specific category belongs to.
 * Checks if the exact category name exists in the predefined arrays in CATEGORY_GROUPS.
 * @param {string} categoryName - The specific category name (e.g., "吉隆坡沈氏宗祠")
 * @returns {string} - "属会宗亲会", "其他社团", or "其他"
 */
export const getCategoryGroup = (categoryName) => {
    if (!categoryName) return CATEGORY_NAMES.OTHER;

    // Check specific groups first
    if (CATEGORY_GROUPS["属会 (Category A)"].includes(categoryName)) {
        return CATEGORY_NAMES.AFFILIATE;
    }
    if (CATEGORY_GROUPS["其他社团 (Category B)"].includes(categoryName)) {
        return CATEGORY_NAMES.ASSOCIATION;
    }

    // Fallback: Check for keywords if it's a custom input not in the list
    if (categoryName.includes("属会") || categoryName.includes("宗祠") || categoryName.includes("宗亲")) return CATEGORY_NAMES.AFFILIATE;
    if (categoryName.includes("会馆") || categoryName.includes("社团")) return CATEGORY_NAMES.ASSOCIATION;

    return CATEGORY_NAMES.OTHER;
};

/**
 * Returns style properties for a given category group.
 * @param {string} groupName - The group name returned by getCategoryGroup
 */
export const getGroupStyles = (groupName) => {
    switch (groupName) {
        case CATEGORY_NAMES.AFFILIATE:
            return {
                border: "border-cyan-400",
                text: "text-cyan-700",
                bg: "bg-cyan-50",
                headerColor: "text-cyan-800 border-cyan-200 bg-cyan-50"
            };
        case CATEGORY_NAMES.ASSOCIATION:
            return {
                border: "border-emerald-400",
                text: "text-emerald-700",
                bg: "bg-emerald-50",
                headerColor: "text-emerald-800 border-emerald-200 bg-emerald-50"
            };
        default: // OTHER
            return {
                border: "border-gray-300",
                text: "text-gray-700",
                bg: "bg-gray-50",
                headerColor: "text-gray-700 border-gray-200 bg-gray-50"
            };
    }
};
