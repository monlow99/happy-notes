import { useState, useEffect } from 'react'
import './index.css'

const NOTE_COLORS = [
  { name: 'default', color: 'rgba(139, 92, 246, 0.1)' },
  { name: 'blue', color: 'rgba(59, 130, 246, 0.1)' },
  { name: 'green', color: 'rgba(34, 197, 94, 0.1)' },
  { name: 'pink', color: 'rgba(236, 72, 153, 0.1)' },
  { name: 'orange', color: 'rgba(249, 115, 22, 0.1)' },
]

function App() {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('lumina-notes-v2')
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Bienvenido ✨', content: 'Tu espacio creativo para ideas brillantes.', date: new Date().toLocaleDateString(), color: 'default', pinned: true },
      { id: 2, title: 'Organización', content: 'Puedes fijar notas importantes y usar colores para categorizarlas.', date: new Date().toLocaleDateString(), color: 'blue', pinned: false }
    ]
  })

  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [form, setForm] = useState({ title: '', content: '', color: 'default' })

  useEffect(() => {
    localStorage.setItem('lumina-notes-v2', JSON.stringify(notes))
  }, [notes])

  const openAddModal = () => {
    setEditingNote(null)
    setForm({ title: '', content: '', color: 'default' })
    setIsModalOpen(true)
  }

  const openEditModal = (note) => {
    setEditingNote(note.id)
    setForm({ title: note.title, content: note.content, color: note.color || 'default' })
    setIsModalOpen(true)
  }

  const saveNote = () => {
    if (!form.title.trim() && !form.content.trim()) return

    if (editingNote) {
      setNotes(notes.map(n => n.id === editingNote ? { ...n, ...form } : n))
    } else {
      const note = {
        ...form,
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        pinned: false
      }
      setNotes([note, ...notes])
    }
    setIsModalOpen(false)
  }

  const togglePin = (id) => {
    setNotes(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n))
  }

  const deleteNote = (id) => {
    if (window.confirm('¿Eliminar esta nota?')) {
      setNotes(notes.filter(n => n.id !== id))
    }
  }

  const filteredNotes = notes
    .filter(n =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))

  return (
    <div className="app-container">
      <header>
        <div className="header-top">
          <h1>Happy Notes</h1>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
            {notes.length} {notes.length === 1 ? 'nota' : 'notas'}
          </div>
        </div>

        <div className="search-container">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar notas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <main>
        {filteredNotes.length > 0 ? (
          <div className="notes-grid">
            {filteredNotes.map(note => (
              <div
                key={note.id}
                className={`note-card ${note.pinned ? 'pinned' : ''}`}
                style={{ background: `rgba(${NOTE_COLORS.find(c => c.name === note.color)?.color.match(/\d+/g).join(',')}, 0.05)` }}
                onClick={() => openEditModal(note)}
              >
                <div className="note-header">
                  <h3>{note.title || 'Sin título'}</h3>
                  <div
                    className={`pin-icon ${note.pinned ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); togglePin(note.id); }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={note.pinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M21 10V8a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2h14a2 2 0 002-2zM7 6v4M17 6v4M12 12v8M10 20h4"></path>
                    </svg>
                  </div>
                </div>
                <p>{note.content}</p>
                <div className="note-footer">
                  <span className="note-date">{note.date}</span>
                  <div className="actions">
                    <button className="btn-icon delete" onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <p>{search ? 'No se encontraron notas' : 'Captura tu primera idea brillante'}</p>
          </div>
        )}
      </main>

      <button className="fab" onClick={openAddModal}>+</button>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>{editingNote ? 'Editar Nota' : 'Nueva Nota'}</h2>

            <div className="color-selector">
              {NOTE_COLORS.map(c => (
                <div
                  key={c.name}
                  className={`color-dot ${form.color === c.name ? 'active' : ''}`}
                  style={{ background: c.color }}
                  onClick={() => setForm({ ...form, color: c.name })}
                />
              ))}
            </div>

            <input
              type="text"
              className="modal-input"
              placeholder="Título..."
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              autoFocus
            />
            <textarea
              className="modal-textarea"
              rows="6"
              placeholder="Contenido..."
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
            />

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={saveNote}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
