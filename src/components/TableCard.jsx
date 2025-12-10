import { User, Users } from "lucide-react";

export default function TableCard({ table, onDelete }) {
    // Calculate color based on category
    const getCategoryColor = (category) => {
        switch (category) {
            case "Affiliate": return "bg-blue-100 border-blue-300 text-blue-800";
            case "Association": return "bg-green-100 border-green-300 text-green-800";
            case "Individual": return "bg-gray-100 border-gray-300 text-gray-800";
            default: return "bg-white border-gray-200";
        }
    };

    const getCircleColor = (category) => {
        switch (category) {
            case "Affiliate": return "bg-blue-500";
            case "Association": return "bg-green-500";
            case "Individual": return "bg-gray-500";
            default: return "bg-gray-400";
        }
    };

    return (
        <div className={`relative p-4 rounded-xl border-2 flex flex-col items-center justify-center shadow-sm transition-all hover:shadow-md ${getCategoryColor(table.category)}`} style={{ width: '160px', height: '160px' }}>

            {/* Delete Button (Hover) */}
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(table.id); }}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete Table"
            >
                &times;
            </button>

            {/* Main Circle (Table) */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2 shadow-inner ${getCircleColor(table.category)}`}>
                {table.tableNumber}
            </div>

            {/* Table Name */}
            <div className="text-center">
                <h3 className="font-bold text-sm truncate w-full px-1" title={table.name}>
                    {table.name}
                </h3>
                <p className="text-xs opacity-75">
                    {table.category === 'Affiliate' ? '属会' :
                        table.category === 'Association' ? '社团' :
                            table.category === 'Individual' ? '个人' : table.category}
                </p>
            </div>

            {/* Pax Indicator */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center space-x-1 text-xs font-semibold bg-white/50 px-2 py-0.5 rounded-full">
                <Users size={10} />
                <span>{table.pax || 10}</span>
            </div>
        </div>
    );
}
