import { useTables } from "../context/TableContext";

export default function SeatingPlan() {
    const { tables, loading, error } = useTables();

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold mb-4">Seating Plan (Beta)</h1>

            <div className="bg-gray-100 p-4 rounded mb-4">
                <p><strong>Status:</strong> {loading ? "Connecting..." : error ? "Error" : "Connected"}</p>
                {error && <p className="text-red-500">{error}</p>}
                <p><strong>Tables Loaded:</strong> {tables.length}</p>
            </div>

            <p className="text-gray-500">Visual layout coming in Step 4.</p>
        </div>
    );
}
