import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// 📁 Storage Infrastructure
const UPLOADS_DIR = join(__dirname, 'storage');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Allow large attachments

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
    location TEXT,
    pinned BOOLEAN DEFAULT 0,
    category TEXT,
    type TEXT DEFAULT 'note',
    attachment TEXT,
    attachmentName TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`, (err) => {
        if (!err) {
            const columns = [
                { name: "category", type: "TEXT" },
                { name: "location", type: "TEXT" },
                { name: "pinned", type: "BOOLEAN DEFAULT 0" },
                { name: "type", type: "TEXT DEFAULT 'note'" },
                { name: "attachment", type: "TEXT" },
                { name: "attachmentName", type: "TEXT" }
            ];
            columns.forEach(col => {
                db.run(`ALTER TABLE notes ADD COLUMN ${col.name} ${col.type}`, () => { });
            });
        }
    });
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

    // Crear espacio físico para el usuario
    const userSpace = join(UPLOADS_DIR, id);
    if (!fs.existsSync(userSpace)) fs.mkdirSync(userSpace);

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
    db.all('SELECT * FROM notes WHERE user_id = ? ORDER BY pinned DESC, date DESC', [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/notes/:userId/sync', (req, res) => {
    const { userId } = req.params;
    const { notes } = req.body;

    if (!Array.isArray(notes)) return res.status(400).json({ error: 'Invalid notes format' });

    db.serialize(() => {
        db.run('DELETE FROM notes WHERE user_id = ?', [userId], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            const stmt = db.prepare(`
                INSERT INTO notes (
                    id, user_id, title, content, date, location, pinned, category, type, attachment, attachmentName
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            notes.forEach(note => {
                stmt.run(
                    note.id.toString(),
                    userId,
                    note.title || '',
                    note.content || '',
                    note.date || '',
                    note.location || null,
                    note.pinned ? 1 : 0,
                    note.category || 'General',
                    note.type || 'note',
                    note.attachment || null,
                    note.attachmentName || null
                );
            });
            stmt.finalize();
            res.json({ message: 'Sincronización robusta completada' });
        });
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Happy Notes DB Server running at http://0.0.0.0:${PORT}`);
    console.log(`📂 User physical storage initialized at ${UPLOADS_DIR}`);
});
