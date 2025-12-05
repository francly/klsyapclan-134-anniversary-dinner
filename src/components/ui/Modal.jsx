import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({ isOpen, onClose, title, children }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => (document.body.style.overflow = "unset");
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1f1f1f] rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto transition-colors">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#2d2d2d]">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
                    <button onClick={onClose} className="p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#2d2d2d] rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4 text-gray-900 dark:text-gray-200">{children}</div>
            </div>
        </div>
    );
}
