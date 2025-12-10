import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Users, LayoutGrid } from "lucide-react";
import { useTables } from "../context/TableContext";
import TableCard from "../components/TableCard";
import Modal from "../components/ui/Modal";
import { CATEGORY_GROUPS } from "../data/categories";
import { getCategoryGroup, getGroupStyles, CATEGORY_NAMES } from "../utils/categoryHelpers";

export default function SeatingPlan() {
    const { tables, loading, error, addTable, updateTable, deleteTable } = useTables();
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State for Add/Edit
    const [editMode, setEditMode] = useState(false);
    const [currentTableId, setCurrentTableId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        category: "属会 (Category A)", // Default to first group key or similar
        pax: 10,
        tableNumber: null
    });

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isModalOpen) {
            setEditMode(false);
            setFormData({
                name: "",
                category: Object.keys(CATEGORY_GROUPS)[0] ? Object.values(CATEGORY_GROUPS)[0][0] : "Affiliate", // Default to first item
                pax: 10,
                tableNumber: null
            });
        }
    }, [isModalOpen]);

    // Analytics Logic
    const stats = useMemo(() => {
        const totalTables = tables.length;
        const totalPax = tables.reduce((sum, t) => sum + (parseInt(t.pax) || 0), 0);

        // Simplified category stats mapping based on the user's groups
        const byCategory = tables.reduce((acc, t) => {
            const cat = t.category || "Unknown";
            // Check which group the category belongs to
            let group = "Other";

            // Check Key/Values from CATEGORY_GROUPS
            if (CATEGORY_GROUPS["属会 (Category A)"].includes(cat)) group = "Affiliate";
            else if (CATEGORY_GROUPS["其他社团 (Category B)"].includes(cat)) group = "Association";
            else if (CATEGORY_GROUPS["其他 (Others)"].includes(cat)) group = "Individual";
            else {
                // Fallback checks
                if (cat.includes("属会") || cat.includes("Affiliate")) group = "Affiliate";
                else if (cat.includes("社团") || cat.includes("Association")) group = "Association";
                else if (cat.includes("个人") || cat.includes("Individual")) group = "Individual";
            }

            acc[group] = (acc[group] || 0) + 1;
            return acc;
        }, {});
        return { totalTables, totalPax, byCategory };
    }, [tables]);

    // Filter Logic
    const filteredTables = tables.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEditClick = (table) => {
        setEditMode(true);
        setCurrentTableId(table.id);
        setFormData({
            name: table.name,
            category: table.category,
            pax: table.pax,
            tableNumber: table.tableNumber
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return;

        if (editMode && currentTableId) {
            // Update Existing
            await updateTable({
                id: currentTableId,
                ...formData
            });
        } else {
            // Add New
            const tableNumber = tables.length > 0 ? Math.max(...tables.map(t => t.tableNumber || 0)) + 1 : 1;
            await addTable({
                ...formData,
                tableNumber: tableNumber,
                region: "Main Hall"
            });
        }

        setIsModalOpen(false);
    };

    if (loading) return <div className="p-10 text-center">正在加载席位数据...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <LayoutGrid className="w-8 h-8" />
                        席位安排
                    </h1>
                    <p className="text-gray-500 mt-1">管理晚宴席位与桌次安排</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="搜索桌号或类别..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#1f1f1f] dark:border-[#2d2d2d]"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        添加桌次
                    </button>
                </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-[#1f1f1f] p-6 rounded-xl border border-gray-100 dark:border-[#2d2d2d] shadow-sm">
                    <div className="text-gray-500 text-sm font-medium mb-2">总桌数</div>
                    <div className="text-3xl font-bold">{stats.totalTables}</div>
                    <div className="text-xs text-gray-400 mt-2">当前已安排</div>
                </div>
                <div className="bg-white dark:bg-[#1f1f1f] p-6 rounded-xl border border-gray-100 dark:border-[#2d2d2d] shadow-sm">
                    <div className="text-gray-500 text-sm font-medium mb-2">总宾客数 (Pax)</div>
                    <div className="text-3xl font-bold text-blue-600">{stats.totalPax}</div>
                    <div className="text-xs text-gray-400 mt-2">预计容纳人数</div>
                </div>
                <div className="bg-white dark:bg-[#1f1f1f] p-6 rounded-xl border border-gray-100 dark:border-[#2d2d2d] shadow-sm">
                    <div className="text-gray-500 text-sm font-medium mb-2">分类统计</div>
                    <div className="flex gap-2 text-xs">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">属会: {stats.byCategory['Affiliate'] || 0}</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">社团: {stats.byCategory['Association'] || 0}</span>
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">个人/其他: {(stats.byCategory['Individual'] || 0) + (stats.byCategory['Other'] || 0)}</span>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
                    {error}
                </div>
            )}

            {/* Table Groups (Grouped by Category) */}
            {filteredTables.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-[#1f1f1f]/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-[#2d2d2d]">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">暂无桌次数据。点击“添加桌次”开始安排。</p>
                </div>
            ) : (
                <div className="space-y-10">
                    {/* Helper to group tables */}
                    {(() => {
                        const groups = {
                            [CATEGORY_NAMES.AFFILIATE]: [],
                            [CATEGORY_NAMES.ASSOCIATION]: [],
                            [CATEGORY_NAMES.OTHER]: []
                        };

                        filteredTables.forEach(table => {
                            const groupName = getCategoryGroup(table.category);
                            if (groups[groupName]) {
                                groups[groupName].push(table);
                            } else {
                                // Fallback for safety
                                groups[CATEGORY_NAMES.OTHER].push(table);
                            }
                        });

                        return Object.entries(groups).map(([groupName, groupTables]) => {
                            if (groupTables.length === 0) return null;

                            const styles = getGroupStyles(groupName);

                            return (
                                <div key={groupName} className="animate-fade-in">
                                    <h2 className={`text-lg font-bold mb-4 px-4 py-2 rounded-lg border inline-block ${styles.headerColor}`}>
                                        {groupName} <span className="text-sm opacity-60 ml-2">({groupTables.length} 桌)</span>
                                    </h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                        {groupTables.map(table => (
                                            <TableCard
                                                key={table.id}
                                                table={table}
                                                onUpdate={updateTable}
                                                onEdit={handleEditClick}
                                                onDelete={deleteTable}
                                            />
                                        ))}
                                    </div>
                                    <div className="h-px bg-gray-100 dark:bg-[#2d2d2d] mt-8"></div>
                                </div>
                            );
                        });
                    })()}
                </div>
            )}

            {/* Add/Edit Table Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editMode ? "编辑桌次" : "添加新桌次"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">桌名 / 编号</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border rounded-lg p-2 dark:bg-[#2d2d2d] dark:border-[#3d3d3d]"
                            placeholder="例如: VIP 1"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">类别 (选择或输入)</label>
                            <div className="space-y-2">
                                <select
                                    value={Object.values(CATEGORY_GROUPS).flat().includes(formData.category) ? formData.category : "Custom"}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (val === "Custom") {
                                            setFormData({ ...formData, category: "" }); // Clear for input
                                        } else {
                                            setFormData({ ...formData, category: val });
                                        }
                                    }}
                                    className="w-full border rounded-lg p-2 dark:bg-[#2d2d2d] dark:border-[#3d3d3d] appearance-none"
                                >
                                    {Object.entries(CATEGORY_GROUPS).map(([group, items]) => (
                                        <optgroup key={group} label={group}>
                                            {items.map(item => (
                                                <option key={item} value={item}>{item}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                    <option value="Custom">自定义 / 混合 (Custom/Mixed)...</option>
                                </select>

                                {(!Object.values(CATEGORY_GROUPS).flat().includes(formData.category) || formData.category === "") && (
                                    <input
                                        type="text"
                                        placeholder="输入自定义类别或混合说明..."
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full border rounded-lg p-2 dark:bg-[#2d2d2d] dark:border-[#3d3d3d] bg-gray-50 dark:bg-[#2a2a2a]"
                                    />
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">容纳人数 (Pax)</label>
                            <input
                                type="number"
                                required
                                min="1"
                                max="20"
                                value={formData.pax}
                                onChange={e => setFormData({ ...formData, pax: parseInt(e.target.value) || 0 })}
                                className="w-full border rounded-lg p-2 dark:bg-[#2d2d2d] dark:border-[#3d3d3d]"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            {editMode ? "更新桌次" : "创建桌次"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
