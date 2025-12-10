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
    if (!CATEGORY_GROUPS) return CATEGORY_NAMES.OTHER; // Safety check

    // Check specific groups first (Use optional chaining)
    if (CATEGORY_GROUPS["属会 (Category A)"]?.includes(categoryName)) {
        return CATEGORY_NAMES.AFFILIATE;
    }
    if (CATEGORY_GROUPS["其他社团 (Category B)"]?.includes(categoryName)) {
        return CATEGORY_NAMES.ASSOCIATION;
    }

    // Safety: Ensure it's a string before calling string methods
    const catStr = String(categoryName);

    // Fallback: Check for keywords
    if (catStr.includes("属会") || catStr.includes("宗祠") || catStr.includes("宗亲")) return CATEGORY_NAMES.AFFILIATE;
    if (catStr.includes("会馆") || catStr.includes("社团")) return CATEGORY_NAMES.ASSOCIATION;

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
                border: "border-green-400",
                text: "text-green-700",
                bg: "bg-green-50",
                headerColor: "text-green-800 border-green-200 bg-green-50",
                pieColor: "#22c55e" // green-500
            };
        case CATEGORY_NAMES.ASSOCIATION:
            return {
                border: "border-blue-400",
                text: "text-blue-700",
                bg: "bg-blue-50",
                headerColor: "text-blue-800 border-blue-200 bg-blue-50",
                pieColor: "#3b82f6" // blue-500
            };
        default: // OTHER
            return {
                border: "border-orange-300",
                text: "text-orange-700",
                bg: "bg-orange-50",
                headerColor: "text-orange-800 border-orange-200 bg-orange-50",
                pieColor: "#f97316" // orange-500
            };
    }
};
