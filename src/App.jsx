import { useState, useEffect } from 'react'
import './index.css'

// Simple local "encryption"
const encrypt = (text) => btoa(`salt_${text}_secure`)

function App() {
  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem('happy-profiles')
    return saved ? JSON.parse(saved) : []
  })

  const [currentUser, setCurrentUser] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [view, setView] = useState('notes')
  const [notes, setNotes] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [form, setForm] = useState({ title: '', content: '', color: 'default', date: new Date().toISOString().split('T')[0] })

  // Registration State
  const [isRegistering, setIsRegistering] = useState(false)
  const [regName, setRegName] = useState('')
  const [regPass, setRegPass] = useState('')

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [settingsStatus, setSettingsStatus] = useState('')

  // Calendar State
  const [calDate, setCalDate] = useState(new Date())

  // Save profiles
  useEffect(() => {
    localStorage.setItem('happy-profiles', JSON.stringify(profiles))
  }, [profiles])

  // Load user data on login
  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`happy-notes-${currentUser.id}`)
      setNotes(saved ? JSON.parse(saved) : [])
    }
  }, [currentUser])

  // Save notes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`happy-notes-${currentUser.id}`, JSON.stringify(notes))
    }
  }, [notes, currentUser])

  const handleCreateProfile = () => {
    if (regName.trim().length < 2) {
      setError('El nombre es demasiado corto')
      return
    }
    if (regPass.length < 4) {
      setError('PIN de al menos 4 dígitos')
      return
    }

    const newId = regName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
    const newProfile = {
      id: newId,
      name: regName.trim(),
      avatar: regName.trim().charAt(0).toUpperCase(),
      password: encrypt(regPass)
    }

    setProfiles([...profiles, newProfile])
    setIsRegistering(false)
    setRegName('')
    setRegPass('')
    setError('')
    setSelectedUser(newProfile)
  }

  const handleLogin = () => {
    const hashed = encrypt(password)

    if (hashed === selectedUser.password) {
      setCurrentUser(selectedUser)
      setPassword('')
      setError('')
    } else {
      setError('PIN Incorrecto')
      setPassword('')
    }
  }

  const handleDeleteProfile = () => {
    if (window.confirm('¿Eliminar este perfil y todas sus notas para siempre?')) {
      const updatedProfiles = profiles.filter(p => p.id !== currentUser.id)
      localStorage.removeItem(`happy-notes-${currentUser.id}`)
      localStorage.removeItem(`happy-profiles`) // Will be re-saved by useEffect
      setProfiles(updatedProfiles)
      setCurrentUser(null)
      setSelectedUser(null)
      setIsSettingsOpen(false)
    }
  }

  const saveNote = () => {
    if (!form.title.trim() && !form.content.trim()) return
    if (editingNote) {
      setNotes(notes.map(n => n.id === editingNote ? { ...n, ...form } : n))
    } else {
      setNotes([{ ...form, id: Date.now(), pinned: false }, ...notes])
    }
    setIsModalOpen(false)
    setEditingNote(null)
  }

  // --- LOGIN / REGISTER VIEW ---
  if (!currentUser) {
    return (
      <div className="login-container">
        <div className="bg-mesh"></div>
        <div className="login-card">
          {isRegistering ? (
            <div className="registration-form" style={{ animation: 'slideUp 0.4s ease' }}>
              <h2 style={{ marginBottom: '2rem' }}>Crear Perfil</h2>
              <input
                type="text"
                className="modal-input"
                placeholder="Nombre de Usuario"
                value={regName}
                onChange={e => setRegName(e.target.value)}
              />
              <input
                type="password"
                maxLength="4"
                className="modal-input"
                placeholder="PIN (4 dígitos)"
                value={regPass}
                onChange={e => setRegPass(e.target.value)}
              />
              {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => { setIsRegistering(false); setError(''); }}>Volver</button>
                <button className="btn btn-primary" onClick={handleCreateProfile}>Crear</button>
              </div>
            </div>
          ) : !selectedUser ? (
            <>
              <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>😊 Happy</h1>
              <p style={{ color: 'var(--text-dim)', marginBottom: '3rem' }}>{profiles.length > 0 ? 'Elige tu perfil' : 'Empieza creando un perfil'}</p>

              <div className="user-selection" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {profiles.map(user => (
                  <div key={user.id} className="user-avatar-btn" onClick={() => setSelectedUser(user)}>
                    <div className="avatar" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>{user.avatar}</div>
                    <span style={{ fontSize: '0.9rem' }}>{user.name}</span>
                  </div>
                ))}
                <div className="user-avatar-btn" style={{ borderStyle: 'dashed' }} onClick={() => setIsRegistering(true)}>
                  <div className="avatar" style={{ width: '60px', height: '60px', background: 'transparent', border: '2px dashed var(--glass-border)' }}>+</div>
                  <span style={{ fontSize: '0.9rem' }}>Nuevo</span>
                </div>
              </div>
            </>
          ) : (
            <div className="password-entry">
              <div className="avatar" style={{ margin: '0 auto 2rem', width: '100px', height: '100px', fontSize: '2.5rem' }}>{selectedUser.avatar}</div>
              <h2>Hola, {selectedUser.name}</h2>
              <div className="pass-dot-container">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`pass-dot ${password.length >= i ? 'filled' : ''}`}></div>
                ))}
              </div>
              <input
                type="password"
                maxLength="4"
                className="modal-input"
                style={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <p style={{ color: '#ef4444', height: '20px', margin: '1rem 0' }}>{error}</p>
              <div className="modal-actions" style={{ justifyContent: 'center', gap: '2rem' }}>
                <button className="btn btn-secondary" onClick={() => { setSelectedUser(null); setPassword(''); setError(''); }}>Volver</button>
                <button className="btn btn-primary" onClick={handleLogin}>Entrar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="app-layout">
      <div className="bg-mesh"></div>
      <aside className="sidebar">
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>😊 Happy</h2>
          <p style={{ opacity: 0.5 }}>{currentUser.name}</p>
        </div>
        <nav>
          <div className={`nav-item ${view === 'notes' ? 'active' : ''}`} onClick={() => { setView('notes'); setIsSettingsOpen(false); }}>
            <span>📌</span> <span>Mis Notas</span>
          </div>
          <div className={`nav-item ${view === 'calendar' ? 'active' : ''}`} onClick={() => { setView('calendar'); setIsSettingsOpen(false); }}>
            <span>📅</span> <span>Calendario</span>
          </div>
          <div className={`nav-item ${isSettingsOpen ? 'active' : ''}`} onClick={() => setIsSettingsOpen(true)}>
            <span>⚙️</span> <span>Ajustes</span>
          </div>
        </nav>
        <button className="nav-item" style={{ marginTop: 'auto', background: 'none', border: 'none', width: '100%' }} onClick={() => { setCurrentUser(null); setSelectedUser(null); }}>
          <span>🚪</span> <span>Cerrar sesión</span>
        </button>
      </aside>

      <main className="content-area">
        {isSettingsOpen ? (
          <div className="settings-view" style={{ animation: 'fadeIn 0.5s' }}>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '3rem' }}>Ajustes</h1>
            <div className="note-card" style={{ maxWidth: '500px' }}>
              <h2 style={{ marginBottom: '2rem' }}>Gestión de Perfil</h2>
              <div className="settings-section">
                <div className="settings-input-group">
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Cambiar PIN de seguridad</label>
                  <input
                    type="password"
                    className="modal-input"
                    placeholder="Nuevo PIN (4 dígitos)"
                    value={newPassword}
                    maxLength="4"
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <button className="btn btn-primary" style={{ padding: '0.5rem', fontSize: '0.9rem' }} onClick={() => {
                    if (newPassword.length === 4) {
                      const updated = profiles.map(p => p.id === currentUser.id ? { ...p, password: encrypt(newPassword) } : p)
                      setProfiles(updated)
                      setSettingsStatus('✅ PIN actualizado')
                      setNewPassword('')
                    } else setSettingsStatus('❌ El PIN debe ser de 4 dígitos')
                  }}>Actualizar PIN</button>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '1rem 0' }} />

                <button className="btn btn-secondary" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }} onClick={handleDeleteProfile}>
                  Eliminar Perfil Definitivamente
                </button>

                {settingsStatus && <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>{settingsStatus}</p>}
              </div>
            </div>
          </div>
        ) : view === 'notes' ? (
          <div className="notes-view">
            <h1 style={{ fontSize: '3.5rem', marginBottom: '3rem' }}>Mis Notas</h1>
            <div className="notes-grid">
              {notes.map(note => (
                <div key={note.id} className="note-card" onClick={() => { setEditingNote(note.id); setForm(note); setIsModalOpen(true); }}>
                  <div style={{ display: 'flex', justifySelf: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.4rem' }}>{note.title || 'Idea'}</h3>
                    <span style={{ fontSize: '0.9rem', opacity: 0.3 }}>{note.date}</span>
                  </div>
                  <p style={{ lineHeight: 1.8, color: 'var(--text-dim)' }}>{note.content}</p>
                </div>
              ))}
              {notes.length === 0 && (
                <div className="note-card" style={{ borderStyle: 'dashed', opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p>Aún no tienes notas. ¡Crea la primera!</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <CalendarView
            date={calDate}
            setDate={setCalDate}
            notes={notes}
            onDayClick={(date) => {
              setForm({ title: '', content: '', color: 'default', date });
              setEditingNote(null);
              setIsModalOpen(true);
            }}
          />
        )}
      </main>

      <button className="fab" onClick={() => setIsModalOpen(true)}>+</button>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingNote ? 'Editar Nota' : 'Nueva Nota'}</h2>
            <input
              className="modal-input"
              placeholder="Título..."
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
              rows="6"
              placeholder="Escribe aquí..."
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

function CalendarView({ date, setDate, notes, onDayClick }) {
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
  const daysInMonth = (m, y) => new Date(y, m + 1, 0).getDate()
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  const prevMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))
  const nextMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))
  const grid = []
  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) grid.push(null)
  for (let d = 1; d <= daysInMonth(date.getMonth(), date.getFullYear()); d++) grid.push(d)

  return (
    <div className="calendar-view">
      <div className="calendar-nav">
        <h1 style={{ fontSize: '3.5rem' }}>{monthNames[date.getMonth()]} {date.getFullYear()}</h1>
        <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
          <button className="nav-btn" onClick={prevMonth}>←</button>
          <button className="nav-btn" onClick={nextMonth}>→</button>
        </div>
      </div>
      <div className="calendar-grid">
        {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map(d => (
          <div key={d} style={{ textAlign: 'center', opacity: 0.3, marginBottom: '1rem' }}>{d}</div>
        ))}
        {grid.map((day, i) => {
          if (!day) return <div key={i}></div>
          const dStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
          const hasNote = notes.some(n => n.date === dStr)
          const isToday = new Date().toDateString() === new Date(date.getFullYear(), date.getMonth(), day).toDateString()
          return (
            <div key={i} className={`calendar-day ${isToday ? 'today' : ''}`} onClick={() => onDayClick(dStr)}>
              <span style={{ fontWeight: 600 }}>{day}</span>
              {hasNote && <div className="note-indicator"></div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App
