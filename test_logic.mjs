import { getCategoryGroup, getGroupStyles, CATEGORY_NAMES } from './src/utils/categoryHelpers.js';

console.log("Testing Logic...");

const testCases = [
    "吉隆坡沈氏宗祠", // Should be AFFILIATE
    "雪隆惠州会馆", // Should be ASSOCIATION
    "Random Person", // Should be OTHER
    null,
    undefined
];

testCases.forEach(cat => {
    try {
        const group = getCategoryGroup(cat);
        console.log(`Category: "${cat}" -> Group: "${group}"`);

        const style = getGroupStyles(group);
        console.log(`Style for ${group}:`, style ? "OK" : "MISSING");
    } catch (e) {
        console.error(`ERROR processing "${cat}":`, e);
    }
});

console.log("Done.");
