import { useRef, useEffect } from "react";
import { Check, X } from "lucide-react";
import { committee } from "../../data/committee";

export default function MultiSelectPopover({ selected = [], onClose, onSelect }) {
    const popoverRef = useRef(null);

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

    const handleToggle = (member) => {
        const isSelected = selected.includes(member);
        let updated;
        if (isSelected) {
            updated = selected.filter(m => m !== member);
        } else {
            updated = [...selected, member];
        }
        onSelect(updated);
    };

    return (
        <div ref={popoverRef} className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#333] rounded-md shadow-xl z-50 max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-[#2d2d2d] flex justify-between items-center sticky top-0 bg-white dark:bg-[#1f1f1f] z-10">
                <span>选择负责人</span>
                <button onClick={onClose} className="hover:text-gray-700 dark:hover:text-gray-200">
                    <X className="w-3 h-3" />
                </button>
            </div>
            {committee.map(group => (
                <div key={group.role}>
                    <div className="px-4 py-1.5 text-xs font-semibold text-gray-400 bg-gray-50 dark:bg-[#2d2d2d] sticky top-[33px] z-10">{group.role}</div>
                    {group.members.map(member => {
                        const isSelected = selected.includes(member);
                        return (
                            <button
                                key={member}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggle(member);
                                }}
                                className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#2d2d2d] text-gray-700 dark:text-gray-200 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${isSelected ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        {member.charAt(0)}
                                    </div>
                                    {member}
                                </span>
                                {isSelected && <Check className="w-4 h-4 text-blue-500" />}
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
