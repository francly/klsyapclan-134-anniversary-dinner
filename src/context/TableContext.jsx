import { createContext, useContext, useState, useEffect } from 'react';

const TableContext = createContext();

export function useTables() {
    return useContext(TableContext);
}

export function TableProvider({ children }) {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial Load
    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const response = await fetch('/api/tables');
            if (!response.ok) {
                // If 500 or 404, we don't want to crash. We check if it's valid JSON.
                const text = await response.text();
                try {
                    const data = JSON.parse(text);
                    setTables(Array.isArray(data) ? data : []);
                } catch {
                    // If API returns HTML (error page), treat as empty
                    console.error("API Error: Response was not JSON", text);
                    setTables([]);
                }
            } else {
                const data = await response.json();
                setTables(data);
            }
        } catch (err) {
            console.error('Failed to fetch tables:', err);
            // Safety: Set empty array so app doesn't crash
            setTables([]);
            setError("Could not load seating data.");
        } finally {
            setLoading(false);
        }
    };

    const addTable = async (tableData) => {
        const newTable = { ...tableData, id: Date.now(), guests: [] };
        const updatedTables = [...tables, newTable];
        setTables(updatedTables); // Optimistic Update

        try {
            await fetch('/api/tables', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTables),
            });
        } catch (err) {
            console.error("Failed to save table:", err);
            // Revert or show alert? For now, we just log.
        }
    };

    const deleteTable = async (tableId) => {
        const updatedTables = tables.filter(t => t.id !== tableId);
        setTables(updatedTables);

        try {
            await fetch('/api/tables', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTables),
            });
        } catch (err) {
            console.error("Failed to delete table:", err);
        }
    };

    // We don't implement updateTable yet for Step 3, just Add/Delete/Fetch

    const value = {
        tables,
        loading,
        error,
        addTable,
        deleteTable,
        refresh: fetchTables
    };

    return (
        <TableContext.Provider value={value}>
            {children}
        </TableContext.Provider>
    );
}
