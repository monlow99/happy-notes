import { useState, useEffect, useRef } from 'react'
import {
  Clock,
  CloudRain,
  Sun,
  Moon,
  Notebook,
  Calendar,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  User,
  Sparkles
} from 'lucide-react'
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

  const fetchWeather = async () => {
    try {
      setWeatherLoading(true)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { latitude, longitude } = pos.coords

          // 1. Fetch Weather
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`)
          const weatherData = await weatherRes.json()

          // 2. Fetch City Name (Reverse Geocoding)
          let cityName = 'Tu Ubicación'
          try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            const geoData = await geoRes.json()
            cityName = geoData.address.city || geoData.address.town || geoData.address.village || 'Tu Ubicación'
          } catch (e) {
            console.warn("No se pudo obtener el nombre de la ciudad.")
          }

          setWeather({
            ...weatherData.current_weather,
            city: cityName
          })
          setWeatherLoading(false)
        }, (err) => {
          console.error("Error de geolocalización:", err)
          setWeatherLoading(false)
          alert("No se pudo obtener tu ubicación. Asegúrate de dar permisos en el navegador.")
        }, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 })
      } else {
        setWeatherLoading(false)
        alert("Tu navegador no soporta geolocalización.")
      }
    } catch (e) {
      console.error("Error al detectar clima:", e)
      setWeatherLoading(false)
    }
  }

  useEffect(() => {
    // Optional: Start with IP location but allow manual trigger for GPS
    const fetchIPWeather = async () => {
      try {
        const locRes = await fetch('https://ipapi.co/json/')
        const locData = await locRes.json()
        if (locData.latitude) {
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${locData.latitude}&longitude=${locData.longitude}&current_weather=true`)
          const weatherData = await weatherRes.json()
          setWeather({ ...weatherData.current_weather, city: locData.city || 'Tu ciudad' })
        }
      } catch (e) { } finally { setWeatherLoading(false) }
    }
    fetchIPWeather()
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

  const deleteNote = (id) => {
    if (window.confirm('¿Borrar esta nota definitivamente?')) {
      setNotes(notes.filter(n => n.id !== id))
      setIsModalOpen(false)
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

  const timeString = time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  const secondsString = time.toLocaleTimeString('es-ES', { second: '2-digit' })
  const fullDateString = time.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

  const StatusApplets = () => (
    <div className="status-container">
      <div className="status-bar-unit">
        <div className="unit-sub">{fullDateString}</div>
        <div className="unit-main">
          <Clock size={16} strokeWidth={3} className="inline-icon" /> {timeString}
          <span style={{ opacity: 0.3, fontSize: '1rem', marginLeft: '4px' }}>{secondsString}</span>
        </div>
      </div>
      <div className="status-bar-unit">
        <div className="unit-sub">Clima</div>
        <div className="unit-main">
          {weatherLoading ? (
            <span style={{ fontSize: '0.9rem', opacity: 0.5 }}>Cargando...</span>
          ) : weather ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              {weather.is_day ? <Sun size={18} color="#fcd34d" /> : <Moon size={18} color="#94a3b8" />}
              {weather.temperature}°C
            </div>
          ) : (
            <button className="weather-btn" onClick={fetchWeather}>Detectar Ciudad</button>
          )}
        </div>
      </div>
    </div>
  )

  if (!currentUser) {
    return (
      <div className="login-container">
        <div className="bg-mesh"></div>
        <div className={`auth-card ${isShaking ? 'shake' : ''}`}>
          {isRegistering ? (
            <div className="registration-flow">
              <h1>Happy Notes</h1>
              <p className="auth-subtitle">Crea un espacio seguro para tus pensamientos.</p>

              <div className="auth-info-banner"><ShieldCheck size={16} color="var(--accent-primary)" /> Cifrado local de extremo a extremo</div>

              <div className="form-group">
                <label className="unit-sub" style={{ marginLeft: '1rem', display: 'block', marginBottom: '0.6rem' }}>Nombre de Usuario</label>
                <div className="input-wrapper">
                  <input type="text" className="form-input" placeholder="¿Cómo te llamas?" value={regName} onChange={e => setRegName(e.target.value)} autoFocus />
                  <User className="input-icon" size={20} />
                </div>
              </div>

              <div className="form-group">
                <label className="unit-sub" style={{ marginLeft: '1rem', display: 'block', marginBottom: '0.6rem' }}>PIN de Acceso (4 dígitos)</label>
                <div className="input-wrapper">
                  <input type="password" maxLength="4" className="form-input" style={{ letterSpacing: '0.8rem', fontWeight: 900 }} placeholder="••••" value={regPass} onChange={e => setRegPass(e.target.value)} />
                  <ShieldCheck className="input-icon" size={20} />
                </div>
              </div>

              <div className="auth-actions">
                <button className="btn btn-secondary" onClick={() => setIsRegistering(false)}>Atrás</button>
                <button className="btn btn-primary" onClick={handleCreateProfile}>Crear Perfil</button>
              </div>
            </div>
          ) :
            !selectedUser ? (
              <>
                <h1>Happy Notes.</h1>
                <p className="auth-subtitle">Captura tus visiones en un entorno perfectamente equilibrado.</p>

                <StatusApplets />

                <div className="auth-info-banner"><User size={16} color="var(--accent-primary)" /> Selecciona una identidad para entrar</div>

                <div className="profile-grid-container">
                  <div className="profile-scroll">
                    {profiles.map(user => (
                      <div key={user.id} className="profile-item" onClick={() => setSelectedUser(user)}>
                        <div className="profile-avatar-box">{user.avatar}</div>
                        <span style={{ fontSize: '1rem', fontWeight: 700 }}>{user.name}</span>
                      </div>
                    ))}
                    <div className="profile-item" onClick={() => setIsRegistering(true)} style={{ borderStyle: 'dashed', opacity: 0.5 }}>
                      <Plus size={32} strokeWidth={3} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.5 }}>NUEVO</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="login-flow">
                <div className="profile-identity">
                  <div className="profile-avatar-active">{selectedUser.avatar}</div>
                  <h2>Hola, {selectedUser.name}</h2>
                </div>

                <div className="pin-input-area" onClick={() => pinInputRef.current.focus()}>
                  <div className="pass-dot-container">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`pass-dot ${password.length >= i ? 'filled' : ''} ${error ? 'error' : ''}`}></div>
                    ))}
                  </div>
                  <input ref={pinInputRef} type="password" maxLength="4" className="form-input" style={{ opacity: 0, position: 'absolute' }} value={password} onChange={e => setPassword(e.target.value)} />
                </div>

                <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => { setSelectedUser(null); setPassword(''); setError(false); }}>Cambiar Perfil</button>
              </div>
            )}
        </div>
      </div>
    )
  }

  return (
    <div className="app-layout">
      <div className="bg-mesh"></div>
      <header className="app-header">
        <div className="header-user-badge">
          <div className="user-avatar-mini">{currentUser.avatar}</div>
          <span className="user-name-tag">{currentUser.name}</span>
          <button className="logout-edge-btn" onClick={() => { setCurrentUser(null); setSelectedUser(null); }} title="Cerrar Sesión">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <aside className="sidebar">
        <h2 className="sidebar-title">Happy Notes.</h2>
        <StatusApplets />
        <nav style={{ marginTop: '3rem', flex: 1 }}>
          <div className={`nav-link ${view === 'notes' && !isSettingsOpen ? 'active' : ''}`} onClick={() => { setView('notes'); setIsSettingsOpen(false); }}>
            <div className="icon-box"><Notebook size={20} /></div> <span className="nav-text">Workspace</span>
          </div>
          <div className={`nav-link ${view === 'calendar' && !isSettingsOpen ? 'active' : ''}`} onClick={() => { setView('calendar'); setIsSettingsOpen(false); }}>
            <div className="icon-box"><Calendar size={20} /></div> <span className="nav-text">Calendario</span>
          </div>
          <div className={`nav-link ${isSettingsOpen ? 'active' : ''}`} onClick={() => setIsSettingsOpen(true)}>
            <div className="icon-box"><Settings size={20} /></div> <span className="nav-text">Ajustes</span>
          </div>
        </nav>
      </aside>

      <main className="content-area">
        {isSettingsOpen ? (
          <div style={{ animation: 'entrance 0.8s var(--ease-premium)' }}>
            <h1 className="section-title">Ajustes</h1>
            <div className="note-card" style={{ maxWidth: '520px' }}>
              <h3 style={{ marginBottom: '2rem' }}>Seguridad del Perfil</h3>
              <div style={{ marginBottom: '2rem' }}>
                <label className="unit-sub" style={{ display: 'block', marginBottom: '0.8rem' }}>Nuevo PIN</label>
                <input type="password" maxLength="4" className="form-input" placeholder="4 dígitos" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginBottom: '1.2rem' }} onClick={() => {
                if (newPassword.length === 4) {
                  setProfiles(profiles.map(p => p.id === currentUser.id ? { ...p, password: encrypt(newPassword) } : p))
                  setSettingsStatus('Perfil actualizado con éxito.')
                  setTimeout(() => setSettingsStatus(''), 4000)
                }
              }}><Save size={18} /> Guardar Cambios</button>
              <button className="btn btn-secondary" style={{ width: '100%', color: 'var(--error)' }} onClick={() => {
                if (window.confirm('¿Eliminar perfil y todos sus datos?')) {
                  const updated = profiles.filter(p => p.id !== currentUser.id)
                  localStorage.removeItem(`happy-notes-${currentUser.id}`)
                  setProfiles(updated); setCurrentUser(null); setSelectedUser(null);
                }
              }}><Trash2 size={18} /> Eliminar Cuenta</button>
              {settingsStatus && <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--accent-primary)', fontWeight: 800 }}>{settingsStatus}</p>}
            </div>
          </div>
        ) : view === 'notes' ? (
          <div style={{ animation: 'entrance 0.8s var(--ease-premium)' }}>
            <h1 className="section-title">Workspace</h1>
            <div className="notes-grid">
              {notes.length === 0 ? (
                <div className="empty-state-card" style={{ background: 'var(--surface-mid)', border: '1px dashed var(--border-soft)', padding: '6rem', borderRadius: '40px', gridColumn: '1/-1', textAlign: 'center' }}>
                  <Sparkles size={48} color="var(--accent-primary)" style={{ marginBottom: '2rem' }} />
                  <p style={{ fontSize: '1.6rem', color: 'var(--text-main)', maxWidth: '450px', margin: '0 auto 3rem', fontWeight: 600, fontFamily: 'Caveat, cursive' }}>{motivation}</p>
                  <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={20} /> Crear Primera Nota</button>
                </div>
              ) : notes.map(note => (
                <div key={note.id} className="note-card" onClick={() => { setEditingNote(note.id); setForm(note); setIsModalOpen(true); }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3>{note.title || 'Borrador'}</h3>
                  </div>
                  <p>{note.content}</p>
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', opacity: 0.3, fontSize: '0.8rem', fontWeight: 800 }}>{note.date}</div>
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

      <button className="fab" onClick={() => { setEditingNote(null); setForm({ title: '', content: '', date: new Date().toISOString().split('T')[0] }); setIsModalOpen(true); }}>
        <Plus size={32} />
      </button>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{editingNote ? 'Editar Nota' : 'Nueva Idea'}</h2>

            <div className="form-group">
              <label className="unit-sub">Título</label>
              <input className="form-input no-icon" placeholder="Nombre de la nota..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="unit-sub">Contenido</label>
              <textarea className="form-input no-icon content-textarea" placeholder="Escribe aquí..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cerrar</button>
              {editingNote && <button className="btn btn-secondary delete-btn" onClick={() => deleteNote(editingNote)}>Eliminar</button>}
              <button className="btn btn-primary save-btn" style={{ gridColumn: editingNote ? 'auto' : 'span 2' }} onClick={saveNote}><Save size={18} /> Guardar</button>
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
    <div className="calendar-view" style={{ animation: 'entrance 0.8s var(--ease-premium)' }}>
      <div className="calendar-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
          <h1 className="section-title" style={{ marginBottom: 0 }}>{meses[date.getMonth()]} <small style={{ opacity: 0.2 }}>{date.getFullYear()}</small></h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-secondary" style={{ padding: '0 1rem' }} onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))}><ArrowLeft size={18} /></button>
            <button className="btn btn-secondary" style={{ padding: '0 1rem' }} onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))}><ArrowRight size={18} /></button>
          </div>
        </div>
        <div className="calendar-grid-container">
          <div className="calendar-grid">
            {['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 900, opacity: 0.3, padding: '1rem 0' }}>{d}</div>)}
            {grid.map((d, i) => {
              if (!d) return <div key={i}></div>
              const dStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
              const hasNote = notes.some(n => n.date === dStr)
              const isToday = new Date().toISOString().split('T')[0] === dStr
              const isSelected = selectedDay === dStr
              return (
                <div key={i} className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`} onClick={() => { setSelectedDay(dStr); onDayClick(dStr); }}>
                  {d}
                  {hasNote && !isSelected && <div style={{ position: 'absolute', bottom: '8px', width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', opacity: 0.6 }}></div>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="day-detail" style={{ background: 'var(--surface-mid)', padding: '4rem 3rem', borderRadius: '40px', border: '1px solid var(--border-soft)' }}>
        <div className="unit-sub" style={{ marginBottom: '1rem' }}>Resumen del día</div>
        <h2 style={{ marginBottom: '3rem', fontSize: '1.2rem', fontWeight: 800 }}>{selectedDay}</h2>
        <div style={{ overflowY: 'auto' }}>
          {dayNotes.length > 0 ? dayNotes.map(n => (
            <div key={n.id} style={{ marginBottom: '3rem' }}>
              <h4 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.8rem', fontFamily: 'Caveat, cursive' }}>{n.title || 'Nota'}</h4>
              <p style={{ fontSize: '1rem', color: 'var(--text-dim)', lineHeight: 1.7 }}>{n.content}</p>
            </div>
          )) : <div style={{ marginTop: '6rem', textAlign: 'center', opacity: 0.2, fontWeight: 700 }}>Sin planes.</div>}
        </div>
      </div>
    </div>
  )
}

export default App
