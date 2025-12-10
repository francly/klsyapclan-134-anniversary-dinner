import { useState, useMemo } from "react";
import { Plus, Search, Users, LayoutGrid } from "lucide-react";
import { useTables } from "../context/TableContext";
import TableCard from "../components/TableCard";
import Modal from "../components/ui/Modal";

export default function SeatingPlan() {
    const { tables, loading, error, addTable, deleteTable } = useTables();
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Table Form State
    const [newTable, setNewTable] = useState({
        name: "",
        category: "Affiliate",
        pax: 10
    });

    // Analytics Logic
    const stats = useMemo(() => {
        const totalTables = tables.length;
        const totalPax = tables.reduce((sum, t) => sum + (parseInt(t.pax) || 0), 0);
        const byCategory = tables.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + 1;
            return acc;
        }, {});
        return { totalTables, totalPax, byCategory };
    }, [tables]);

    // Filter Logic
    const filteredTables = tables.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddTable = async (e) => {
        e.preventDefault();
        if (!newTable.name) return;

        // Auto-generate number if needed (simplified logic)
        const tableNumber = tables.length + 1;

        await addTable({
            ...newTable,
            tableNumber: tableNumber,
            region: "Main Hall" // Default for now
        });

        setIsModalOpen(false);
        setNewTable({ name: "", category: "Affiliate", pax: 10 });
    };

    if (loading) return <div className="p-10 text-center">Loading Seating Data...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <LayoutGrid className="w-8 h-8" />
                        Seating Plan
                    </h1>
                    <p className="text-gray-500 mt-1">Manage guest seating and table arrangements</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search tables..."
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
                        Add Table
                    </button>
                </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-[#1f1f1f] p-6 rounded-xl border border-gray-100 dark:border-[#2d2d2d] shadow-sm">
                    <div className="text-gray-500 text-sm font-medium mb-2">Total Tables</div>
                    <div className="text-3xl font-bold">{stats.totalTables}</div>
                    <div className="text-xs text-gray-400 mt-2">Active tables</div>
                </div>
                <div className="bg-white dark:bg-[#1f1f1f] p-6 rounded-xl border border-gray-100 dark:border-[#2d2d2d] shadow-sm">
                    <div className="text-gray-500 text-sm font-medium mb-2">Total Guests (Pax)</div>
                    <div className="text-3xl font-bold text-blue-600">{stats.totalPax}</div>
                    <div className="text-xs text-gray-400 mt-2">Estimated capacity</div>
                </div>
                <div className="bg-white dark:bg-[#1f1f1f] p-6 rounded-xl border border-gray-100 dark:border-[#2d2d2d] shadow-sm">
                    <div className="text-gray-500 text-sm font-medium mb-2">Breakdown</div>
                    <div className="flex gap-2 text-xs">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Aff: {stats.byCategory['Affiliate'] || 0}</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Assoc: {stats.byCategory['Association'] || 0}</span>
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">Ind: {stats.byCategory['Individual'] || 0}</span>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
                    {error}
                </div>
            )}

            {/* Table Grid */}
            {filteredTables.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-[#1f1f1f]/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-[#2d2d2d]">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No tables found. Click "Add Table" to start.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {filteredTables.map(table => (
                        <TableCard key={table.id} table={table} onDelete={deleteTable} />
                    ))}
                </div>
            )}

            {/* Add Table Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Table">
                <form onSubmit={handleAddTable} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Table Name</label>
                        <input
                            type="text"
                            required
                            value={newTable.name}
                            onChange={e => setNewTable({ ...newTable, name: e.target.value })}
                            className="w-full border rounded-lg p-2 dark:bg-[#2d2d2d] dark:border-[#3d3d3d]"
                            placeholder="e.g. VIP 1"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <select
                                value={newTable.category}
                                onChange={e => setNewTable({ ...newTable, category: e.target.value })}
                                className="w-full border rounded-lg p-2 dark:bg-[#2d2d2d] dark:border-[#3d3d3d]"
                            >
                                <option value="Affiliate">Affiliate</option>
                                <option value="Association">Association</option>
                                <option value="Individual">Individual</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Pax Capacity</label>
                            <input
                                type="number"
                                required
                                min="1"
                                max="20"
                                value={newTable.pax}
                                onChange={e => setNewTable({ ...newTable, pax: parseInt(e.target.value) || 0 })}
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
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            Create Table
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
