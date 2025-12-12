import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Save, Edit2 } from 'lucide-react';
import Modal from './ui/Modal';

export default function CategoryManager({ isOpen, onClose, initialCategories, onSave }) {
    const [categories, setCategories] = useState(initialCategories);
    const [activeTab, setActiveTab] = useState(Object.keys(initialCategories)[0] || "");
    const [newItem, setNewItem] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Sync when initialCategories changes
    useEffect(() => {
        if (isOpen) {
            setCategories(initialCategories);
            setActiveTab(Object.keys(initialCategories)[0] || "");
        }
    }, [isOpen, initialCategories]);

    const handleAddItem = (e) => {
        e.preventDefault();
        if (!newItem.trim() || !activeTab) return;

        setCategories(prev => ({
            ...prev,
            [activeTab]: [...(prev[activeTab] || []), newItem.trim()]
        }));
        setNewItem("");
    };

    const handleDeleteItem = (group, index) => {
        if (!window.confirm("确定要删除这个类别吗？")) return;
        setCategories(prev => ({
            ...prev,
            [group]: prev[group].filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categories),
            });

            if (!response.ok) throw new Error("Failed to save");

            await onSave(categories); // Callback to update parent state
            onClose();
        } catch (error) {
            alert("保存失败: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="管理类别列表 (Category Manager)">
            <div className="flex flex-col h-[60vh]">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                    {Object.keys(categories).map(group => (
                        <button
                            key={group}
                            onClick={() => setActiveTab(group)}
                            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === group
                                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                }`}
                        >
                            {group}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeTab && (
                        <>
                            <form onSubmit={handleAddItem} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newItem}
                                    onChange={(e) => setNewItem(e.target.value)}
                                    placeholder={`添加新条目到 ${activeTab}...`}
                                    className="flex-1 border rounded-lg p-2 dark:bg-[#2d2d2d] dark:border-[#333]"
                                />
                                <button
                                    type="submit"
                                    disabled={!newItem.trim()}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </form>

                            <div className="space-y-2">
                                {(categories[activeTab] || []).map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#252525] rounded-lg group">
                                        <span className="text-sm">{item}</span>
                                        <button
                                            onClick={() => handleDeleteItem(activeTab, index)}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {(categories[activeTab] || []).length === 0 && (
                                    <div className="text-center text-gray-400 py-4 text-sm">
                                        暂无条目
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2d2d2d] rounded-lg"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                    >
                        {isSaving ? "保存中..." : <><Save className="w-4 h-4" /> 保存更改</>}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
