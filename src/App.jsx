import { useState, useEffect } from 'react'
import './index.css'

const encrypt = (text) => btoa(`salt_${text}_secure`)

const MOTIVATIONS = [
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

  const [calDate, setCalDate] = useState(new Date())
  const [selectedCalDay, setSelectedCalDay] = useState(new Date().toISOString().split('T')[0])
  const [motivation, setMotivation] = useState(MOTIVATIONS[0])

  useEffect(() => {
    localStorage.setItem('happy-profiles', JSON.stringify(profiles))
  }, [profiles])

  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`happy-notes-${currentUser.id}`)
      setNotes(saved ? JSON.parse(saved) : [])
      setMotivation(MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)])
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
    if (regName.trim().length < 2) { setError('Nombre corto'); return; }
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
      setError('Incorrecto')
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

  // --- RENDERING ---
  if (!currentUser) {
    return (
      <div className="login-container">
        <div className="bg-mesh"></div>
        <div className={`auth-card ${isShaking ? 'shake' : ''}`}>
          {isRegistering ? (
            <div className="registration-flow">
              <h1>Join.</h1>
              <p className="auth-subtitle">Define your space</p>
              <input type="text" className="form-input" style={{ marginBottom: '1.2rem' }} placeholder="Your name" value={regName} onChange={e => setRegName(e.target.value)} autoFocus />
              <input type="password" maxLength="4" className="form-input" style={{ textAlign: 'center', letterSpacing: '0.5rem' }} placeholder="PIN" value={regPass} onChange={e => setRegPass(e.target.value)} />
              <p style={{ color: 'var(--error)', margin: '1rem 0', minHeight: '1.2rem', fontSize: '0.9rem' }}>{error}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                <button className="btn btn-secondary" onClick={() => setIsRegistering(false)}>Back</button>
                <button className="btn btn-primary" onClick={handleCreateProfile}>Create Account</button>
              </div>
            </div>
          ) : !selectedUser ? (
            <>
              <h1>Happy.</h1>
              <p className="auth-subtitle">Select your profile</p>
              <div className="profile-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
                {profiles.map(user => (
                  <div key={user.id} className="profile-item" onClick={() => setSelectedUser(user)} style={{ cursor: 'pointer', padding: '1.8rem 1rem', borderRadius: '28px', background: 'var(--surface-bright)', border: '1px solid var(--border)', transition: 'all 0.4s var(--ease-premium)' }}>
                    <div className="profile-avatar" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.8rem' }}>{user.avatar}</div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.5 }}>{user.name}</span>
                  </div>
                ))}
                <div className="profile-item" onClick={() => setIsRegistering(true)} style={{ cursor: 'pointer', padding: '1.8rem 1rem', borderRadius: '28px', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                  <div style={{ fontSize: '1.5rem' }}>+</div>
                </div>
              </div>
            </>
          ) : (
            <div className="login-flow">
              <div className="profile-view" style={{ marginBottom: '3rem' }}>
                <div style={{ width: '90px', height: '90px', background: 'var(--accent)', color: '#000', borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, margin: '0 auto 1.5rem', boxShadow: '0 20px 40px rgba(255,255,255,0.1)' }}>{selectedUser.avatar}</div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>{selectedUser.name}</h2>
              </div>
              <div className="pass-dot-container">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`pass-dot ${password.length >= i ? 'filled' : ''}`}></div>
                ))}
              </div>
              <input type="password" maxLength="4" className="form-input" style={{ opacity: 0, position: 'absolute' }} value={password} onChange={e => setPassword(e.target.value)} autoFocus />
              <button className="btn btn-secondary" style={{ width: '100%', marginTop: '3rem' }} onClick={() => { setSelectedUser(null); setPassword(''); setError(''); }}>Change Profile</button>
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
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.06em', marginBottom: '5rem' }}>Happy.</h2>
        <nav>
          <div className={`nav-link ${view === 'notes' && !isSettingsOpen ? 'active' : ''}`} onClick={() => { setView('notes'); setIsSettingsOpen(false); }}>
            <span className="nav-icon">○</span> <span>Notes</span>
          </div>
          <div className={`nav-link ${view === 'calendar' && !isSettingsOpen ? 'active' : ''}`} onClick={() => { setView('calendar'); setIsSettingsOpen(false); }}>
            <span className="nav-icon">○</span> <span>Calendar</span>
          </div>
          <div className={`nav-link ${isSettingsOpen ? 'active' : ''}`} onClick={() => setIsSettingsOpen(true)}>
            <span className="nav-icon">○</span> <span>Settings</span>
          </div>
        </nav>
        <button className="nav-link" style={{ marginTop: 'auto', background: 'none', border: 'none', width: '100%', justifyContent: 'flex-start' }} onClick={() => { setCurrentUser(null); setSelectedUser(null); }}>
          <span className="nav-icon">¬</span> <span>Exit</span>
        </button>
      </aside>

      <main className="content-area">
        {isSettingsOpen ? (
          <div style={{ animation: 'slideIn 0.8s var(--ease-premium)' }}>
            <h1 className="title-reveal">Settings.</h1>
            <div className="note-card" style={{ maxWidth: '550px' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '2.5rem' }}>Profile Security</h3>
              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.4, marginBottom: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Update PIN</label>
                <input type="password" maxLength="4" className="form-input" style={{ background: 'transparent' }} placeholder="Enter 4-digit PIN" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginBottom: '1.5rem' }} onClick={() => {
                if (newPassword.length === 4) {
                  setProfiles(profiles.map(p => p.id === currentUser.id ? { ...p, password: encrypt(newPassword) } : p))
                  setSettingsStatus('Updated successfully.')
                  setNewPassword('')
                  setTimeout(() => setSettingsStatus(''), 4000)
                }
              }}>Save PIN</button>
              <button className="btn btn-secondary" style={{ width: '100%', color: 'var(--error)', borderColor: 'rgba(255, 68, 68, 0.2)' }} onClick={() => {
                if (window.confirm('Delete profile and all data?')) {
                  const updated = profiles.filter(p => p.id !== currentUser.id)
                  localStorage.removeItem(`happy-notes-${currentUser.id}`)
                  setProfiles(updated)
                  setCurrentUser(null)
                  setSelectedUser(null)
                }
              }}>Delete Profile</button>
              {settingsStatus && <p style={{ marginTop: '1.5rem', textAlign: 'center', fontWeight: 600 }}>{settingsStatus}</p>}
            </div>
          </div>
        ) : view === 'notes' ? (
          <div style={{ animation: 'slideIn 0.8s var(--ease-premium)' }}>
            <h1 className="title-reveal">Notes.</h1>
            <div className="notes-grid">
              {notes.length === 0 ? (
                <div className="empty-state-card">
                  <div style={{ fontSize: '3rem', opacity: 0.3 }}>✦</div>
                  <p>{motivation}</p>
                  <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Create First Note</button>
                </div>
              ) : notes.map(note => (
                <div key={note.id} className="note-card" onClick={() => { setEditingNote(note.id); setForm(note); setIsModalOpen(true); }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3>{note.title || 'Untitled'}</h3>
                    <span style={{ fontSize: '0.8rem', opacity: 0.2, fontWeight: 700 }}>{note.date}</span>
                  </div>
                  <p>{note.content}</p>
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

      <button className="fab" onClick={() => {
        setEditingNote(null);
        setForm({ title: '', content: '', color: 'default', date: new Date().toISOString().split('T')[0] });
        setIsModalOpen(true);
      }}>+</button>

      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(30px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>
          <div className="auth-card" style={{ maxWidth: '650px', padding: '5rem' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '4rem', fontWeight: 800, letterSpacing: '-0.04em' }}>{editingNote ? 'Refine.' : 'Thought.'}</h2>

            <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <label style={{ fontSize: '0.75rem', opacity: 0.4, fontWeight: 800, textTransform: 'uppercase', marginLeft: '1rem', marginBottom: '0.8rem', display: 'block' }}>Subject</label>
              <input className="form-input" style={{ background: 'var(--surface-bright)' }} placeholder="Name this idea..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>

            <div style={{ textAlign: 'left', marginBottom: '3rem' }}>
              <label style={{ fontSize: '0.75rem', opacity: 0.4, fontWeight: 800, textTransform: 'uppercase', marginLeft: '1rem', marginBottom: '0.8rem', display: 'block' }}>Details</label>
              <textarea className="form-input" style={{ background: 'var(--surface-bright)', resize: 'none' }} rows="8" placeholder="Expand your mind here..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveNote}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CalendarView({ date, setDate, notes, selectedDay, setSelectedDay, onDayClick }) {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const daysInMonth = (m, y) => new Date(y, m + 1, 0).getDate()
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  const grid = []
  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) grid.push(null)
  for (let d = 1; d <= daysInMonth(date.getMonth(), date.getFullYear()); d++) grid.push(d)

  const dayNotes = notes.filter(n => n.date === selectedDay)

  return (
    <div className="calendar-view" style={{ animation: 'slideIn 0.8s var(--ease-premium)' }}>
      <div className="calendar-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5rem' }}>
          <h1 style={{ fontSize: '4.5rem', fontWeight: 800, letterSpacing: '-0.07em' }}>{monthNames[date.getMonth()]} <span style={{ opacity: 0.15 }}>{date.getFullYear()}</span></h1>
          <div style={{ display: 'flex', gap: '1.2rem' }}>
            <button className="btn btn-secondary" style={{ padding: '1rem 1.5rem' }} onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))}>←</button>
            <button className="btn btn-secondary" style={{ padding: '1rem 1.5rem' }} onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))}>→</button>
          </div>
        </div>
        <div className="calendar-grid">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 900, opacity: 0.25, padding: '1.5rem 0' }}>{d}</div>)}
          {grid.map((d, i) => {
            if (!d) return <div key={i}></div>
            const dStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
            const hasNote = notes.some(n => n.date === dStr)
            const isToday = new Date().toISOString().split('T')[0] === dStr
            const isSelected = selectedDay === dStr
            return (
              <div key={i} className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`} onClick={() => { setSelectedDay(dStr); onDayClick(dStr); }}>
                {d}
                {hasNote && !isSelected && <div style={{ position: 'absolute', bottom: '12px', width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', opacity: 0.4 }}></div>}
              </div>
            )
          })}
        </div>
      </div>
      <div className="day-detail" style={{ background: 'var(--surface-bright)', padding: '4rem 3rem', borderRadius: '40px', border: '1px solid var(--border)' }}>
        <h2 style={{ marginBottom: '3rem', fontSize: '1.1rem', opacity: 0.3, fontWeight: 800, letterSpacing: '0.1em' }}>{selectedDay}</h2>
        {dayNotes.length > 0 ? dayNotes.map(n => (
          <div key={n.id} style={{ marginBottom: '3rem' }}>
            <h4 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.8rem' }}>{n.title || 'Draft'}</h4>
            <p style={{ fontSize: '1rem', color: 'var(--text-dim)', lineHeight: 1.7 }}>{n.content}</p>
          </div>
        )) : (
          <div style={{ marginTop: '5rem', textAlign: 'center' }}>
            <p style={{ opacity: 0.2, fontSize: '0.95rem', fontWeight: 500 }}>Nothing planned.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
