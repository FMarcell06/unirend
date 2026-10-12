import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { TimeTable, DEFAULT_DUO_COLORS } from '../components/TimeTable'
import { ColorSwatches } from '../components/ColorSwatches'

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const COURSE_SELECT = 'id, name, code, color, instructor, sessions ( * )'

export const CommonView = () => {
  const { user } = useAuth()
  const friendKey = `commonView:lastFriend:${user.id}`
  const colorsKey = `commonView:colors:${user.id}`

  const [friends, setFriends] = useState([])
  const [selectedFriendId, setSelectedFriendId] = useState(() => {
    try {
      return localStorage.getItem(friendKey) || ''
    } catch {
      return ''
    }
  })
  const [myCourses, setMyCourses] = useState([])
  const [friendCourses, setFriendCourses] = useState([])
  const [loading, setLoading] = useState(true)
const [colorOpen, setColorOpen] = useState(null) // null | 'mine' | 'friend'
  const [colors, setColors] = useState(() => ({ ...DEFAULT_DUO_COLORS, ...readJson(colorsKey, {}) }))

  const handleSelectFriend = (id) => {
    setSelectedFriendId(id)
    try {
      if (id) localStorage.setItem(friendKey, id)
      else localStorage.removeItem(friendKey)
    } catch {
      // nem gond, ha nem menthető
    }
  }

  const handleColor = (who, color) => {
    setColors((prev) => {
      const next = { ...prev, [who]: color }
      try {
        localStorage.setItem(colorsKey, JSON.stringify(next))
      } catch {
        // nem gond, ha nem menthető
      }
      return next
    })
  }

  // elfogadott ismerősök
  useEffect(() => {
    const fetchFriends = async () => {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id, user_id, friend_id, status,
          requester:profiles!friendships_user_id_profiles_fkey(id, display_name, avatar_url),
          addressee:profiles!friendships_friend_id_profiles_fkey(id, display_name, avatar_url)
        `)
        .eq('status', 'accepted')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)

      if (!error) {
        setFriends(data.map((row) => (row.user_id === user.id ? row.addressee : row.requester)))
      }
      setLoading(false)
    }

    if (user) fetchFriends()
  }, [user])

  // ha a mentett ismerős már nincs a listában, töröljük a választást
  useEffect(() => {
    if (!loading && selectedFriendId && !friends.some((f) => f.id === selectedFriendId)) {
      handleSelectFriend('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friends, loading])

  const fetchMyCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select(COURSE_SELECT)
      .eq('user_id', user.id)

    if (!error) setMyCourses(data)
  }

  useEffect(() => {
    if (user) fetchMyCourses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // a kiválasztott ismerős kurzusai
  useEffect(() => {
    const fetchFriendCourses = async () => {
      if (!selectedFriendId) {
        setFriendCourses([])
        return
      }

      const { data, error } = await supabase
        .from('courses')
        .select(COURSE_SELECT)
        .eq('user_id', selectedFriendId)

      if (!error) setFriendCourses(data)
      else console.error(error)
    }

    fetchFriendCourses()
  }, [selectedFriendId])

  const combinedCourses = [
    ...myCourses.map((c) => ({ ...c, isMine: true })),
    ...friendCourses.map((c) => ({ ...c, isMine: false })),
  ]

  const friendName = friends.find((f) => f.id === selectedFriendId)?.display_name

  return (
    <div className="home-page">
      <div className="home-greeting">
        <h1>Közös nézet</h1>
      </div>

      {loading ? (
        <p>Betöltés...</p>
      ) : friends.length === 0 ? (
        <p>Még nincs elfogadott ismerősöd. Adj hozzá valakit az Ismerősök oldalon!</p>
      ) : (
        <>
          <div className="common-controls">
            <select value={selectedFriendId} onChange={(e) => handleSelectFriend(e.target.value)}>
              <option value="">Válassz ismerőst</option>
              {friends.map((f) => (
                <option key={f.id} value={f.id}>{f.display_name}</option>
              ))}
            </select>

{selectedFriendId && (
  <>
    <div className="legend legend-interactive">
      <button
        type="button"
        className={`legend-chip ${colorOpen === 'mine' ? 'open' : ''}`}
        onClick={() => setColorOpen((o) => (o === 'mine' ? null : 'mine'))}
        aria-expanded={colorOpen === 'mine'}
      >
        <span className="legend-dot" style={{ background: colors.mine }} />
        Te
      </button>

      <button
        type="button"
        className={`legend-chip ${colorOpen === 'friend' ? 'open' : ''}`}
        onClick={() => setColorOpen((o) => (o === 'friend' ? null : 'friend'))}
        aria-expanded={colorOpen === 'friend'}
      >
        <span className="legend-dot" style={{ background: colors.friend }} />
        {friendName}
      </button>
    </div>

    {colorOpen && (
      <div className="color-panel">
        <ColorSwatches
          value={colors[colorOpen]}
          onChange={(c) => handleColor(colorOpen, c)}
          label={colorOpen === 'mine' ? 'Saját szín' : `${friendName} színe`}
        />
      </div>
    )}
  </>
)}
          </div>

          {selectedFriendId && (
            <TimeTable
              courses={combinedCourses}
              colorMode="duo"
              duoColors={colors}
              onChanged={fetchMyCourses}
            />
          )}
        </>
      )}
    </div>
  )
}