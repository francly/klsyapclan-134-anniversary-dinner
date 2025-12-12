import { format, addDays, nextMonday } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { useRef, useEffect } from "react";

export default function DatePickerPopover({ onClose, onSelect }) {
    const popoverRef = useRef(null);
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const nextWeek = nextMonday(today);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                onClose();
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [onClose]);

    const handleSelect = (date) => {
        if (date) {
            onSelect(date);
        }
        onClose();
    };

    return (
        <div ref={popoverRef} className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#333] rounded-md shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-[#2d2d2d] text-center">
                选择截止日期
            </div>
            <div className="py-1">
                <button type="button" onClick={() => handleSelect(today)} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-[#2d2d2d] text-gray-700 dark:text-gray-200 group/item transition-colors">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-400 group-hover/item:text-blue-500" />
                        <span>今天</span>
                    </div>
                    <span className="text-xs text-gray-400">{format(today, "EEE", { locale: zhCN })}</span>
                </button>
                <button type="button" onClick={() => handleSelect(tomorrow)} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-[#2d2d2d] text-gray-700 dark:text-gray-200 group/item transition-colors">
                    <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-400 group-hover/item:text-blue-500" />
                        <span>明天</span>
                    </div>
                    <span className="text-xs text-gray-400">{format(tomorrow, "EEE", { locale: zhCN })}</span>
                </button>
                <button type="button" onClick={() => handleSelect(nextWeek)} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-[#2d2d2d] text-gray-700 dark:text-gray-200 group/item transition-colors">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-400 group-hover/item:text-blue-500" />
                        <span>下周</span>
                    </div>
                    <span className="text-xs text-gray-400">{format(nextWeek, "EEE", { locale: zhCN })}</span>
                </button>
                <div className="border-t border-gray-100 dark:border-[#2d2d2d] mt-1 pt-1">
                    <label className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-[#2d2d2d] text-gray-700 dark:text-gray-200 cursor-pointer group/item relative transition-colors">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-gray-400 group-hover/item:text-blue-500" />
                            <span>更多日期...</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <input
                            type="date"
                            onClick={(e) => {
                                try {
                                    e.target.showPicker();
                                } catch (err) {
                                    // Fallback
                                }
                            }}
                            onChange={(e) => {
                                if (e.target.valueAsDate) {
                                    handleSelect(e.target.valueAsDate);
                                }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}
