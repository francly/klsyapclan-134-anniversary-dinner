// Batch import script for table data
const API_BASE = process.env.API_BASE || 'http://localhost:3000';

const rawData = `檳城南陽堂葉氏宗祠	10	1
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

function parseData(raw) {
    const lines = raw.trim().split('\n');
    const tables = [];

    for (const line of lines) {
        const parts = line.split('\t');
        if (parts.length !== 3) continue;

        const [name, pax, tableNumbers] = parts;
        const paxNum = parseInt(pax) || 2; // 0 换成 2

        // Handle multiple table numbers (e.g., "3/4/5/6")
        if (tableNumbers.includes('/')) {
            const numbers = tableNumbers.split('/').map(n => parseInt(n.trim()));
            const paxPerTable = Math.floor(paxNum / numbers.length);
            const remainder = paxNum % numbers.length;

            numbers.forEach((tableNum, idx) => {
                tables.push({
                    name: name.trim(),
                    category: name.trim(), // Use organization name as category
                    pax: paxPerTable + (idx < remainder ? 1 : 0),
                    tableNumber: tableNum,
                    region: 'Main Hall',
                    notes: '',
                    seats: []
                });
            });
        } else {
            tables.push({
                name: name.trim(),
                category: name.trim(), // Use organization name as category
                pax: paxNum,
                tableNumber: parseInt(tableNumbers.trim()),
                region: 'Main Hall',
                notes: '',
                seats: []
            });
        }
    }

    return tables;
}

async function importTables() {
    const tables = parseData(rawData);

    console.log(`Parsed ${tables.length} tables from data`);
    console.log('Sample:', JSON.stringify(tables[0], null, 2));

    // Import each table via API
    let successCount = 0;
    let errorCount = 0;

    for (const table of tables) {
        try {
            const response = await fetch(`${API_BASE}/api/tables`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(table)
            });

            if (response.ok) {
                successCount++;
                console.log(`✓ Added: ${table.name} (Table ${table.tableNumber})`);
            } else {
                errorCount++;
                console.error(`✗ Failed: ${table.name} - ${response.statusText}`);
            }
        } catch (error) {
            errorCount++;
            console.error(`✗ Error: ${table.name} - ${error.message}`);
        }
    }

    console.log(`\n=== Import Complete ===`);
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
}

importTables().catch(console.error);
