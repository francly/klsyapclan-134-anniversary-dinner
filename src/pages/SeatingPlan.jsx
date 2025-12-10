import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Users, LayoutGrid, Trash2 } from "lucide-react";
import { useTables } from "../context/TableContext";
import TableCard from "../components/TableCard";
import Modal from "../components/ui/Modal";
import { CATEGORY_GROUPS } from "../data/categories";
import { getCategoryGroup, getGroupStyles, CATEGORY_NAMES } from "../utils/categoryHelpers";

// Batch import data
const IMPORT_DATA = `檳城南陽堂葉氏宗祠	10	1
霹靂太平南陽堂葉氏宗祠	5	2
隆雪南陽葉氏公會	40	3/4/5/6
雪蘭莪沙登、無拉港南陽葉氏宗親會	10	7
森州南陽葉氏宗親聯宗會	10	8
波德申葉氏聯宗會	10	9
馬六甲吳興南陽堂沈葉尤宗祠	2	10
柔佛州葉氏宗親會	10	11
柔南南陽葉氏宗親會	10	12
沙巴州西海岸葉氏宗親會	5	13
沙巴州山打根葉氏宗親會	2	14
沙巴州斗湖葉氏宗親會	10	15
砂拉越美里葉氏	20	16
砂拉越詩巫省南陽葉氏宗親會	5	17
砂拉越泗里街省葉氏公會	2	18
砂拉越南陽葉氏宗親會	10	19
雪州蒲種葉氏公會	10	20
馬來西亞南陽葉氏宗親總會	5	21
雪蘭莪沈氏宗祠	10	22
吉隆玻沈氏宗祠	10	23
馬來西亞尤氏宗親總會	10	24`;

export default function SeatingPlan() {
    const { tables, loading, error, addTable, updateTable, deleteTable } = useTables();
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State for Add/Edit
    const [editMode, setEditMode] = useState(false);
    const [currentTableId, setCurrentTableId] = useState(null);
    const [isMixedMode, setIsMixedMode] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        category: "属会 (Category A)",
        pax: 10,
        tableNumber: null,
        notes: "",
        seats: [] // Array of { category, pax }
    });

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isModalOpen) {
            setEditMode(false);
            setIsMixedMode(false);
            setFormData({
                name: "",
                category: Object.keys(CATEGORY_GROUPS)[0] ? Object.values(CATEGORY_GROUPS)[0][0] : "Affiliate",
                pax: 10,
                tableNumber: null,
                notes: "",
                seats: []
            });
        }
    }, [isModalOpen]);

    // Analytics Logic
    const stats = useMemo(() => {
        const totalTables = tables.length;
        const totalPax = tables.reduce((sum, t) => sum + (parseInt(t.pax) || 0), 0);
        // ... (rest of stats logic same as before, category derivation works on t.category)
        const byCategory = tables.reduce((acc, t) => {
            const cat = t.category || "Unknown";
            let group = "Other";
            if (CATEGORY_GROUPS["属会 (Category A)"]?.includes(cat)) group = "Affiliate";
            else if (CATEGORY_GROUPS["其他社团 (Category B)"]?.includes(cat)) group = "Association";
            else if (CATEGORY_GROUPS["其他 (Others)"]?.includes(cat)) group = "Individual";
            else {
                if (cat.includes("属会") || cat.includes("Affiliate")) group = "Affiliate";
                else if (cat.includes("社团") || cat.includes("Association")) group = "Association"; // Fixed typo
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
        const hasSeats = table.seats && table.seats.length > 0;
        setIsMixedMode(hasSeats);
        setFormData({
            name: table.name,
            category: table.category,
            pax: table.pax,
            tableNumber: table.tableNumber,
            notes: table.notes || "",
            seats: table.seats || []
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return;

        let finalData = { ...formData };

        // Process Mixed Mode Data
        if (isMixedMode && finalData.seats.length > 0) {
            // 1. Calculate Total Pax
            const totalPax = finalData.seats.reduce((sum, s) => sum + (parseInt(s.pax) || 0), 0);
            finalData.pax = totalPax;

            // 2. Determine Primary Category (Largest Pax)
            const primarySeat = [...finalData.seats].sort((a, b) => b.pax - a.pax)[0];
            if (primarySeat) {
                finalData.category = primarySeat.category;
            }
        } else {
            // If switched back to simple, clear seats
            finalData.seats = [];
        }

        if (editMode && currentTableId) {
            await updateTable({
                id: currentTableId,
                ...finalData
            });
        } else {
            const tableNumber = tables.length > 0 ? Math.max(...tables.map(t => t.tableNumber || 0)) + 1 : 1;
            await addTable({
                ...finalData,
                tableNumber: tableNumber,
                region: "Main Hall"
            });
        }
        setIsModalOpen(false);
    };

    // Batch Import Handler
    const handleBatchImport = async () => {
        if (!window.confirm('确定要批量导入22个组织的桌次数据吗？\n\n这将添加24张新桌次。')) return;

        const lines = IMPORT_DATA.trim().split('\n');
        let successCount = 0;

        for (const line of lines) {
            const parts = line.split('\t');
            if (parts.length !== 3) continue;

            const [name, pax, tableNumbers] = parts;
            const paxNum = parseInt(pax) || 2;

            // Handle multiple table numbers (e.g., "3/4/5/6")
            if (tableNumbers.includes('/')) {
                const numbers = tableNumbers.split('/').map(n => parseInt(n.trim()));
                const paxPerTable = Math.floor(paxNum / numbers.length);
                const remainder = paxNum % numbers.length;

                for (let idx = 0; idx < numbers.length; idx++) {
                    await addTable({
                        name: name.trim(),
                        category: name.trim(),
                        pax: paxPerTable + (idx < remainder ? 1 : 0),
                        tableNumber: numbers[idx],
                        region: 'Main Hall',
                        notes: '',
                        seats: []
                    });
                    successCount++;
                }
            } else {
                await addTable({
                    name: name.trim(),
                    category: name.trim(),
                    pax: paxNum,
                    tableNumber: parseInt(tableNumbers.trim()),
                    region: 'Main Hall',
                    notes: '',
                    seats: []
                });
                successCount++;
            }
        }

        alert(`批量导入完成！\n成功添加 ${successCount} 张桌次。`);
    };

    // Clear All Handler (Password Protected)
    const handleClearAll = async () => {
        const password = window.prompt('⚠️ 危险操作！\n\n请输入密码以清除所有桌次数据：');

        if (password !== '1892') {
            if (password !== null) alert('密码错误！');
            return;
        }

        if (!window.confirm('确定要删除所有桌次吗？\n\n此操作不可恢复！')) return;

        let deleteCount = 0;
        for (const table of tables) {
            await deleteTable(table.id);
            deleteCount++;
        }

        alert(`已清除 ${deleteCount} 张桌次。`);
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
                        onClick={handleBatchImport}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        批量导入
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        添加桌次
                    </button>
                    <button
                        onClick={handleClearAll}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <Trash2 className="w-4 h-4" />
                        清除所有
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
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-[#2a2a2a] p-3 rounded-lg">
                            <span className="text-sm font-medium">混合拼桌 (Mixed Table)</span>
                            <button
                                type="button"
                                onClick={() => {
                                    const newMode = !isMixedMode;
                                    setIsMixedMode(newMode);
                                    if (newMode && formData.seats.length === 0) {
                                        // Init with current data if empty
                                        setFormData({
                                            ...formData,
                                            seats: [{ category: formData.category, pax: formData.pax }]
                                        });
                                    }
                                }}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isMixedMode ? 'bg-blue-600' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isMixedMode ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {isMixedMode ? (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium mb-1">席位组合 (自动计算总人数)</label>
                                {(formData.seats || []).map((seat, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <div className="flex-1">
                                            <select
                                                value={Object.values(CATEGORY_GROUPS).flat().includes(seat.category) ? seat.category : "Custom"}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    const newSeats = [...formData.seats];
                                                    newSeats[index] = { ...seat, category: val === "Custom" ? "" : val };
                                                    setFormData({ ...formData, seats: newSeats });
                                                }}
                                                className="w-full border rounded-lg p-2 text-sm dark:bg-[#2d2d2d] dark:border-[#3d3d3d] appearance-none"
                                            >
                                                <option value="" disabled>选择类别</option>
                                                {Object.entries(CATEGORY_GROUPS).map(([group, items]) => (
                                                    <optgroup key={group} label={group}>
                                                        {items.map(item => (
                                                            <option key={item} value={item}>{item}</option>
                                                        ))}
                                                    </optgroup>
                                                ))}
                                                <option value="Custom">自定义 (Custom)...</option>
                                            </select>
                                            {(!Object.values(CATEGORY_GROUPS).flat().includes(seat.category) || seat.category === "") && (
                                                <input
                                                    type="text"
                                                    placeholder="输入类别..."
                                                    value={seat.category}
                                                    onChange={e => {
                                                        const newSeats = [...formData.seats];
                                                        newSeats[index] = { ...seat, category: e.target.value };
                                                        setFormData({ ...formData, seats: newSeats });
                                                    }}
                                                    className="w-full mt-1 border rounded-lg p-2 text-sm dark:bg-[#2d2d2d] dark:border-[#3d3d3d] bg-gray-50 dark:bg-[#2a2a2a]"
                                                />
                                            )}
                                        </div>
                                        <div className="w-20">
                                            <input
                                                type="number"
                                                min="1"
                                                max="20"
                                                value={seat.pax}
                                                onChange={e => {
                                                    const newSeats = [...formData.seats];
                                                    newSeats[index] = { ...seat, pax: parseInt(e.target.value) || 0 };
                                                    setFormData({ ...formData, seats: newSeats });
                                                }}
                                                className="w-full border rounded-lg p-2 text-sm dark:bg-[#2d2d2d] dark:border-[#3d3d3d] text-center"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newSeats = formData.seats.filter((_, i) => i !== index);
                                                setFormData({ ...formData, seats: newSeats });
                                            }}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, seats: [...formData.seats, { category: "", pax: 1 }] })}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                >
                                    <Plus className="w-3 h-3" /> 添加组合
                                </button>
                                <div className="text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                                    总人数: {formData.seats.reduce((sum, s) => sum + (parseInt(s.pax) || 0), 0)} Pax
                                </div>
                            </div>
                        ) : (
                            <>
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
                            </>
                        )}

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
