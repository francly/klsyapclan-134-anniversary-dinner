import { User, Users, Pencil, Trash2 } from "lucide-react";

export default function TableCard({ table, onEdit, onUpdate, onDelete }) {
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
            <div className="absolute top-2 right-2 flex gap-1 z-20">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(table); }}
                    className="p-1.5 text-gray-500 hover:text-blue-600 bg-white/90 rounded-full shadow-sm hover:shadow transition-colors"
                    title="Edit"
                >
                    <Pencil size={14} />
                </button>
            </div>

            {/* Main Circle with Water Level/Progress */}
            <div className="relative w-24 h-24 mb-3 rounded-full overflow-hidden border-4 border-gray-100 bg-white">

                {/* Wave Container */}
                <div className="absolute bottom-0 left-0 right-0 transition-all duration-500 ease-in-out"
                    style={{ height: `${fillPercentage}%` }}>
                    <div className={`w-full h-full opacity-80 ${isFull ? 'bg-red-500' :
                        table.category.includes('Affiliate') || table.category.includes('属会') ? 'bg-blue-500' :
                            table.category.includes('Association') || table.category.includes('社团') ? 'bg-green-500' :
                                'bg-gray-400'
                        }`}></div>
                    {/* Wave SVG Overlay (Simplified) */}
                    {/* Using a CSS mask or just a simple block for now to ensure robustness, or a specialized wave SVG */}
                </div>

                {/* Wave Animation Element (Optional Polish: CSS Keyframes would be needed defined in index.css) 
                     For now, using a solid fill transition which is robust and "water-like" level.
                     To match the image EXACTLY (wavy top), I'd need a complex SVG path.
                     I'll stick to a "filling level" first to ensure it works.
                 */}

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
                <p className="text-xs opacity-75 truncate" title={table.category}>
                    {table.category}
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
