import { User, Users, Pencil, Trash2 } from "lucide-react";
import { getCategoryGroup, getGroupStyles } from "../utils/categoryHelpers";

export default function TableCard({ table, onEdit, onUpdate, onDelete }) {
    // Capacity logic (default 10)
    const capacity = 10;
    const currentPax = parseInt(table.pax) || 0;
    const fillPercentage = Math.min((currentPax / capacity) * 100, 100);
    const isFull = currentPax >= capacity;

    // Pax Color Logic (User Request: <5 Orange, >5 Blue, 10 Green)
    const getPaxColor = () => {
        if (currentPax >= 10) return "bg-green-500";
        if (currentPax < 5) return "bg-orange-400"; // Orange
        return "bg-blue-500"; // 5-9 Blue
    };

    // Use centralized group logic for consistent styling
    const groupName = getCategoryGroup(table.category);
    const styles = getGroupStyles(groupName);

    // Localization Helper
    const getDisplayCategory = (cat) => {
        if (!cat) return "未分类";
        // If it's a known short code, expand it (optional), 
        // but mostly we just return specific Chinese category name.
        if (cat === "Affiliate") return "属会";
        if (cat === "Association") return "社团";
        return cat;
    };

    return (
        <div
            className={`relative group p-4 rounded-xl border-2 flex flex-col items-center justify-center shadow-sm transition-all hover:shadow-md cursor-pointer bg-white ${styles.border}`}
            style={{ width: '160px', height: '190px' }}
            onClick={() => onEdit(table)}
        >

            {/* Action Buttons (Hover) */}
            <div className="absolute top-2 right-2 flex gap-1 z-20">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(table); }}
                    className="p-1.5 text-gray-500 hover:text-blue-600 bg-white/90 rounded-full shadow-sm hover:shadow transition-colors"
                    title="编辑"
                >
                    <Pencil size={14} />
                </button>
            </div>

            {/* Main Circle with Water Level/Progress */}
            <div className="relative w-24 h-24 mb-3 rounded-full overflow-hidden border-4 border-gray-100 bg-white">

                {/* Wave Container */}
                <div className="absolute bottom-0 left-0 right-0 transition-all duration-500 ease-in-out"
                    style={{ height: `${fillPercentage}%` }}>
                    <div className={`w-full h-full opacity-80 ${getPaxColor()}`}></div>
                </div>

                {/* Center Number */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <span className={`text-2xl font-bold ${fillPercentage > 50 ? 'text-white' : 'text-gray-700'}`}>
                        {table.tableNumber}
                    </span>
                </div>
            </div>

            {/* Table Name */}
            <div className="text-center w-full px-1">
                <h3 className="font-bold text-sm truncate w-full" title={table.name}>
                    {table.name}
                </h3>
                <p className={`text-xs font-medium truncate ${styles.text}`} title={table.category}>
                    {getDisplayCategory(table.category)}
                </p>
            </div>

            {/* Pax Controls */}
            <div className="mt-2 flex items-center gap-2 z-20">
                <button
                    onClick={(e) => { e.stopPropagation(); onUpdate({ ...table, pax: Math.max(0, currentPax - 1) }); }}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
                >
                    -
                </button>
                <div className={`flex items-center space-x-1 text-xs font-bold px-2 py-0.5 rounded-full ${isFull ? 'bg-red-100 text-red-600' : 'bg-white/80 text-gray-600'}`}>
                    <Users size={12} />
                    <span>{currentPax}</span>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onUpdate({ ...table, pax: Math.min(20, currentPax + 1) }); }}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
                >
                    +
                </button>
            </div>
        </div>
    );
}
