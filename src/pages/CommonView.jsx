import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { TimeTable } from '../components/TimeTable'

export const CommonView = () => {
  const { user } = useAuth()
  const [friends, setFriends] = useState([])
  const [myCourses, setMyCourses] = useState([])
  const storageKey = `commonView:lastFriend:${user.id}`
  const [friendCourses, setFriendCourses] = useState([])
  const [loading, setLoading] = useState(true)

const [selectedFriendId, setSelectedFriendId] = useState(() => {
  try {
    return localStorage.getItem(storageKey) || ''
  } catch {
    return ''
  }
})

const handleSelectFriend = (id) => {
  setSelectedFriendId(id)
  try {
    if (id) localStorage.setItem(storageKey, id)
    else localStorage.removeItem(storageKey)
  } catch {
    // ha a tárolás nem elérhető, nem gond, csak nem jegyezzük meg
  }
}

  // barátok lekérése (csak az elfogadottak)
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
        const list = data.map((row) => {
          const isMine = row.user_id === user.id
          return isMine ? row.addressee : row.requester
        })
        setFriends(list)
      }
      setLoading(false)
    }

    if (user) fetchFriends()
  }, [user])

useEffect(() => {
  if (!loading && selectedFriendId && !friends.some((f) => f.id === selectedFriendId)) {
    handleSelectFriend('')
  }
}, [friends, loading])

  // saját kurzusok lekérése
  useEffect(() => {
    const fetchMyCourses = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`id, name, code, color, instructor, sessions ( id, day_of_week, start_time, end_time, type, room )`)
        .eq('user_id', user.id)

      if (!error) setMyCourses(data)
    }

    if (user) fetchMyCourses()
  }, [user])

  // kiválasztott barát kurzusainak lekérése
  useEffect(() => {
    const fetchFriendCourses = async () => {
      if (!selectedFriendId) {
        setFriendCourses([])
        return
      }

      const { data, error } = await supabase
        .from('courses')
        .select(`id, name, code, color, instructor, sessions ( id, day_of_week, start_time, end_time, type, room )`)
        .eq('user_id', selectedFriendId)

      if (!error) setFriendCourses(data)
      else console.error(error)
    }

    fetchFriendCourses()
  }, [selectedFriendId])

  // a saját és a barát kurzusait összefésüljük egy listába, hogy a TimeTable meg tudja jeleníteni mindkettőt
  const combinedCourses = [
    ...myCourses.map((c) => ({ ...c, isMine: true })),
    ...friendCourses.map((c) => ({ ...c, isMine: false })),
  ]
  

console.log('myCourses:', JSON.stringify(myCourses, null, 2))
console.log('friendCourses:', JSON.stringify(friendCourses, null, 2))
console.log('combinedCourses:', JSON.stringify(combinedCourses, null, 2))

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
            <div className="legend" style={{ marginTop: 10 }}>
              <span><span className="legend-dot mine" />Te</span>
              <span>
                <span className="legend-dot friend" />
                {friends.find((f) => f.id === selectedFriendId)?.display_name}
              </span>
            </div>
          )}
        </div>

        {selectedFriendId && <TimeTable courses={combinedCourses} colorMode="duo" />}
      </>
    )}
  </div>
)
}