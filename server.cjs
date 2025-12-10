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
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Data (Fallback)
const initialProgramData = [ /* ... existing program data ... */];

const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

// API Routes - Program
app.get('/api/program', (req, res) => {
    /* ... existing program get logic ... */
    if (fs.existsSync(DATA_FILE)) {
        try {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            res.json(JSON.parse(data));
        } catch (err) {
            console.error('Error reading data file:', err);
            res.status(500).json({ error: 'Failed to read data' });
        }
    } else {
        res.json(initialProgramData);
    }
});

app.post('/api/program', (req, res) => {
    /* ... existing program post logic ... */
    try {
        const newData = req.body;
        fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2));
        res.json({ success: true, message: 'Data saved successfully' });
    } catch (err) {
        console.error('Error writing data file:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// API Routes - Tasks
app.get('/api/tasks', (req, res) => {
    if (fs.existsSync(TASKS_FILE)) {
        try {
            const data = fs.readFileSync(TASKS_FILE, 'utf8');
            res.json(JSON.parse(data));
        } catch (err) {
            console.error('Error reading tasks file:', err);
            res.status(500).json({ error: 'Failed to read tasks' });
        }
    } else {
        // Return empty array if no file exists
        res.json([]);
    }
});

app.post('/api/tasks', (req, res) => {
    try {
        const newTasks = req.body;
        // Verify it's an array
        if (!Array.isArray(newTasks)) {
            return res.status(400).json({ error: 'Tasks must be an array' });
        }
        fs.writeFileSync(TASKS_FILE, JSON.stringify(newTasks, null, 2));
        res.json({ success: true, message: 'Tasks saved successfully' });
    } catch (err) {
        console.error('Error writing tasks file:', err);
        res.status(500).json({ error: 'Failed to save tasks' });
    }
});

// API Routes - Tables
app.get('/api/tables', (req, res) => {
    if (fs.existsSync(TABLES_FILE)) {
        try {
            const data = fs.readFileSync(TABLES_FILE, 'utf8');
            if (!data.trim()) {
                return res.json([]);
            }
            res.json(JSON.parse(data));
        } catch (err) {
            console.error('Error reading tables file:', err);
            // Recover from corrupt file by returning empty array
            res.json([]);
        }
    } else {
        res.json([]);
    }
});

app.post('/api/tables', (req, res) => {
    try {
        const newTables = req.body;
        if (!Array.isArray(newTables)) {
            return res.status(400).json({ error: 'Tables must be an array' });
        }
        fs.writeFileSync(TABLES_FILE, JSON.stringify(newTables, null, 2));
        res.json({ success: true, message: 'Tables saved successfully' });
    } catch (err) {
        console.error('Error writing tables file:', err);
        res.status(500).json({ error: 'Failed to save tables' });
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
