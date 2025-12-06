const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'program.json');

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Data (Fallback)
const initialProgramData = [
    {
        date: "2024-12-15",
        events: [
            { time: "18:00", title: "嘉宾签到 / 交流", subtitle: "Arrival of Guests / Cocktail Reception" },
            { time: "19:00", title: "晚宴开始", subtitle: "Banquet Begins" },
            { time: "19:15", title: "迎宾舞", subtitle: "Welcome Dance" },
            { time: "19:20", title: "大会主席致词", subtitle: "Speech by Organizing Chairman", subtitleHighlight: true },
            { time: "19:30", title: "叶氏宗祠主席致词", subtitle: "Speech by Clan President", subtitleHighlight: true },
            { time: "19:40", title: "鸣锣 / 剪彩 / 联合亮灯仪式", subtitle: "Ribbon Cutting / Lighting Ceremony", highlight: true },
            { time: "20:00", title: "余兴节目", subtitle: "Performance" },
            { time: "20:30", title: "切蛋糕 / 敬酒仪式", subtitle: "Cake Cutting / Toasting Ceremony", highlight: true },
            { time: "20:45", title: "纪念品赠送仪式", subtitle: "Souvenir Presentation" },
            { time: "21:30", title: "幸运抽奖", subtitle: "Lucky Draw" },
            { time: "22:00", title: "晚宴结束 / 大合照", subtitle: "End of Banquet / Group Photo" },
        ],
    },
];

// API Routes
app.get('/api/program', (req, res) => {
    if (fs.existsSync(DATA_FILE)) {
        try {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            res.json(JSON.parse(data));
        } catch (err) {
            console.error('Error reading data file:', err);
            res.status(500).json({ error: 'Failed to read data' });
        }
    } else {
        // Return default data if no file exists
        res.json(initialProgramData);
    }
});

app.post('/api/program', (req, res) => {
    try {
        const newData = req.body;
        fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2));
        res.json({ success: true, message: 'Data saved successfully' });
    } catch (err) {
        console.error('Error writing data file:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// Serve Static Assets (Production)
// In development, Vite handles this. This server is primarily for the compiled container.
if (process.env.NODE_ENV === 'production' || process.argv.includes('--production')) {
    app.use(express.static(path.join(__dirname, 'dist')));

    app.use((req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Data directory: ${DATA_DIR}`);
});
