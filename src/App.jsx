import { useState, useEffect, useRef } from 'react'
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
  const [weatherLoading, setWeatherLoading] = useState(true)

  const pinInputRef = useRef(null)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Weather fetch based on location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current_weather=true`)
          const data = await res.json()
          setWeather(data.current_weather)
          setWeatherLoading(false)
        } catch (e) {
          console.error("Clima error:", e)
          setWeatherLoading(false)
        }
      }, () => setWeatherLoading(false))
    } else {
      setWeatherLoading(false)
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

  // Focus input when selecting a user or clicking the dots
  useEffect(() => {
    if (selectedUser && pinInputRef.current) {
      pinInputRef.current.focus()
    }
  }, [selectedUser])

  const handleCreateProfile = () => {
    if (regName.trim().length < 2 || regPass.length < 4) return;
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
  const fullDateString = time.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

  // --- REUSABLE COMPONENTS ---
  const StatusApplets = () => (
    <div className="status-container">
      <div className="status-bar-unit">
        <div className="unit-sub">{fullDateString}</div>
        <div className="unit-main" style={{ fontFamily: 'monospace' }}>{timeString}</div>
      </div>
      {(weather || weatherLoading) ? (
        <div className="status-bar-unit">
          <div className="unit-sub">Clima Local</div>
          <div className="unit-main">
            {weatherLoading ? "Buscando..." : `${weather.temperature}°C`}
            {weather && <span style={{ marginLeft: '10px', opacity: 0.6 }}>{weather.is_day ? '☀️' : '🌙'}</span>}
          </div>
        </div>
      ) : null}
    </div>
  )

  if (!currentUser) {
    return (
      <div className="login-container">
        <div className="bg-mesh"></div>
        <div className={`auth-card ${isShaking ? 'shake' : ''}`}>
          {isRegistering ? (
            <div className="registration-flow" style={{ width: '100%' }}>
              <h1>Nuevo Perfil.</h1>
              <p className="auth-subtitle">Define tu identidad digital para comenzar.</p>

              <div className="auth-info-banner"><span>🛡️</span> Cifrado local activo</div>

              <div style={{ textAlign: 'left', marginBottom: '1.5rem', width: '100%' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: '1.2rem', display: 'block', marginBottom: '0.6rem', fontWeight: 800 }}>NOMBRE DE USUARIO</label>
                <input type="text" className="form-input" placeholder="Nombre..." value={regName} onChange={e => setRegName(e.target.value)} autoFocus />
              </div>

              <div style={{ textAlign: 'left', marginBottom: '3.5rem', width: '100%' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: '1.2rem', display: 'block', marginBottom: '0.6rem', fontWeight: 800 }}>PIN SECRETO (4 DÍGITOS)</label>
                <input type="password" maxLength="4" className="form-input" style={{ textAlign: 'center', letterSpacing: '0.8rem' }} placeholder="••••" value={regPass} onChange={e => setRegPass(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
                <button className="btn btn-secondary" onClick={() => setIsRegistering(false)}>Atrás</button>
                <button className="btn btn-primary" onClick={handleCreateProfile}>Crear</button>
              </div>
            </div>
          ) : !selectedUser ? (
            <>
              <h1>Happy.</h1>
              <p className="auth-subtitle">Captura tus visiones en un entorno perfectamente equilibrado.</p>

              <StatusApplets />

              <div className="auth-info-banner"><span>👤</span> Selecciona una identidad para entrar</div>

              <div className="profile-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1.5rem', width: '100%' }}>
                {profiles.map(user => (
                  <div key={user.id} className="profile-item" onClick={() => setSelectedUser(user)} style={{ cursor: 'pointer', padding: '2rem 1rem', borderRadius: '32px', background: 'var(--surface-mid)', border: '1px solid var(--border-soft)', transition: 'var(--transition)' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '1rem' }}>{user.avatar}</div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>{user.name}</span>
                  </div>
                ))}
                <div className="profile-item" onClick={() => setIsRegistering(true)} style={{ cursor: 'pointer', padding: '2rem 1rem', borderRadius: '32px', border: '1px dashed var(--border-soft)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                  <div style={{ fontSize: '1.5rem' }}>+</div>
                </div>
              </div>
            </>
          ) : (
            <div className="login-flow" style={{ width: '100%' }}>
              <div className="profile-identity" style={{ marginBottom: '3.5rem' }}>
                <div style={{ width: '110px', height: '110px', background: 'var(--accent-gradient)', color: '#fff', borderRadius: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 800, margin: '0 auto 1.5rem', boxShadow: '0 25px 60px var(--accent-glow)' }}>{selectedUser.avatar}</div>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>{selectedUser.name}</h2>
                <p style={{ opacity: 0.4, fontSize: '0.9rem', marginTop: '0.5rem' }}>Por favor, introduce tu código PIN</p>
              </div>

              <div className="pin-input-area" onClick={() => pinInputRef.current.focus()}>
                <div className="pass-dot-container">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`pass-dot ${password.length >= i ? 'filled' : ''} ${error ? 'error' : ''}`}></div>
                  ))}
                </div>
                <input ref={pinInputRef} type="password" maxLength="4" className="form-input" style={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }} value={password} onChange={e => setPassword(e.target.value)} />
              </div>

              <button className="btn btn-secondary" style={{ width: '100%', marginTop: '4rem' }} onClick={() => { setSelectedUser(null); setPassword(''); setError(false); }}>Cambiar Perfil</button>
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
        <h2 className="sidebar-title">Happy.</h2>
        <StatusApplets />
        <nav style={{ marginTop: '3rem', flex: 1 }}>
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
        <button className="nav-link" style={{ background: 'none', border: 'none', width: '100%', marginBottom: '1rem' }} onClick={() => { setCurrentUser(null); setSelectedUser(null); }}>
          <div className="icon-box">🚪</div> <span className="nav-text">Salir</span>
        </button>
      </aside>

      <main className="content-area">
        {isSettingsOpen ? (
          <div style={{ animation: 'entrance 0.8s var(--ease-soft)' }}>
            <h1 className="section-title">Ajustes.</h1>
            <div className="note-card" style={{ maxWidth: '520px', cursor: 'default' }}>
              <h3 style={{ marginBottom: '2.5rem' }}>Perfil de Seguridad</h3>
              <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>Actualiza tu PIN para mantener tus notas protegidas.</p>
              <input type="password" maxLength="4" className="form-input" placeholder="Nuevo PIN de 4 dígitos" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '2.5rem', marginBottom: '1.2rem' }} onClick={() => {
                if (newPassword.length === 4) {
                  setProfiles(profiles.map(p => p.id === currentUser.id ? { ...p, password: encrypt(newPassword) } : p))
                  setSettingsStatus('✓ PIN Actualizado.')
                  setNewPassword('')
                  setTimeout(() => setSettingsStatus(''), 4000)
                }
              }}>Guardar PIN</button>
              <button className="btn btn-secondary" style={{ width: '100%', color: 'var(--error)' }} onClick={() => {
                if (window.confirm('¿Borrar perfil?')) {
                  const updated = profiles.filter(p => p.id !== currentUser.id)
                  localStorage.removeItem(`happy-notes-${currentUser.id}`)
                  setProfiles(updated)
                  setCurrentUser(null)
                  setSelectedUser(null)
                }
              }}>Eliminar Cuenta</button>
              {settingsStatus && <p style={{ marginTop: '1.5rem', textAlign: 'center', fontWeight: 600, color: 'var(--success)' }}>{settingsStatus}</p>}
            </div>
          </div>
        ) : view === 'notes' ? (
          <div style={{ animation: 'entrance 0.8s var(--ease-soft)' }}>
            <h1 className="section-title">Workspace.</h1>
            <div className="notes-grid">
              {notes.length === 0 ? (
                <div className="empty-state-card" style={{ background: 'var(--surface-mid)', border: '1px dashed var(--border-soft)', padding: '7rem 4rem', borderRadius: '48px', gridColumn: '1/-1', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '2rem' }}>🪐</div>
                  <p style={{ fontSize: '1.6rem', color: 'var(--text-main)', maxWidth: '480px', margin: '0 auto 3.5rem', fontWeight: 600, lineHeight: 1.4 }}>{motivation}</p>
                  <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Comenzar a Crear</button>
                </div>
              ) : notes.map(note => (
                <div key={note.id} className="note-card" onClick={() => { setEditingNote(note.id); setForm(note); setIsModalOpen(true); }}>
                  <h3>{note.title || 'Draft'}</h3>
                  <p style={{ marginTop: '1.2rem', opacity: 0.75, lineHeight: 1.7 }}>{note.content}</p>
                  <div style={{ marginTop: 'auto', textAlign: 'right', opacity: 0.3, fontSize: '0.85rem', fontWeight: 800 }}>{note.date}</div>
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

      <button className="fab" onClick={() => { setEditingNote(null); setForm({ title: '', content: '', date: new Date().toISOString().split('T')[0] }); setIsModalOpen(true); }}> + </button>

      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(50px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>
          <div className="auth-card" style={{ maxWidth: '680px', padding: '5rem', display: 'block', textAlign: 'left' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '2.2rem', textAlign: 'center', marginBottom: '3.5rem', fontWeight: 800 }}>{editingNote ? 'Refinar Idea.' : 'Nueva Visión.'}</h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem', paddingLeft: '1.2rem' }}>Título</label>
              <input className="form-input" placeholder="Nombre..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem', paddingLeft: '1.2rem' }}>Detalle</label>
              <textarea className="form-input" rows="8" style={{ resize: 'none' }} placeholder="Escribe aquí..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.2rem' }}>
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Descartar</button>
              <button className="btn btn-primary" onClick={saveNote}>Guardar Cambios</button>
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
    <div className="calendar-view">
      <div className="calendar-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4.5rem' }}>
          <h1 className="section-title">{meses[date.getMonth()]} <span style={{ opacity: 0.15 }}>{date.getFullYear()}</span></h1>
          <div style={{ display: 'flex', gap: '1.2rem' }}>
            <button className="btn btn-secondary" style={{ width: '55px', padding: '0' }} onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))}>←</button>
            <button className="btn btn-secondary" style={{ width: '55px', padding: '0' }} onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))}>→</button>
          </div>
        </div>
        <div className="calendar-grid-container">
          <div className="calendar-grid">
            {['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 900, opacity: 0.25, padding: '1.2rem 0' }}>{d}</div>)}
            {grid.map((d, i) => {
              if (!d) return <div key={i}></div>
              const dStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
              const hasNote = notes.some(n => n.date === dStr)
              const isToday = new Date().toISOString().split('T')[0] === dStr
              const isSelected = selectedDay === dStr
              return (
                <div key={i} className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`} onClick={() => { setSelectedDay(dStr); onDayClick(dStr); }}>
                  {d}
                  {hasNote && !isSelected && <div className="day-indicator"></div>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="day-detail" style={{ background: 'var(--surface-mid)', padding: '4rem 3rem', borderRadius: '44px', border: '1px solid var(--border-soft)' }}>
        <h2 style={{ marginBottom: '3.5rem', fontSize: '0.95rem', opacity: 0.4, fontWeight: 800, letterSpacing: '0.12em' }}>AGENDA: {selectedDay}</h2>
        <div style={{ overflowY: 'auto' }}>
          {dayNotes.length > 0 ? dayNotes.map(n => (
            <div key={n.id} style={{ marginBottom: '3rem' }}>
              <h4 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.8rem' }}>{n.title || 'Idea'}</h4>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-dim)', lineHeight: 1.7 }}>{n.content}</p>
            </div>
          )) : <div style={{ marginTop: '6rem', textAlign: 'center', opacity: 0.25, fontWeight: 600 }}>Sin eventos.</div>}
        </div>
      </div>
    </div>
  )
}

export default App
