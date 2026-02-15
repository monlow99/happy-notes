import { useState, useEffect } from 'react'
import './index.css'

const NOTE_COLORS = [
  { name: 'default', color: 'rgba(139, 92, 246, 0.1)' },
  { name: 'blue', color: 'rgba(59, 130, 246, 0.1)' },
  { name: 'green', color: 'rgba(34, 197, 94, 0.1)' },
  { name: 'pink', color: 'rgba(236, 72, 153, 0.1)' },
  { name: 'orange', color: 'rgba(249, 115, 22, 0.1)' },
]

const USERS = [
  { id: 'user1', name: 'Alex', avatar: 'A' },
  { id: 'user2', name: 'Luna', avatar: 'L' }
]

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [view, setView] = useState('notes') // 'notes' or 'calendar'
  const [notes, setNotes] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [form, setForm] = useState({ title: '', content: '', color: 'default', date: new Date().toISOString().split('T')[0] })

  // Load user data on login
  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`happy-notes-${currentUser.id}`)
      setNotes(saved ? JSON.parse(saved) : [
        { id: 1, title: 'Bienvenido ' + currentUser.name + '! ✨', content: 'Este es tu espacio creativo personal.', date: new Date().toISOString().split('T')[0], color: 'default', pinned: true },
      ])
    }
  }, [currentUser])

  // Save changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`happy-notes-${currentUser.id}`, JSON.stringify(notes))
    }
  }, [notes, currentUser])

  const saveNote = () => {
    if (!form.title.trim() && !form.content.trim()) return

    if (editingNote) {
      setNotes(notes.map(n => n.id === editingNote ? { ...n, ...form } : n))
    } else {
      const note = {
        ...form,
        id: Date.now(),
        pinned: false
      }
      setNotes([note, ...notes])
    }
    setIsModalOpen(false)
  }

  const deleteNote = (id) => {
    if (window.confirm('¿Eliminar esta idea?')) {
      setNotes(notes.filter(n => n.id !== id))
    }
  }

  const togglePin = (id) => {
    setNotes(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n))
  }

  // --- RENDERING VIEWS ---

  if (!currentUser) {
    return (
      <div className="login-container">
        <div className="bg-mesh"></div>
        <div className="login-card">
          <h2>Happy Notes</h2>
          <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>Elige tu perfil para continuar</p>
          <div className="user-selection">
            {USERS.map(user => (
              <div key={user.id} className="user-avatar-btn" onClick={() => setCurrentUser(user)}>
                <div className="avatar">{user.avatar}</div>
                <span style={{ fontWeight: 600 }}>{user.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const sortedNotes = [...notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))

  return (
    <div className="app-layout">
      <div className="bg-mesh"></div>

      <aside className="sidebar">
        <div style={{ padding: '0 1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>😊 Happy</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{currentUser.name}'s Workspace</p>
        </div>

        <nav>
          <div className={`nav-item ${view === 'notes' ? 'active' : ''}`} onClick={() => setView('notes')}>
            📌 Notas
          </div>
          <div className={`nav-item ${view === 'calendar' ? 'active' : ''}`} onClick={() => setView('calendar')}>
            📅 Calendario
          </div>
        </nav>

        <div style={{ marginTop: 'auto' }} className="nav-item" onClick={() => setCurrentUser(null)}>
          🚪 Salir
        </div>
      </aside>

      <main className="content-area">
        {view === 'notes' ? (
          <div className="notes-view">
            <header style={{ marginBottom: '3rem' }}>
              <h1 style={{ fontSize: '3rem' }}>Mis Notas</h1>
            </header>
            <div className="notes-grid">
              {sortedNotes.map(note => (
                <div key={note.id} className={`note-card ${note.pinned ? 'pinned' : ''}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.3rem' }}>{note.title || 'Sin Título'}</h3>
                    <div onClick={() => togglePin(note.id)} style={{ cursor: 'pointer', opacity: note.pinned ? 1 : 0.2 }}>📍</div>
                  </div>
                  <p style={{ flex: 1, color: 'var(--text-dim)', lineHeight: 1.6 }}>{note.content}</p>
                  <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', opacity: 0.4 }}>{note.date}</span>
                    <button onClick={() => deleteNote(note.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <CalendarView notes={notes} />
        )}
      </main>

      <button className="fab" onClick={() => { setEditingNote(null); setForm({ title: '', content: '', color: 'default', date: new Date().toISOString().split('T')[0] }); setIsModalOpen(true); }}>
        +
      </button>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '2rem' }}>Nueva Nota</h2>
            <input
              type="text"
              className="modal-input"
              placeholder="¿En qué piensas?"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
            <input
              type="date"
              className="modal-input"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
            />
            <textarea
              className="modal-textarea"
              rows="5"
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

function CalendarView({ notes }) {
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  return (
    <div className="calendar-view">
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem' }}>Calendario</h1>
        <p style={{ color: 'var(--text-dim)' }}>Octubre 2026</p>
      </header>

      <div className="calendar-grid">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
          <div key={d} className="calendar-day-label">{d}</div>
        ))}
        {days.map(d => {
          const formattedDay = `2026-10-${d.toString().padStart(2, '0')}`
          const hasNotes = notes.some(n => n.date === formattedDay)
          return (
            <div key={d} className={`calendar-day ${d === 15 ? 'today' : ''}`}>
              <span className="day-num">{d}</span>
              {hasNotes && <div className="day-notes-dot"></div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App
