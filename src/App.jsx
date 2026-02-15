import { useState, useEffect } from 'react'
import './index.css'

const encrypt = (text) => btoa(`salt_${text}_secure`)

const MOTIVACIONES = [
  "¿Qué gran idea tienes hoy?",
  "Captura el momento antes de que se escape.",
  "Escribir es el primer paso para crear.",
  "Tu creatividad no tiene límites.",
  "Pequeñas notas construyen grandes historias.",
  "Empieza hoy algo extraordinario."
]

function App() {
  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem('happy-profiles')
    return saved ? JSON.parse(saved) : []
  })

  const [currentUser, setCurrentUser] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const [view, setView] = useState('notes')
  const [notes, setNotes] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [form, setForm] = useState({ title: '', content: '', date: new Date().toISOString().split('T')[0] })

  const [isRegistering, setIsRegistering] = useState(false)
  const [regName, setRegName] = useState('')
  const [regPass, setRegPass] = useState('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [settingsStatus, setSettingsStatus] = useState('')

  const [calDate, setCalDate] = useState(new Date())
  const [selectedCalDay, setSelectedCalDay] = useState(new Date().toISOString().split('T')[0])
  const [motivation, setMotivation] = useState(MOTIVACIONES[0])

  // --- Clock & Weather State ---
  const [time, setTime] = useState(new Date())
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current_weather=true`)
          const data = await res.json()
          setWeather(data.current_weather)
        } catch (e) { console.error("Error clima:", e) }
      })
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('happy-profiles', JSON.stringify(profiles))
  }, [profiles])

  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`happy-notes-${currentUser.id}`)
      setNotes(saved ? JSON.parse(saved) : [])
      setMotivation(MOTIVACIONES[Math.floor(Math.random() * MOTIVACIONES.length)])
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`happy-notes-${currentUser.id}`, JSON.stringify(notes))
    }
  }, [notes, currentUser])

  useEffect(() => {
    if (password.length === 4 && selectedUser) {
      handleLogin()
    }
  }, [password])

  const handleCreateProfile = () => {
    if (regName.trim().length < 2) return;
    if (regPass.length < 4) return;
    const newId = regName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
    const newProfile = { id: newId, name: regName.trim(), avatar: regName.trim().charAt(0).toUpperCase(), password: encrypt(regPass) }
    setProfiles([...profiles, newProfile])
    setIsRegistering(false)
    setRegName(''); setRegPass(''); setError(false);
    setSelectedUser(newProfile)
  }

  const handleLogin = () => {
    const hashed = encrypt(password)
    if (hashed === selectedUser.password) {
      setCurrentUser(selectedUser)
      setPassword(''); setError(false);
    } else {
      setIsShaking(true); setError(true); setPassword('');
      setTimeout(() => { setIsShaking(false); setError(false); }, 1000)
    }
  }

  const saveNote = () => {
    if (!form.title.trim() && !form.content.trim()) return
    if (editingNote) {
      setNotes(notes.map(n => n.id === editingNote ? { ...n, ...form } : n))
    } else {
      setNotes([{ ...form, id: Date.now(), pinned: false }, ...notes])
    }
    setIsModalOpen(false); setEditingNote(null);
  }

  const timeString = time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStringShort = time.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const fullDateString = time.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

  // --- COMPONENTES UI ---
  const StatusApplets = () => (
    <div className="status-container" style={{ marginTop: '2.5rem' }}>
      <div className="status-bar-unit">
        <div className="unit-sub">{fullDateString}</div>
        <div className="unit-main" style={{ fontSize: '1.5rem', fontFamily: 'monospace' }}>{timeString}</div>
      </div>
      {weather && (
        <div className="status-bar-unit">
          <div className="unit-sub">Estado del Clima</div>
          <div className="unit-main">{weather.temperature}°C <span style={{ opacity: 0.4, fontSize: '0.8rem' }}>{weather.is_day ? '☀️' : '🌙'}</span></div>
        </div>
      )}
    </div>
  )

  if (!currentUser) {
    return (
      <div className="login-container">
        <div className="bg-mesh"></div>
        <div className={`auth-card ${isShaking ? 'shake' : ''}`}>
          {isRegistering ? (
            <div className="registration-flow" style={{ width: '100%' }}>
              <h1>Crear Perfil.</h1>
              <p className="auth-subtitle">Registra tu identidad para comenzar a organizar tus ideas de forma privada.</p>

              <div className="auth-info-banner">
                <span>🛡️</span> Cifrado local de extremo a extremo
              </div>

              <div style={{ textAlign: 'left', marginBottom: '1.25rem', width: '100%' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: '1rem', display: 'block', marginBottom: '0.4rem', fontWeight: 800, textTransform: 'uppercase' }}>Nombre de usuario</label>
                <input type="text" className="form-input" placeholder="Ej. Alex" value={regName} onChange={e => setRegName(e.target.value)} autoFocus />
              </div>

              <div style={{ textAlign: 'left', marginBottom: '3rem', width: '100%' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: '1rem', display: 'block', marginBottom: '0.4rem', fontWeight: 800, textTransform: 'uppercase' }}>PIN de 4 dígitos</label>
                <input type="password" maxLength="4" className="form-input" style={{ textAlign: 'center', letterSpacing: '0.8rem' }} placeholder="••••" value={regPass} onChange={e => setRegPass(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem', width: '100%' }}>
                <button className="btn btn-secondary" onClick={() => setIsRegistering(false)}>Volver</button>
                <button className="btn btn-primary" onClick={handleCreateProfile}>Crear Cuenta</button>
              </div>
            </div>
          ) : !selectedUser ? (
            <>
              <h1>Happy.</h1>
              <p className="auth-subtitle">Tu lugar seguro para capturar visiones, planes y momentos inolvidables.</p>

              <StatusApplets />

              <div className="auth-info-banner">
                <span>👤</span> Selecciona una cuenta para continuar
              </div>

              <div className="profile-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1.5rem', width: '100%', marginBottom: '2rem' }}>
                {profiles.map(user => (
                  <div key={user.id} className="profile-item" onClick={() => setSelectedUser(user)} style={{ cursor: 'pointer', padding: '1.8rem 1rem', borderRadius: '28px', background: 'var(--surface-mid)', border: '1px solid var(--border-soft)', transition: 'var(--transition)' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '0.8rem' }}>{user.avatar}</div>
                    <span style={{ fontSize: '0.9rem', opacity: 0.6, fontWeight: 700 }}>{user.name}</span>
                  </div>
                ))}
                <div className="profile-item" onClick={() => setIsRegistering(true)} style={{ cursor: 'pointer', padding: '1.5rem', borderRadius: '28px', border: '1px dashed var(--border-soft)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                  <div style={{ fontSize: '1.5rem', color: '#fff' }}>+</div>
                </div>
              </div>
            </>
          ) : (
            <div className="login-flow" style={{ width: '100%' }}>
              <div className="profile-identity" style={{ marginBottom: '3rem' }}>
                <div style={{ width: '100px', height: '100px', background: 'var(--accent-gradient)', color: '#fff', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, margin: '0 auto 1.5rem', boxShadow: '0 20px 50px var(--accent-glow)' }}>{selectedUser.avatar}</div>
                <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Bienvenido, {selectedUser.name}</h2>
                <div className="unit-sub" style={{ marginTop: '0.5rem', opacity: 0.5 }}>IDENTIDAD VERIFICADA</div>
              </div>

              <div className="pass-dot-container">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`pass-dot ${password.length >= i ? 'filled' : ''} ${error ? 'error' : ''}`}></div>
                ))}
              </div>

              <input type="password" maxLength="4" className="form-input" style={{ opacity: 0, position: 'absolute' }} value={password} onChange={e => setPassword(e.target.value)} autoFocus />

              <div style={{ width: '100%' }}>
                <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => { setSelectedUser(null); setPassword(''); setError(false); }}>Cambiar Perfil</button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // --- ESTRUCTURA PRINCIPAL APP ---
  return (
    <div className="app-layout">
      <div className="bg-mesh"></div>
      <aside className="sidebar">
        <h2 className="sidebar-title">Happy.</h2>

        <StatusApplets />

        <nav style={{ marginTop: '2rem' }}>
          <div className={`nav-link ${view === 'notes' && !isSettingsOpen ? 'active' : ''}`} onClick={() => { setView('notes'); setIsSettingsOpen(false); }}>
            <div className="icon-box">📓</div> <span className="nav-text">Workspace</span>
          </div>
          <div className={`nav-link ${view === 'calendar' && !isSettingsOpen ? 'active' : ''}`} onClick={() => { setView('calendar'); setIsSettingsOpen(false); }}>
            <div className="icon-box">📅</div> <span className="nav-text">Calendario</span>
          </div>
          <div className={`nav-link ${isSettingsOpen ? 'active' : ''}`} onClick={() => setIsSettingsOpen(true)}>
            <div className="icon-box">⚙️</div> <span className="nav-text">Ajustes</span>
          </div>
        </nav>

        <button className="nav-link" style={{ marginTop: 'auto', background: 'none', border: 'none', width: '100%' }} onClick={() => { setCurrentUser(null); setSelectedUser(null); }}>
          <div className="icon-box">🚪</div> <span className="nav-text">Cerrar Sesión</span>
        </button>
      </aside>

      <main className="content-area">
        {isSettingsOpen ? (
          <div style={{ animation: 'entrance 0.8s var(--ease-soft)' }}>
            <div className="section-header" style={{ marginBottom: '4rem' }}>
              <div className="unit-sub" style={{ marginBottom: '0.5rem' }}>CENTRO DE CONTROL</div>
              <h1 className="section-title">Ajustes.</h1>
              <p style={{ color: 'var(--text-dim)' }}>Gestiona tu privacidad y las credenciales de tu perfil.</p>
            </div>
            <div className="note-card" style={{ maxWidth: '500px', cursor: 'default' }}>
              <h3 style={{ marginBottom: '2.5rem' }}>Seguridad de Acceso</h3>
              <div style={{ marginBottom: '3rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.8rem', fontWeight: 800 }}>NUEVO PIN SECRETO</label>
                <input type="password" maxLength="4" className="form-input" placeholder="4 dígitos" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginBottom: '1.5rem' }} onClick={() => {
                if (newPassword.length === 4) {
                  setProfiles(profiles.map(p => p.id === currentUser.id ? { ...p, password: encrypt(newPassword) } : p))
                  setSettingsStatus(' PIN de seguridad actualizado.')
                  setNewPassword('')
                  setTimeout(() => setSettingsStatus(''), 4000)
                }
              }}>Actualizar Seguridad</button>
              <button className="btn btn-secondary" style={{ width: '100%', color: 'var(--error)' }} onClick={() => {
                if (window.confirm('¿Borrar definitivamente tu perfil y notas? Esta acción no se puede deshacer.')) {
                  const updated = profiles.filter(p => p.id !== currentUser.id)
                  localStorage.removeItem(`happy-notes-${currentUser.id}`)
                  setProfiles(updated)
                  setCurrentUser(null)
                  setSelectedUser(null)
                }
              }}>Eliminar Cuenta</button>
              {settingsStatus && <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--success)', fontWeight: 700 }}>{settingsStatus}</p>}
            </div>
          </div>
        ) : view === 'notes' ? (
          <div style={{ animation: 'entrance 0.8s var(--ease-soft)' }}>
            <div className="section-header" style={{ marginBottom: '4rem' }}>
              <div className="unit-sub" style={{ marginBottom: '0.5rem' }}>TU ESPACIO CREATIVO</div>
              <h1 className="section-title">Notas.</h1>
              <p style={{ color: 'var(--text-dim)' }}>Actualmente tienes {notes.length} ideas documentadas.</p>
            </div>
            <div className="notes-grid">
              {notes.length === 0 ? (
                <div className="empty-state-card" style={{ background: 'var(--surface-mid)', border: '1px dashed var(--border-soft)', padding: '6rem', borderRadius: '40px', gridColumn: '1/-1', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>💎</div>
                  <p style={{ fontSize: '1.5rem', color: 'var(--text-main)', maxWidth: '450px', margin: '0 auto 3rem', fontWeight: 600, lineHeight: 1.4 }}>{motivation}</p>
                  <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Crear Primera Nota</button>
                </div>
              ) : notes.map(note => (
                <div key={note.id} className="note-card" onClick={() => { setEditingNote(note.id); setForm(note); setIsModalOpen(true); }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '1.5rem' }}>{note.title || 'Sin Título'}</h3>
                  </div>
                  <p style={{ fontSize: '1rem', opacity: 0.7 }}>{note.content}</p>
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', opacity: 0.4 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{note.date}</span>
                  </div>
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
              setForm({ title: '', content: '', date });
              setEditingNote(null);
              setIsModalOpen(true);
            }}
          />
        )}
      </main>

      <button className="fab" onClick={() => {
        setEditingNote(null);
        setForm({ title: '', content: '', date: new Date().toISOString().split('T')[0] });
        setIsModalOpen(true);
      }}> + </button>

      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(40px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>
          <div className="auth-card" style={{ maxWidth: '650px', padding: '5rem', display: 'block', textAlign: 'left' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '3.5rem', textAlign: 'center' }}>{editingNote ? 'Refinar Nota.' : 'Nueva Visión.'}</h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem', paddingLeft: '1rem' }}>Identificador</label>
              <input className="form-input" placeholder="¿De qué trata esta idea?" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem', paddingLeft: '1rem' }}>Detalle Expandido</label>
              <textarea className="form-input" rows="8" style={{ resize: 'none' }} placeholder="Escribe aquí con total libertad..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.2rem' }}>
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Descartar</button>
              <button className="btn btn-primary" onClick={saveNote}>Sincronizar Nota</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CalendarView({ date, setDate, notes, selectedDay, setSelectedDay, onDayClick }) {
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
  const daysInMonth = (m, y) => new Date(y, m + 1, 0).getDate()
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  const grid = []
  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) grid.push(null)
  for (let d = 1; d <= daysInMonth(date.getMonth(), date.getFullYear()); d++) grid.push(d)

  const dayNotes = notes.filter(n => n.date === selectedDay)

  return (
    <div className="calendar-view" style={{ animation: 'entrance 0.8s var(--ease-soft)' }}>
      <div className="calendar-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
          <h1 className="section-title">{meses[date.getMonth()]} <span style={{ opacity: 0.15 }}>{date.getFullYear()}</span></h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-secondary" style={{ width: '50px', padding: '0' }} onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))}>←</button>
            <button className="btn btn-secondary" style={{ width: '50px', padding: '0' }} onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))}>→</button>
          </div>
        </div>
        <div className="calendar-grid-container" style={{ padding: '2.5rem', borderRadius: '40px' }}>
          <div className="calendar-grid">
            {['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 900, opacity: 0.25, padding: '1.2rem 0' }}>{d}</div>)}
            {grid.map((d, i) => {
              if (!d) return <div key={i}></div>
              const dStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
              const hasNote = notes.some(n => n.date === dStr)
              const isToday = new Date().toISOString().split('T')[0] === dStr
              const isSelected = selectedDay === dStr
              return (
                <div key={i} className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`} onClick={() => { setSelectedDay(dStr); onDayClick(dStr); }}>
                  {d}
                  {hasNote && !isSelected && <div style={{ position: 'absolute', bottom: '10px', width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', opacity: 0.5 }}></div>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="day-detail" style={{ background: 'var(--surface-mid)', padding: '4rem 3rem', borderRadius: '40px', border: '1px solid var(--border-soft)' }}>
        <h2 style={{ marginBottom: '3rem', fontSize: '0.95rem', opacity: 0.4, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Agenda: {selectedDay}</h2>
        <div style={{ overflowY: 'auto' }}>
          {dayNotes.length > 0 ? dayNotes.map(n => (
            <div key={n.id} style={{ marginBottom: '3rem' }}>
              <h4 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.8rem' }}>{n.title || 'Sin Título'}</h4>
              <p style={{ fontSize: '1rem', color: 'var(--text-dim)', lineHeight: 1.7 }}>{n.content}</p>
            </div>
          )) : <div style={{ marginTop: '6rem', textAlign: 'center', opacity: 0.2, fontWeight: 500 }}>Sin planes registrados.</div>}
        </div>
      </div>
    </div>
  )
}

export default App
