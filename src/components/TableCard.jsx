import { User, Users, Pencil, Trash2 } from "lucide-react";

export default function TableCard({ table, onEdit, onDelete }) {
    // Capacity logic (default 10)
    const capacity = 10;
    const currentPax = parseInt(table.pax) || 0;
    const fillPercentage = Math.min((currentPax / capacity) * 100, 100);
    const isFull = currentPax >= capacity;

    const getCategoryColor = (category) => {
        // Simple mapping, can be expanded
        if (category && (category.includes("Affiliate") || category.includes("属会"))) return "bg-blue-50 border-blue-200 text-blue-800";
        if (category && (category.includes("Association") || category.includes("社团"))) return "bg-green-50 border-green-200 text-green-800";
        return "bg-gray-50 border-gray-200 text-gray-800";
    };

    const getCircleColor = (category) => {
        if (category && (category.includes("Affiliate") || category.includes("属会"))) return "text-blue-500";
        if (category && (category.includes("Association") || category.includes("社团"))) return "text-green-500";
        return "text-gray-500";
    };

    return (
        <div
            className={`relative group p-4 rounded-xl border flex flex-col items-center justify-center shadow-sm transition-all hover:shadow-md hover:border-blue-400 cursor-pointer ${getCategoryColor(table.category)}`}
            style={{ width: '160px', height: '180px' }}
            onClick={() => onEdit(table)}
        >

            {/* Action Buttons (Hover) */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(table); }}
                    className="p-1 text-gray-400 hover:text-blue-600 bg-white rounded-full shadow-sm hover:shadow"
                    title="Edit"
                >
                    <Pencil size={12} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(table.id); }}
                    className="p-1 text-gray-400 hover:text-red-500 bg-white rounded-full shadow-sm hover:shadow"
                    title="Delete"
                >
                    <Trash2 size={12} />
                </button>
            </div>

            {/* Main Circle with Water Level/Progress */}
            <div className="relative w-24 h-24 mb-3">
                {/* Background Circle */}
                <div className="absolute inset-0 rounded-full border-4 border-gray-200 opacity-30"></div>

                {/* Progress Circle (SVG) */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle
                        cx="50%" cy="50%" r="40"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray="251" // 2 * pi * 40
                        strokeDashoffset={251 - (251 * fillPercentage) / 100}
                        className={`transition-all duration-500 ${isFull ? 'text-red-500' : getCircleColor(table.category)}`}
                    />
                </svg>

                {/* Center Number */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-700">{table.tableNumber}</span>
                </div>
            </div>

            {/* Table Name */}
            <div className="text-center w-full px-1">
                <h3 className="font-bold text-sm truncate w-full" title={table.name}>
                    {table.name}
                </h3>
                <p className="text-xs opacity-75 truncate" title={table.category}>
                    {table.category}
                </p>
            </div>

            {/* Pax Indicator Pill */}
            <div className={`mt-2 flex items-center space-x-1 text-xs font-bold px-2 py-0.5 rounded-full ${isFull ? 'bg-red-100 text-red-600' : 'bg-white/80 text-gray-600'}`}>
                <Users size={10} />
                <span>{currentPax} / {capacity}</span>
            </div>
        </div>
    );
}
