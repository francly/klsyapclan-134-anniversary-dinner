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

    // Confirm Delete
    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm(`确定要删除桌次 "${table.name}" 吗？`)) {
            onDelete(table.id);
        }
    };

    return (
        <div
            className={`relative group p-4 rounded-xl border-2 flex flex-col items-center justify-center shadow-sm transition-all hover:shadow-md cursor-pointer bg-white ${styles.border}`}
            style={{ width: '200px', height: '250px' }}
            onClick={() => onEdit(table)}
        >

            {/* Action Buttons (Hover) */}
            <div className="absolute top-2 right-2 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(table); }}
                    className="p-1.5 text-gray-500 hover:text-blue-600 bg-white/90 rounded-full shadow-sm hover:shadow transition-colors"
                    title="编辑"
                >
                    <Pencil size={14} />
                </button>
                <button
                    onClick={handleDelete}
                    className="p-1.5 text-gray-400 hover:text-red-500 bg-white/90 rounded-full shadow-sm hover:shadow transition-colors"
                    title="删除"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Main Circle with Water Level/Progress or Pie Chart */}
            <div className="relative w-32 h-32 mb-2 shrink-0 rounded-full overflow-hidden border-4 border-gray-100 bg-white shadow-inner">

                {table.seats && table.seats.length > 1 ? (
                    // PIE CHART MODE
                    <div
                        className="w-full h-full opacity-80"
                        style={{
                            background: `conic-gradient(${(() => {
                                let currentDeg = 0;
                                const total = table.seats.reduce((sum, s) => sum + (parseInt(s.pax) || 0), 0);
                                if (total === 0) return '#e5e7eb 0% 100%'; // Gray if empty

                                return table.seats.map(s => {
                                    const pax = parseInt(s.pax) || 0;
                                    const group = getCategoryGroup(s.category);
                                    const style = getGroupStyles(group);
                                    const deg = (pax / total) * 360;
                                    const segment = `${style.pieColor} ${currentDeg}deg ${currentDeg + deg}deg`;
                                    currentDeg += deg;
                                    return segment;
                                }).join(', ')
                            })()
                                })`
                        }}
                    ></div>
                ) : (
                    // WATER WAVE MODE
                    <div className="absolute bottom-0 left-0 right-0 transition-all duration-500 ease-in-out"
                        style={{ height: `${fillPercentage}%` }}>
                        <div className={`w-full h-full opacity-80 ${getPaxColor()}`}></div>
                    </div>
                )}

                {/* Center Text - Table Name */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-2">
                    <span className={`text-2xl font-bold bg-transparent text-center leading-tight ${(table.seats && table.seats.length > 1) || fillPercentage > 50 ? 'text-white drop-shadow-md' : 'text-gray-700'
                        }`}>
                        {table.name}
                    </span>
                </div>
            </div>

            {/* Category and Details */}
            <div className="text-center w-full px-1 flex flex-col items-center mb-1">
                {table.seats && table.seats.length > 1 ? (
                    <div className="w-full max-h-20 overflow-y-auto mt-1 no-scrollbar flex flex-col items-center">
                        {table.seats.map((seat, idx) => (
                            <div key={idx} className="flex justify-between w-full px-2 text-sm text-gray-700 font-medium">
                                <span className="line-clamp-1 flex-1 text-left mr-1" title={seat.category}>{seat.category}</span>
                                <span className="font-bold shrink-0">{seat.pax}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={`text-sm font-semibold line-clamp-4 w-full ${styles.text} bg-transparent mt-1 min-h-[4rem] flex items-center justify-center`} title={table.category}>
                        {getDisplayCategory(table.category)}
                    </p>
                )}

                {table.notes && (
                    <p className="text-[10px] text-gray-500 line-clamp-1 w-full mt-0.5 px-2 bg-transparent italic" title={table.notes}>
                        {table.notes}
                    </p>
                )}
            </div>
        </div>
    );
}
