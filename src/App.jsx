import { useState, useEffect, useRef } from 'react'
import * as XLSX from 'xlsx'
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
  Sparkles,
  MapPin,
  Pin,
  Tag,
  Download,
  FileText,
  Share2
} from 'lucide-react'
import './index.css'

const encrypt = (text) => btoa(`salt_${text}_secure`)
const API_URL = `http://${window.location.hostname}:3001`

const MOTIVACIONES = [
  "Captura el momento, diseña el futuro.",
  "Tus ideas son la semilla del éxito.",
  "Escribir es la pintura de la voz.",
  "Organiza tu mente, libera tu genio.",
  "Cada nota es un paso hacia tu gran meta."
]

const THEMES = [
  { id: 'theme-slate', name: 'Slate Emerald', color: '#10b981', isDark: true },
  { id: 'theme-light', name: 'Snow Emerald', color: '#10b981', isDark: false },
  { id: 'theme-midnight', name: 'Midnight Pro', color: '#3b82f6', isDark: true },
  { id: 'theme-sunset', name: 'Sunset Amber', color: '#f59e0b', isDark: true },
  { id: 'theme-neon', name: 'Neon Cyber', color: '#bef264', isDark: true },
  { id: 'theme-lavender', name: 'Lavender Mist', color: '#a855f7', isDark: false }
]

function App() {
  const [profiles, setProfiles] = useState([])

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('happy-session');
    return saved ? JSON.parse(saved) : null;
  })
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

  const [isLoginID, setIsLoginID] = useState(false)
  const [loginIdInput, setLoginIdInput] = useState('')

  // --- New Features State ---
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('happy-theme') || 'theme-slate'
  })
  const [activeCategory, setActiveCategory] = useState('Todas')
  const [categories, setCategories] = useState(['General', 'Trabajo', 'Personal', 'Ideas'])
  const [isPrintingReport, setIsPrintingReport] = useState(false)
  const [uiScale, setUiScale] = useState(() => parseFloat(localStorage.getItem('happy-ui-scale')) || 1)

  // --- Clock & Weather State ---
  const [time, setTime] = useState(new Date())
  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(true)

  const pinInputRef = useRef(null)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    // Device detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) document.body.classList.add('is-mobile');
    else document.body.classList.add('is-desktop');

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    THEMES.forEach(t => document.body.classList.remove(t.id));
    document.body.classList.add(activeTheme);
    localStorage.setItem('happy-theme', activeTheme);
  }, [activeTheme])

  useEffect(() => {
    document.documentElement.style.setProperty('--ui-scale', uiScale);
    localStorage.setItem('happy-ui-scale', uiScale);
  }, [uiScale])

  useEffect(() => {
    if (isPrintingReport) {
      document.body.classList.add('printing-report');
    } else {
      document.body.classList.remove('printing-report');
    }
  }, [isPrintingReport])

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
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
              headers: { 'User-Agent': 'HappyNotes/1.0' }
            })
            const geoData = await geoRes.json()
            const addr = geoData.address
            cityName = addr.city || addr.town || addr.village || addr.suburb || addr.hamlet || addr.municipality || 'Tu Ubicación'
          } catch (e) {
            console.warn("No se pudo obtener el nombre de la ciudad.")
          }

          setWeather({
            ...weatherData.current_weather,
            city: cityName,
            lat: latitude,
            lon: longitude
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
          setWeather({
            ...weatherData.current_weather,
            city: locData.city || locData.region || 'Tu ciudad',
            lat: locData.latitude,
            lon: locData.longitude
          })
        }
      } catch (e) { } finally { setWeatherLoading(false) }
    }
    fetchIPWeather()
  }, [])

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await fetch(`${API_URL}/api/profiles`);
        const data = await res.json();
        setProfiles(data);
      } catch (e) { console.error("Error cargando perfiles:", e); }
    }
    fetchProfiles();
  }, [])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('happy-session', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('happy-session');
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser) {
      const fetchNotes = async () => {
        try {
          const res = await fetch(`${API_URL}/api/notes/${currentUser.id}`);
          const data = await res.json();

          // Comparación simple para evitar ciclos de actualización infinitos
          if (JSON.stringify(data) !== JSON.stringify(notes)) {
            setNotes(data);
          }
          if (!motivation) setMotivation(MOTIVACIONES[Math.floor(Math.random() * MOTIVACIONES.length)]);
        } catch (e) { console.error("Error cargando notas:", e); }
      }

      fetchNotes(); // Carga inicial
      const interval = setInterval(fetchNotes, 5000); // Polling cada 5 segundos
      return () => clearInterval(interval);
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser) {
      const syncNotes = async () => {
        try {
          await fetch(`${API_URL}/api/notes/${currentUser.id}/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes })
          });
        } catch (e) { console.error("Error sincronizando notas:", e); }
      }
      const timer = setTimeout(syncNotes, 1000); // Debounce sync
      return () => clearTimeout(timer);
    }
  }, [notes, currentUser])

  useEffect(() => {
    if (password.length === 4 && (selectedUser || isLoginID)) {
      handleLogin()
    }
  }, [password])

  useEffect(() => {
    if (selectedUser && pinInputRef.current) {
      pinInputRef.current.focus()
    }
  }, [selectedUser])

  const handleCreateProfile = async () => {
    if (regName.trim().length < 2 || regPass.length < 4) return;

    // Simplificamos el ID: solo el nombre en minúsculas y sin espacios
    const newId = regName.trim().toLowerCase().replace(/\s+/g, '')

    // Verificar si ya existe un perfil con ese nombre en la lista actual
    if (profiles.some(p => p.id === newId)) {
      alert("Este nombre de usuario ya está en uso. Por favor, elige otro.");
      return;
    }

    const newProfile = {
      id: newId,
      name: regName.trim(),
      avatar: regName.trim().charAt(0).toUpperCase(),
      pin: encrypt(regPass)
    }

    try {
      const res = await fetch(`${API_URL}/api/profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile)
      });

      const serverData = await res.json();
      if (!res.ok) throw new Error(serverData.error);

      setProfiles([...profiles, { id: newProfile.id, name: newProfile.name, avatar: newProfile.avatar }]);
      setIsRegistering(false)
      setRegName(''); setRegPass(''); setError(false);
      setSelectedUser(newProfile)
    } catch (e) {
      alert(e.message || "Error al crear perfil en el servidor.");
    }
  }

  const handleLogin = async () => {
    const hashed = encrypt(password)
    const targetId = isLoginID ? loginIdInput : selectedUser?.id

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: targetId, pin: hashed })
      });
      const data = await res.json();
      if (data.success) {
        // Actualizar la sesión
        setCurrentUser(data.user)
        setPassword(''); setError(false);
        setIsLoginID(false); setLoginIdInput('');

        // 🔄 Refrescar la base de datos local de perfiles para que se vea en el grid
        const profilesRes = await fetch(`${API_URL}/api/profiles`);
        const profilesData = await profilesRes.json();
        setProfiles(profilesData);
      } else {
        throw new Error();
      }
    } catch (e) {
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
      setNotes([{ ...form, id: Date.now(), pinned: false, category: form.category || 'General', location: weather?.city || null }, ...notes])
    }
    setIsModalOpen(false); setEditingNote(null);
  }

  const togglePin = (id) => {
    setNotes(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n))
  }

  const exportToText = (note) => {
    const text = `${note.title || 'Sin Título'}\nFecha: ${note.date}\nCategoría: ${note.category || 'General'}\n\n${note.content}`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${note.title || 'nota'}.txt`
    a.click()
  }

  const exportToPDF = () => {
    window.print()
  }

  const exportAllToExcel = () => {
    const tableData = notes.map(n => ({
      Fecha: n.date,
      Título: n.title || 'Sin Título',
      Contenido: n.content,
      Ubicación: n.location || 'N/A',
      Categoría: n.category || 'General',
      Fijado: n.pinned ? 'Sí' : 'No'
    }));
    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mis Notas");
    XLSX.writeFile(wb, `HappyNotes_Export_${currentUser.name}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  const exportAllToPDFReport = () => {
    setIsPrintingReport(true);
    setTimeout(() => {
      window.print();
      setIsPrintingReport(false);
    }, 200);
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
        <div className="unit-sub" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <span>{weather?.city || 'Clima'}</span>
          {weather && (
            <a
              href={`https://www.google.com/maps?q=${weather.lat},${weather.lon}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', opacity: 0.5, transition: 'opacity 0.2s' }}
              title="Ver en Google Maps"
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
            >
              <MapPin size={12} />
            </a>
          )}
        </div>
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
            isLoginID ? (
              <div className="login-flow">
                <h1>Acceso con ID</h1>
                <p className="auth-subtitle">Introduce tus credenciales para sincronizar tus notas.</p>

                <div className="form-group" style={{ marginBottom: '3rem' }}>
                  <label className="unit-sub" style={{ marginLeft: '1rem', display: 'block', marginBottom: '0.6rem' }}>ID de Usuario</label>
                  <div className="input-wrapper">
                    <input type="text" className="form-input" placeholder="p.ej. ramon-123456" value={loginIdInput} onChange={e => setLoginIdInput(e.target.value)} autoFocus />
                    <User className="input-icon" size={20} />
                  </div>
                </div>

                <div className="pin-input-area" onClick={() => pinInputRef.current.focus()}>
                  <label className="unit-sub" style={{ marginBottom: '1.5rem', display: 'block' }}>Introduce tu PIN</label>
                  <div className="pass-dot-container">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`pass-dot ${password.length >= i ? 'filled' : ''} ${error ? 'error' : ''}`}></div>
                    ))}
                  </div>
                  <input ref={pinInputRef} type="password" maxLength="4" className="form-input" style={{ opacity: 0, position: 'absolute' }} value={password} onChange={e => setPassword(e.target.value)} />
                </div>

                <div className="auth-actions" style={{ marginTop: '2rem' }}>
                  <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => { setIsLoginID(false); setPassword(''); setLoginIdInput(''); }}>Atrás</button>
                </div>
              </div>
            ) : !selectedUser ? (
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

                <div className="auth-actions" style={{ marginTop: '3rem' }}>
                  <button className="btn btn-secondary" style={{ width: '100%', borderWidth: '1px', borderStyle: 'solid' }} onClick={() => setIsLoginID(true)}>
                    <ShieldCheck size={18} /> Iniciar sesión con ID
                  </button>
                </div>
              </>
            )
              : (
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
          <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
            <button
              className="logout-edge-btn"
              onClick={() => {
                const currentIndex = THEMES.findIndex(t => t.id === activeTheme);
                const nextIndex = (currentIndex + 1) % THEMES.length;
                setActiveTheme(THEMES[nextIndex].id);
              }}
              title="Cambiar Tema"
            >
              <Moon size={18} fill={THEMES.find(t => t.id === activeTheme)?.isDark ? "currentColor" : "none"} />
            </button>
            <div className="user-profile-tag" onClick={() => setIsSettingsOpen(true)}>
              <div className="user-avatar-mini">{currentUser.avatar}</div>
              <span className="user-name-tag">{currentUser.name}</span>
            </div>
          </div>
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
            <div className="icon-box"><Notebook size={20} /></div> <span className="nav-text">Notas del Día</span>
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
        <div className="content-wrapper">
          {isSettingsOpen ? (
            <div style={{ animation: 'entrance 0.8s var(--ease-premium)' }}>
              <h1 className="section-title">Ajustes</h1>
              <div className="note-card" style={{ maxWidth: '600px' }}>
                <div style={{ marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid var(--border-soft)' }}>
                  <label className="unit-sub" style={{ display: 'block', marginBottom: '0.4rem', opacity: 0.6 }}>Tu ID de Sincronización</label>
                  <code style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', fontWeight: 800, wordBreak: 'break-all' }}>{currentUser.id}</code>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.8rem', opacity: 0.5 }}>Usa este ID para iniciar sesión desde otros dispositivos.</p>
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Escalado de Interfaz</h3>
                    <span className="category-chip" style={{ color: 'var(--accent-primary)' }}>{Math.round(uiScale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="1.5"
                    step="0.05"
                    value={uiScale}
                    onChange={(e) => setUiScale(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent-primary)', height: '6px', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', opacity: 0.4, fontWeight: 800 }}>
                    <span>MIN (30%)</span>
                    <span>NORMAL</span>
                    <span>MAX (150%)</span>
                  </div>
                </div>

                <div style={{ marginBottom: '3rem' }}>
                  <h3 style={{ marginBottom: '1.5rem' }}>Colección de Temas</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.8rem' }}>
                    {THEMES.map(t => (
                      <div
                        key={t.id}
                        onClick={() => setActiveTheme(t.id)}
                        className={`note-card ${activeTheme === t.id ? 'active' : ''}`}
                        style={{
                          padding: '1rem',
                          cursor: 'pointer',
                          textAlign: 'center',
                          border: activeTheme === t.id ? '2px solid' + t.color : '1px solid var(--border-soft)',
                          background: activeTheme === t.id ? 'rgba(0,0,0,0.1)' : 'var(--surface-bright)',
                          transition: 'var(--transition)'
                        }}
                      >
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: t.color, margin: '0 auto 0.8rem' }}></div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>{t.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

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
                <button className="btn btn-secondary" style={{ width: '100%', marginBottom: '1.2rem' }} onClick={() => {
                  const data = JSON.stringify({ user: currentUser, notes }, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `happy-notes-backup-${currentUser.id}.json`;
                  a.click();
                }}><Download size={18} /> Exportar Toda Mi Info (JSON)</button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                  <button className="btn btn-secondary" onClick={exportAllToExcel}>
                    <FileText size={18} color="#22c55e" /> Reporte Excel
                  </button>
                  <button className="btn btn-secondary" onClick={exportAllToPDFReport}>
                    <Download size={18} color="#ef4444" /> Reporte PDF (Completo)
                  </button>
                </div>

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
              <h1 className="section-title">Mis Notas</h1>

              <div className="category-filter-bar">
                {['Todas', ...categories].map(cat => (
                  <div key={cat} className={`filter-chip ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
                    {cat}
                  </div>
                ))}
              </div>

              <div className="notes-grid">
                {notes.length === 0 ? (
                  <div className="empty-state-card" style={{ background: 'var(--surface-mid)', border: '1px dashed var(--border-soft)', padding: '6rem', borderRadius: '40px', gridColumn: '1/-1', textAlign: 'center' }}>
                    <Sparkles size={48} color="var(--accent-primary)" style={{ marginBottom: '2rem' }} />
                    <p style={{ fontSize: '1.6rem', color: 'var(--text-main)', maxWidth: '450px', margin: '0 auto 3rem', fontWeight: 600, fontFamily: 'Caveat, cursive' }}>{motivation}</p>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={20} /> Crear Primera Nota</button>
                  </div>
                ) : notes
                  .filter(n => activeCategory === 'Todas' || n.category === activeCategory)
                  .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.date) - new Date(a.date))
                  .map(note => (
                    <div key={note.id} className={`note-card ${note.pinned ? 'pinned' : ''}`} onClick={() => { setEditingNote(note.id); setForm(note); setIsModalOpen(true); }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
                        <h3 style={{ paddingRight: '2rem' }}>{note.title || 'Borrador'}</h3>
                        {note.pinned && <Pin size={16} className="pin-indicator" fill="var(--accent-primary)" />}
                      </div>
                      <div style={{ margin: '1rem 0', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span className="category-chip" style={{ color: 'var(--accent-primary)', fontSize: '0.6rem' }}>{note.category || 'General'}</span>
                      </div>
                      <p style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'var(--text-main)' }}>{note.content}</p>
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.3, fontSize: '0.8rem', fontWeight: 800, paddingTop: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {note.location && <><MapPin size={12} /> {note.location}</>}
                        </div>
                        <div>{note.date}</div>
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
                setForm({ title: '', content: '', date, category: 'General', pinned: false });
                setEditingNote(null);
                setIsModalOpen(true);
              }}
            />
          )}
        </div>
      </main>

      <button className="fab" onClick={() => { setEditingNote(null); setForm({ title: '', content: '', date: new Date().toISOString().split('T')[0], category: 'General', pinned: false }); setIsModalOpen(true); }}>
        <Plus size={32} />
      </button>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div className="unit-sub">Editor de Notas</div>
              <button
                className={`logout-edge-btn ${form.pinned ? 'active' : ''}`}
                style={{ background: form.pinned ? 'var(--accent-primary)' : 'var(--surface-bright)', color: form.pinned ? '#fff' : 'var(--text-dim)' }}
                onClick={() => setForm({ ...form, pinned: !form.pinned })}
                title="Fijar Nota"
              >
                <Pin size={18} fill={form.pinned ? "#fff" : "none"} />
              </button>
            </div>
            <h2 className="modal-title" style={{ marginBottom: '2rem' }}>{editingNote ? 'Refinar Idea' : 'Nueva Nota'}</h2>

            <div className="form-group">
              <label className="unit-sub">Categoría</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.8rem' }}>
                {categories.map(cat => (
                  <div
                    key={cat}
                    className={`filter-chip ${form.category === cat ? 'active' : ''}`}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                    onClick={() => setForm({ ...form, category: cat })}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="unit-sub">Título</label>
              <input className="form-input no-icon" placeholder="Nombre de la nota..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="unit-sub">Contenido</label>
              <textarea className="form-input no-icon content-textarea" placeholder="Escribe aquí..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
            </div>

            {editingNote && (
              <div className="export-actions">
                <button className="btn-export" onClick={() => exportToText(form)}>
                  <FileText size={16} /> Exportar TXT
                </button>
                <button className="btn-export" onClick={exportToPDF}>
                  <Download size={16} /> Exportar PDF
                </button>
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: '2.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cerrar</button>
              {editingNote && <button className="btn btn-secondary delete-btn" onClick={() => deleteNote(editingNote)}>Eliminar</button>}
              <button className="btn btn-primary save-btn" style={{ gridColumn: editingNote ? 'auto' : 'span 2' }} onClick={saveNote}><Save size={18} /> Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* 📊 Printable Full Report (Hidden in UI, only for Print) */}
      <div className="printable-report">
        <div className="report-header">
          <div>
            <h1>Happy Notes - Reporte Completo</h1>
            <p style={{ opacity: 0.6 }}>Generado el {new Date().toLocaleDateString()} para <strong>{currentUser.name}</strong></p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p>ID: {currentUser.id}</p>
            <p>Notas totales: {notes.length}</p>
          </div>
        </div>

        {notes.sort((a, b) => new Date(b.date) - new Date(a.date)).map(note => (
          <div key={note.id} className="report-note">
            <div className="report-note-title">{note.title || 'Sin Título'}</div>
            <div className="report-meta">
              <span>📅 {note.date}</span>
              <span>🏷️ {note.category || 'General'}</span>
              {note.location && <span>📍 {note.location}</span>}
              {note.pinned && <span style={{ color: 'var(--accent-primary)' }}>📌 Fijada</span>}
            </div>
            <div className="report-content">{note.content}</div>
          </div>
        ))}

        <div style={{ marginTop: '5rem', textAlign: 'center', opacity: 0.3, fontSize: '0.8rem' }}>
          Este documento fue generado automáticamente por Happy Notes.
        </div>
      </div>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 className="section-title" style={{ marginBottom: 0 }}>{meses[date.getMonth()]} <small style={{ opacity: 0.2 }}>{date.getFullYear()}</small></h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-secondary" style={{ padding: '0 1rem' }} onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))}><ArrowLeft size={18} /></button>
            <button className="btn btn-secondary" style={{ padding: '0 1rem' }} onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))}><ArrowRight size={18} /></button>
          </div>
        </div>
        <div className="calendar-grid-container">
          <div className="calendar-grid">
            {['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 900, opacity: 0.3, padding: '0.5rem 0' }}>{d}</div>)}
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

        <div className="day-detail" style={{ marginTop: '2rem' }}>
          <div className="unit-sub" style={{ marginBottom: '1rem' }}>Resumen del día</div>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 800 }}>{selectedDay}</h2>
          <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
            {dayNotes.length > 0 ? dayNotes.map(n => (
              <div key={n.id} style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.6rem', fontFamily: 'Caveat, cursive' }}>{n.title || 'Nota'}</h4>
                <p style={{ fontSize: '1rem', color: 'var(--text-dim)', lineHeight: 1.7 }}>{n.content}</p>
                {n.location && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', opacity: 0.4, fontWeight: 700 }}>
                    <MapPin size={12} /> {n.location}
                  </div>
                )}
              </div>
            )) : <div style={{ marginTop: '4rem', textAlign: 'center', opacity: 0.2, fontWeight: 700 }}>Sin planes.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
