import { useState, useEffect } from 'react'
import './index.css'

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
  const [isShaking, setIsShaking] = useState(false)
  const [view, setView] = useState('notes')
  const [notes, setNotes] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [form, setForm] = useState({ title: '', content: '', color: 'default', date: new Date().toISOString().split('T')[0] })

  const [isRegistering, setIsRegistering] = useState(false)
  const [regName, setRegName] = useState('')
  const [regPass, setRegPass] = useState('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [settingsStatus, setSettingsStatus] = useState('')

  // Calendar State
  const [calDate, setCalDate] = useState(new Date())
  const [selectedCalDay, setSelectedCalDay] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    localStorage.setItem('happy-profiles', JSON.stringify(profiles))
  }, [profiles])

  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`happy-notes-${currentUser.id}`)
      setNotes(saved ? JSON.parse(saved) : [])
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`happy-notes-${currentUser.id}`, JSON.stringify(notes))
    }
  }, [notes, currentUser])

  // Auto-login when 4 digits are entered
  useEffect(() => {
    if (password.length === 4 && selectedUser) {
      handleLogin()
    }
  }, [password])

  const handleCreateProfile = () => {
    if (regName.trim().length < 2) { setError('El nombre es demasiado corto'); return; }
    if (regPass.length < 4) { setError('PIN de 4 dígitos'); return; }
    const newId = regName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
    const newProfile = { id: newId, name: regName.trim(), avatar: regName.trim().charAt(0).toUpperCase(), password: encrypt(regPass) }
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
      setIsShaking(true)
      setError('PIN Incorrecto')
      setPassword('')
      setTimeout(() => setIsShaking(false), 500)
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

  // --- VIEWS ---
  if (!currentUser) {
    return (
      <div className="login-container">
        <div className="bg-mesh"></div>
        <div className={`auth-card ${isShaking ? 'shake' : ''}`}>
          {isRegistering ? (
            <div className="registration-flow">
              <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Crear Perfil</h1>
              <input type="text" className="form-input" style={{ marginBottom: '1.5rem' }} placeholder="Tu nombre..." value={regName} onChange={e => setRegName(e.target.value)} autoFocus />
              <input type="password" maxLength="4" className="form-input" style={{ textAlign: 'center', letterSpacing: '1rem' }} placeholder="PIN" value={regPass} onChange={e => setRegPass(e.target.value)} />
              <p style={{ color: '#ef4444', margin: '1rem 0' }}>{error}</p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsRegistering(false)}>Volver</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCreateProfile}>Crear</button>
              </div>
            </div>
          ) : !selectedUser ? (
            <>
              <h1 style={{ fontSize: '4rem', marginBottom: '1rem', letterSpacing: '-0.05em' }}>Happy</h1>
              <p style={{ color: 'var(--text-dim)', marginBottom: '3rem' }}>Elige tu espacio personal</p>
              <div className="profile-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1.5rem' }}>
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
              <div className="profile-avatar" style={{ width: '100px', height: '100px', fontSize: '2.5rem', margin: '0 auto 2rem', borderRadius: '32px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
                {selectedUser.avatar}
              </div>
              <h2>{selectedUser.name}</h2>
              <div className="pass-dot-container" style={{ margin: '3rem 0' }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`pass-dot ${password.length >= i ? 'filled' : ''} ${error ? 'error' : ''}`}></div>
                ))}
              </div>
              <input type="password" maxLength="4" className="form-input" style={{ opacity: 0, position: 'absolute' }} value={password} onChange={e => setPassword(e.target.value)} autoFocus />
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => { setSelectedUser(null); setPassword(''); setError(''); }}>Volver</button>
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
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '4rem' }}>Happy</h2>
        <nav>
          <div className={`nav-link ${view === 'notes' && !isSettingsOpen ? 'active' : ''}`} onClick={() => { setView('notes'); setIsSettingsOpen(false); }}>📌 Notas</div>
          <div className={`nav-link ${view === 'calendar' && !isSettingsOpen ? 'active' : ''}`} onClick={() => { setView('calendar'); setIsSettingsOpen(false); }}>📅 Calendario</div>
          <div className={`nav-link ${isSettingsOpen ? 'active' : ''}`} onClick={() => setIsSettingsOpen(true)}>⚙️ Ajustes</div>
        </nav>
        <button className="nav-link" style={{ marginTop: 'auto', background: 'none' }} onClick={() => { setCurrentUser(null); setSelectedUser(null); }}>🚪 Salir</button>
      </aside>

      <main className="content-area">
        {isSettingsOpen ? (
          <SettingsView currentUser={currentUser} profiles={profiles} setProfiles={setProfiles} setCurrentUser={setCurrentUser} setSelectedUser={setSelectedUser} />
        ) : view === 'notes' ? (
          <div className="notes-view">
            <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '4rem' }}>Mis Notas</h1>
            <div className="notes-grid">
              {notes.map(note => (
                <div key={note.id} className="note-card" onClick={() => { setEditingNote(note.id); setForm(note); setIsModalOpen(true); }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h3>{note.title || 'Inspiración'}</h3>
                    <span style={{ opacity: 0.3 }}>{note.date}</span>
                  </div>
                  <p style={{ color: 'var(--text-dim)', lineHeight: 1.8 }}>{note.content}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <CalendarView
            date={calDate}
            setDate={setCalDate}
            notes={notes}
            selectedDay={selectedCalDay}
            setSelectedDay={setSelectedCalDay}
            onDayClick={(date) => {
              setForm({ title: '', content: '', color: 'default', date });
              setEditingNote(null);
              setIsModalOpen(true);
            }}
          />
        )}
      </main>

      <button className="fab" onClick={() => { setEditingNote(null); setForm({ title: '', content: '', color: 'default', date: new Date().toISOString().split('T')[0] }); setIsModalOpen(true); }}>+</button>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="auth-card" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '2rem' }}>{editingNote ? 'Editar Nota' : 'Nueva Nota'}</h2>
            <input className="form-input" style={{ marginBottom: '1.5rem' }} placeholder="Título..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <input type="date" className="form-input" style={{ marginBottom: '1.5rem' }} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <textarea className="form-input" style={{ marginBottom: '2rem' }} rows="6" placeholder="Contenido..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveNote}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SettingsView({ currentUser, profiles, setProfiles, setCurrentUser, setSelectedUser }) {
  const [newPass, setNewPass] = useState('')
  const [msg, setMsg] = useState('')

  const handleUpdate = () => {
    if (newPass.length !== 4) { setMsg('PIN debe ser de 4 dígitos'); return; }
    const updated = profiles.map(p => p.id === currentUser.id ? { ...p, password: encrypt(newPass) } : p)
    setProfiles(updated)
    setMsg('✅ Actualizado')
    setNewPass('')
  }

  const handleDelete = () => {
    if (window.confirm('¿Borrar perfil?')) {
      const updated = profiles.filter(p => p.id !== currentUser.id)
      localStorage.removeItem(`happy-notes-${currentUser.id}`)
      setProfiles(updated)
      setCurrentUser(null)
      setSelectedUser(null)
    }
  }

  return (
    <div style={{ maxWidth: '500px' }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '4rem' }}>Ajustes</h1>
      <div className="note-card">
        <h3 style={{ marginBottom: '2rem' }}>Pincode de Seguridad</h3>
        <input type="password" maxLength="4" className="form-input" style={{ marginBottom: '1.5rem' }} placeholder="Nuevo PIN" value={newPass} onChange={e => setNewPass(e.target.value)} />
        {msg && <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>{msg}</p>}
        <button className="btn btn-primary" style={{ width: '100%', marginBottom: '2rem' }} onClick={handleUpdate}>Actualizar</button>
        <button className="btn btn-secondary" style={{ width: '100%', color: '#ef4444' }} onClick={handleDelete}>Eliminar Perfil</button>
      </div>
    </div>
  )
}

function CalendarView({ date, setDate, notes, selectedDay, setSelectedDay, onDayClick }) {
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
  const daysInMonth = (m, y) => new Date(y, m + 1, 0).getDate()
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  const grid = []
  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) grid.push(null)
  for (let d = 1; d <= daysInMonth(date.getMonth(), date.getFullYear()); d++) grid.push(d)

  const dayNotes = notes.filter(n => n.date === selectedDay)

  return (
    <div className="calendar-view">
      <div className="calendar-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '4rem' }}>{monthNames[date.getMonth()]} <span style={{ opacity: 0.2 }}>{date.getFullYear()}</span></h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="nav-btn" onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))}>←</button>
            <button className="nav-btn" onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))}>→</button>
          </div>
        </div>
        <div className="calendar-grid">
          {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map(d => <div key={d} className="calendar-day-header">{d}</div>)}
          {grid.map((d, i) => {
            if (!d) return <div key={i} className="calendar-day empty"></div>
            const dStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
            const hasNote = notes.some(n => n.date === dStr)
            const isToday = new Date().toISOString().split('T')[0] === dStr
            const isSelected = selectedDay === dStr
            return (
              <div key={i} className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`} onClick={() => { setSelectedDay(dStr); onDayClick(dStr); }}>
                {d}
                {hasNote && !isSelected && <div className="day-dot"></div>}
              </div>
            )
          })}
        </div>
      </div>
      <div className="day-detail">
        <h2 style={{ marginBottom: '1.5rem' }}>{selectedDay}</h2>
        {dayNotes.length > 0 ? dayNotes.map(n => (
          <div key={n.id} className="day-note-preview">
            <h4 style={{ marginBottom: '0.5rem' }}>{n.title || 'Sin Título'}</h4>
            <p style={{ fontSize: '0.85rem', opacity: 0.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.content}</p>
          </div>
        )) : <p style={{ opacity: 0.3, textAlign: 'center', marginTop: '2rem' }}>No hay notas para este día</p>}
      </div>
    </div>
  )
}

export default App
