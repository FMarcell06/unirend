import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { uploadImage, deleteImage } from '../cloudinaryUtils.js'

export const Profile = () => {
  const { user, profile, refreshProfile } = useAuth()

  const [displayName, setDisplayName] = useState('')
  const [university, setUniversity] = useState('')
  const [major, setMajor] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarPublicId, setAvatarPublicId] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '')
      setUniversity(profile.university || '')
      setMajor(profile.major || '')
      setAvatarUrl(profile.avatar_url || '')
      setAvatarPublicId(profile.avatar_public_id || '')
    }
  }, [profile])

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setMessage(null)

    try {
      // ha van régi kép, töröljük, mielőtt feltöltjük az újat
      if (avatarPublicId) {
        await deleteImage(avatarPublicId)
      }

      const uploaded = await uploadImage(file)
      setAvatarUrl(uploaded.url)
      setAvatarPublicId(uploaded.public_id)
    } catch (error) {
      setMessage({ type: 'error', text: 'Nem sikerült feltölteni a képet.' })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        university,
        major,
        avatar_url: avatarUrl,
        avatar_public_id: avatarPublicId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    setLoading(false)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Profil frissítve!' })
      refreshProfile()
    }
  }

  return (
    <div>
      <h1>Profilom</h1>

      <div>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profilkép"
            style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#eee' }} />
        )}
        <div>
          <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={uploading} />
          {uploading && <p>Feltöltés...</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Megjelenítendő név</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>

        <div>
          <label>Egyetem</label>
          <input value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="pl. BME, ELTE..." />
        </div>

        <div>
          <label>Szak</label>
          <input value={major} onChange={(e) => setMajor(e.target.value)} />
        </div>

        <button type="submit" disabled={loading || uploading}>
          {loading ? 'Mentés...' : 'Mentés'}
        </button>
      </form>

      {message && (
        <p style={{ color: message.type === 'error' ? 'red' : 'green' }}>{message.text}</p>
      )}
    </div>
  )
}