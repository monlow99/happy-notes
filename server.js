import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 🗄️ Database Setup
const dbPath = join(__dirname, 'happy-notes.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Error opening database', err);
    else console.log('Connected to SQLite database');
});

// 🏗️ Initialize Tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    pin TEXT NOT NULL,
    avatar TEXT NOT NULL
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT,
    content TEXT,
    date TEXT,
    pinned BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
});

// 👤 Profiles Routes
app.get('/api/profiles', (req, res) => {
    db.all('SELECT id, name, avatar FROM users', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/profiles', (req, res) => {
    const { id, name, pin, avatar } = req.body;
    const query = 'INSERT INTO users (id, name, pin, avatar) VALUES (?, ?, ?, ?)';
    db.run(query, [id, name, pin, avatar], (err) => {
        if (err) return res.status(500).json({ error: 'El usuario ya existe o error en DB' });
        res.json({ message: 'Perfil creado con éxito' });
    });
});

app.post('/api/login', (req, res) => {
    const { id, pin } = req.body;
    db.get('SELECT * FROM users WHERE id = ? AND pin = ?', [id, pin], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) {
            res.json({ success: true, user: { id: row.id, name: row.name, avatar: row.avatar } });
        } else {
            res.status(401).json({ success: false, message: 'PIN incorrecto' });
        }
    });
});

// 📝 Notes Routes
app.get('/api/notes/:userId', (req, res) => {
    const { userId } = req.params;
    db.all('SELECT * FROM notes WHERE user_id = ? ORDER BY date DESC', [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/notes/:userId/sync', (req, res) => {
    const { userId } = req.params;
    const { notes } = req.body; // Expecting full array for simple sync

    db.serialize(() => {
        db.run('DELETE FROM notes WHERE user_id = ?', [userId], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            const stmt = db.prepare('INSERT INTO notes (id, user_id, title, content, date, pinned) VALUES (?, ?, ?, ?, ?, ?)');
            notes.forEach(note => {
                stmt.run(note.id.toString(), userId, note.title, note.content, note.date, note.pinned ? 1 : 0);
            });
            stmt.finalize();
            res.json({ message: 'Sincronización completada' });
        });
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Happy Notes DB Server running at http://0.0.0.0:${PORT}`);
});
