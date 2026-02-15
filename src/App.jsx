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
      setError('El nombre debe ser más largo')
      return
    }
    if (regPass.length < 4) {
      setError('El PIN debe tener 4 dígitos')
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

  // --- AUTH VIEWS ---
  if (!currentUser) {
    return (
      <div className="login-container">
        <div className="bg-mesh"></div>
        <div className="auth-card">
          {isRegistering ? (
            <div className="registration-flow">
              <h1>Crear Perfil</h1>
              <p className="auth-subtitle">Únete a la comunidad Happy Notes</p>

              <div className="form-group">
                <label className="form-label">Nombre de usuario</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Tu nombre aquí..."
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">PIN de seguridad</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    maxLength="4"
                    className="form-input"
                    placeholder="••••"
                    value={regPass}
                    onChange={e => setRegPass(e.target.value)}
                    style={{ letterSpacing: '1rem', textAlign: 'center' }}
                  />
                </div>
              </div>

              {error && <p style={{ color: '#ef4444', marginBottom: '2rem', fontSize: '0.9rem' }}>{error}</p>}

              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setIsRegistering(false); setError(''); }}>Cancelar</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCreateProfile}>Crear Ahora</button>
              </div>
            </div>
          ) : !selectedUser ? (
            <>
              <h1>Happy Notes</h1>
              <p className="auth-subtitle">Selecciona tu perfil o crea uno nuevo</p>

              <div className="profile-scroll">
                {profiles.map(user => (
                  <div key={user.id} className="profile-item" onClick={() => setSelectedUser(user)}>
                    <div className="profile-avatar">{user.avatar}</div>
                    <span className="profile-name">{user.name}</span>
                  </div>
                ))}
                <div className="profile-item btn-add-profile" onClick={() => setIsRegistering(true)}>
                  <div className="profile-avatar" style={{ background: 'transparent', borderStyle: 'dashed' }}>+</div>
                  <span className="profile-name">Añadir</span>
                </div>
              </div>
            </>
          ) : (
            <div className="login-flow">
              <div className="profile-avatar" style={{ width: '120px', height: '120px', fontSize: '3rem', margin: '0 auto 2rem', borderRadius: '40px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
                {selectedUser.avatar}
              </div>
              <h2>Bienvenido, {selectedUser.name}</h2>
              <p className="auth-subtitle" style={{ marginTop: '0.5rem' }}>Introduce tu PIN para acceder</p>

              <div className="pass-dot-container" style={{ marginBottom: '3rem' }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`pass-dot ${password.length >= i ? 'filled' : ''}`}></div>
                ))}
              </div>

              <input
                type="password"
                maxLength="4"
                className="form-input"
                style={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />

              <p style={{ color: '#ef4444', height: '20px', margin: '-2rem 0 2rem', fontSize: '0.9rem' }}>{error}</p>

              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setSelectedUser(null); setPassword(''); setError(''); }}>Cambiar Perfil</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleLogin}>Acceder</button>
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
        <div style={{ padding: '0 1rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.05em' }}>Happy</h2>
          <p style={{ opacity: 0.5, fontWeight: 500, marginTop: '0.5rem' }}>{currentUser.name}</p>
        </div>

        <nav className="nav-group">
          <div className={`nav-link ${view === 'notes' && !isSettingsOpen ? 'active' : ''}`} onClick={() => { setView('notes'); setIsSettingsOpen(false); }}>
            <span className="nav-icon">📌</span> <span>Explorar Notas</span>
          </div>
          <div className={`nav-link ${view === 'calendar' && !isSettingsOpen ? 'active' : ''}`} onClick={() => { setView('calendar'); setIsSettingsOpen(false); }}>
            <span className="nav-icon">📅</span> <span>Mi Calendario</span>
          </div>
          <div className={`nav-link ${isSettingsOpen ? 'active' : ''}`} onClick={() => setIsSettingsOpen(true)}>
            <span className="nav-icon">⚙️</span> <span>Ajustes</span>
          </div>
        </nav>

        <button className="nav-link" style={{ marginTop: 'auto', background: 'none', border: 'none', width: '100%' }} onClick={() => { setCurrentUser(null); setSelectedUser(null); }}>
          <span className="nav-icon">🚪</span> <span>Cerrar Sesión</span>
        </button>
      </aside>

      <main className="content-area">
        {isSettingsOpen ? (
          <div className="settings-view" style={{ animation: 'fadeIn 0.5s' }}>
            <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '4rem' }}>Ajustes</h1>
            <div className="note-card" style={{ maxWidth: '600px' }}>
              <h2 style={{ marginBottom: '2.5rem', fontSize: '1.8rem' }}>Seguridad del Perfil</h2>
              <div className="settings-section">
                <div className="form-group">
                  <label className="form-label">Nuevo PIN de seguridad</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Escribe 4 dígitos..."
                    value={newPassword}
                    maxLength="4"
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>

                <button className="btn btn-primary" style={{ width: '100%', marginBottom: '2rem' }} onClick={() => {
                  if (newPassword.length === 4) {
                    const updated = profiles.map(p => p.id === currentUser.id ? { ...p, password: encrypt(newPassword) } : p)
                    setProfiles(updated)
                    setSettingsStatus('✅ ¡PIN actualizado con éxito!')
                    setNewPassword('')
                    setTimeout(() => setSettingsStatus(''), 4000)
                  } else setSettingsStatus('❌ El PIN debe tener exactamente 4 dígitos')
                }}>Guardar Cambios</button>

                <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '1rem 0' }} />

                <button className="btn btn-secondary" style={{ width: '100%', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }} onClick={() => {
                  if (window.confirm('¿Estás seguro? Esta acción borrará todas tus notas permanentemente.')) {
                    const updated = profiles.filter(p => p.id !== currentUser.id)
                    localStorage.removeItem(`happy-notes-${currentUser.id}`)
                    setProfiles(updated)
                    setCurrentUser(null)
                    setSelectedUser(null)
                  }
                }}>Eliminar este perfil</button>

                {settingsStatus && <p style={{ fontSize: '1rem', marginTop: '1.5rem', textAlign: 'center', fontWeight: 500 }}>{settingsStatus}</p>}
              </div>
            </div>
          </div>
        ) : view === 'notes' ? (
          <div className="notes-view">
            <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '4rem' }}>Mis Notas</h1>
            <div className="notes-grid">
              {notes.map(note => (
                <div key={note.id} className="note-card" onClick={() => { setEditingNote(note.id); setForm(note); setIsModalOpen(true); }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 700 }}>{note.title || 'Inspiración'}</h3>
                    <span style={{ fontSize: '0.9rem', opacity: 0.4, fontWeight: 500 }}>{note.date}</span>
                  </div>
                  <p style={{ lineHeight: 1.8, color: 'var(--text-dim)', fontSize: '1.1rem' }}>{note.content}</p>
                </div>
              ))}
              {notes.length === 0 && (
                <div className="note-card" style={{ borderStyle: 'dashed', opacity: 0.4, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                  <p style={{ fontSize: '1.1rem' }}>Captura hoy tu primera gran idea.</p>
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

      <button className="fab" onClick={() => {
        setEditingNote(null);
        setForm({ title: '', content: '', color: 'default', date: new Date().toISOString().split('T')[0] });
        setIsModalOpen(true);
      }}>+</button>

      {isModalOpen && (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={() => setIsModalOpen(false)}>
          <div className="auth-card" style={{ padding: '3rem', maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '2rem', marginBottom: '2.5rem' }}>{editingNote ? 'Refinar Nota' : 'Nueva Nota'}</h2>

            <div className="form-group">
              <label className="form-label">Título</label>
              <input
                className="form-input"
                placeholder="Dale un nombre a tu idea..."
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fecha</label>
              <input
                type="date"
                className="form-input"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contenido</label>
              <textarea
                className="form-input"
                rows="6"
                placeholder="Escribe libremente..."
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                style={{ resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveNote}>{editingNote ? 'Actualizar' : 'Guardar'}</button>
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
      <div className="calendar-nav" style={{ marginBottom: '5rem' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 800 }}>{monthNames[date.getMonth()]} <span style={{ opacity: 0.3 }}>{date.getFullYear()}</span></h1>
        <div style={{ display: 'flex', gap: '1.5rem', marginLeft: 'auto' }}>
          <button className="nav-btn" onClick={prevMonth}>←</button>
          <button className="nav-btn" onClick={nextMonth}>→</button>
        </div>
      </div>
      <div className="calendar-grid" style={{ gap: '1.5rem' }}>
        {['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'].map(d => (
          <div key={d} style={{ textAlign: 'center', opacity: 0.3, fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.1em' }}>{d}</div>
        ))}
        {grid.map((day, i) => {
          if (!day) return <div key={i}></div>
          const dStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
          const hasNote = notes.some(n => n.date === dStr)
          const isToday = new Date().toDateString() === new Date(date.getFullYear(), date.getMonth(), day).toDateString()
          return (
            <div key={i} className={`calendar-day ${isToday ? 'today' : ''}`} onClick={() => onDayClick(dStr)} style={{ height: 'auto', padding: '1.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{day}</span>
              {hasNote && <div className="note-indicator" style={{ width: '10px', height: '10px' }}></div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App
