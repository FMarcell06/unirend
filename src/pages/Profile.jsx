import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { BACKGROUNDS } from '../backgrounds'
import { uploadImage, deleteImage } from '../cloudinaryUtils'
import { showSuccess, showError } from '../toast'
import './Profile.css'

// az elmosott foltokat utánzó előnézet
const previewBackground = ({ bg, a, b }) =>
  `radial-gradient(circle at 20% 20%, ${a} 0%, transparent 60%), radial-gradient(circle at 85% 85%, ${b} 0%, transparent 60%), ${bg}`

export const Profile = () => {
  const { user, profile, refreshProfile, signOut } = useAuth()
  const { theme, setTheme, background, setBackground } = useTheme()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [university, setUniversity] = useState('')
  const [major, setMajor] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '')
      setUniversity(profile.university || '')
      setMajor(profile.major || '')
    }
  }, [profile])

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return

    setUploading(true)
    try {
      const uploaded = await uploadImage(file)
      const oldPublicId = profile?.avatar_public_id

      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_url: uploaded.url,
          avatar_public_id: uploaded.public_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) {
        deleteImage(uploaded.public_id) // ne maradjon árva kép
        throw error
      }

      if (oldPublicId) deleteImage(oldPublicId)
      refreshProfile()
      showSuccess('Profilkép frissítve!')
    } catch (err) {
      console.error(err)
      showError('Nem sikerült feltölteni a képet.')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim(),
        university: university.trim(),
        major: major.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    setSaving(false)

    if (error) {
      showError(error.message)
    } else {
      showSuccess('Profil mentve!')
      refreshProfile()
    }
  }

  const handleSignOut = async () => {
    await signOut()
    showSuccess('Sikeres kijelentkezés!')
    navigate('/login')
  }

  const initial = (displayName || user?.email || '?').trim().charAt(0).toUpperCase()

  const customPreview = background.id === 'custom' && background.color
    ? `radial-gradient(circle at 25% 25%, ${background.color} 0%, transparent 70%), ${theme === 'dark' ? '#0b0b0d' : '#f2f4f8'}`
    : 'conic-gradient(#ff5f6d, #ffc371, #7bed9f, #70a1ff, #a55eea, #ff5f6d)'

  return (
    <div className="profile-page">
      <section className="glass-card profile-hero">
        <div className="avatar-wrap">
          {profile?.avatar_url ? (
            <img className="avatar-img" src={profile.avatar_url} alt="Profilkép" />
          ) : (
            <div className="avatar-fallback">{initial}</div>
          )}
          <label className={`avatar-edit ${uploading ? 'is-busy' : ''}`} aria-label="Profilkép cseréje">
            <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={uploading} hidden />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </label>
        </div>

        <div className="profile-hero-text">
          <h1>{profile?.display_name || 'Profilom'}</h1>
          <p>{user?.email}</p>
          {profile?.university && <p>{profile.university}</p>}
        </div>
      </section>

      <form className="glass-card" onSubmit={handleSave}>
        <h2 className="section-title">Személyes adatok</h2>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="displayName">Megjelenített név</label>
            <input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="university">Egyetem</label>
            <input id="university" value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="pl. BME, ELTE" />
          </div>
          <div className="field">
            <label htmlFor="major">Szak</label>
            <input id="major" value={major} onChange={(e) => setMajor(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Mentés…' : 'Mentés'}
        </button>
      </form>

      <section className="glass-card">
        <h2 className="section-title">Megjelenés</h2>

        <div className="setting-row">
          <span className="setting-label">Téma</span>
          <div className="segmented" role="group" aria-label="Téma">
            <button type="button" className={theme === 'light' ? 'active' : ''} onClick={() => setTheme('light')}>
              Világos
            </button>
            <button type="button" className={theme === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')}>
              Sötét
            </button>
          </div>
        </div>

        <div>
          <span className="setting-label setting-label-block">Háttér</span>
          <div className="swatches">
            {BACKGROUNDS.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`swatch ${background.id === b.id ? 'active' : ''}`}
                aria-pressed={background.id === b.id}
                onClick={() => setBackground({ id: b.id })}
              >
                <span className="swatch-preview" style={{ background: previewBackground(b[theme]) }} />
                <span>{b.label}</span>
              </button>
            ))}

            <label className={`swatch ${background.id === 'custom' ? 'active' : ''}`}>
              <span className="swatch-preview" style={{ background: customPreview }} />
              <span>Egyéni</span>
              <input
                type="color"
                className="swatch-color-input"
                value={background.color || '#0a84ff'}
                onChange={(e) => setBackground({ id: 'custom', color: e.target.value })}
                aria-label="Egyéni háttérszín"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="glass-card">
        <h2 className="section-title">Fiók</h2>
        <button type="button" className="btn btn-danger" onClick={handleSignOut}>
          Kijelentkezés
        </button>
      </section>
    </div>
  )
}