import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export const Social = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  const [friends, setFriends] = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])
  const [outgoingRequests, setOutgoingRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchFriendships = async () => {
    setLoading(true)

const { data, error } = await supabase
  .from('friendships')
  .select(`
    id, status, user_id, friend_id,
    requester:profiles!friendships_user_id_profiles_fkey(id, display_name, avatar_url, university),
    addressee:profiles!friendships_friend_id_profiles_fkey(id, display_name, avatar_url, university)
  `)
  .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    const accepted = []
    const incoming = []
    const outgoing = []

    for (const row of data) {
      const isMine = row.user_id === user.id
      const otherProfile = isMine ? row.addressee : row.requester

      if (row.status === 'accepted') {
        accepted.push({ friendshipId: row.id, profile: otherProfile })
      } else if (row.status === 'pending') {
        if (isMine) {
          outgoing.push({ friendshipId: row.id, profile: otherProfile })
        } else {
          incoming.push({ friendshipId: row.id, profile: otherProfile })
        }
      }
    }

    setFriends(accepted)
    setIncomingRequests(incoming)
    setOutgoingRequests(outgoing)
    setLoading(false)
  }

  useEffect(() => {
    if (user) fetchFriendships()
  }, [user])

const handleSearch = async (e) => {
  e.preventDefault()
  if (!searchTerm.trim()) return

  setSearching(true)
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, university')
    .ilike('display_name', `%${searchTerm}%`)
    .neq('id', user.id)
    .limit(10)

  console.log('search term:', searchTerm)
  console.log('data:', data)
  console.log('error:', error)

  if (!error) setSearchResults(data)
  setSearching(false)
}

const fetchAllProfiles = async () => {
  setSearching(true)
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, university')
    .neq('id', user.id)
    .limit(50)

  if (!error) setSearchResults(data)
  setSearching(false)
}

  const sendRequest = async (friendId) => {
    const { error } = await supabase
      .from('friendships')
      .insert({ user_id: user.id, friend_id: friendId, status: 'pending' })

    if (error) {
      alert('Hiba: ' + error.message)
      return
    }
    setSearchResults((prev) => prev.filter((p) => p.id !== friendId))
    fetchFriendships()
  }

  const acceptRequest = async (friendshipId) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)

    if (!error) fetchFriendships()
  }

  const declineOrRemove = async (friendshipId) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId)

    if (!error) fetchFriendships()
  }

  const isAlreadyConnected = (profileId) => {
    return (
      friends.some((f) => f.profile.id === profileId) ||
      incomingRequests.some((r) => r.profile.id === profileId) ||
      outgoingRequests.some((r) => r.profile.id === profileId)
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <h1>Ismerősök</h1>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Keresés név alapján..."
            style={{ flex: 1 }}
        />
        <button type="submit" disabled={searching}>Keresés</button>
        <button type="button" onClick={fetchAllProfiles} disabled={searching}>Mindenki</button>
        </form>

      {searchResults.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3>Találatok</h3>
          {searchResults.map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
              {p.avatar_url ? (
                <img src={p.avatar_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ddd' }} />
              )}
              <div style={{ flex: 1 }}>
                <strong>{p.display_name}</strong>
                {p.university && <div style={{ fontSize: 13, color: '#777' }}>{p.university}</div>}
              </div>
              {isAlreadyConnected(p.id) ? (
                <span style={{ fontSize: 13, color: '#999' }}>Már kapcsolatban</span>
              ) : (
                <button onClick={() => sendRequest(p.id)}>Hozzáadás</button>
              )}
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <p>Betöltés...</p>
      ) : (
        <>
          {incomingRequests.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3>Beérkezett kérések</h3>
              {incomingRequests.map((r) => (
                <div key={r.friendshipId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                  {r.profile.avatar_url ? (
                    <img src={r.profile.avatar_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ddd' }} />
                  )}
                  <strong style={{ flex: 1 }}>{r.profile.display_name}</strong>
                  <button onClick={() => acceptRequest(r.friendshipId)}>Elfogadás</button>
                  <button onClick={() => declineOrRemove(r.friendshipId)}>Elutasítás</button>
                </div>
              ))}
            </div>
          )}

          {outgoingRequests.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3>Küldött kérések</h3>
              {outgoingRequests.map((r) => (
                <div key={r.friendshipId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                  <span style={{ flex: 1 }}>{r.profile.display_name}</span>
                  <span style={{ fontSize: 13, color: '#999' }}>Függőben...</span>
                  <button onClick={() => declineOrRemove(r.friendshipId)}>Visszavonás</button>
                </div>
              ))}
            </div>
          )}

          <div>
            <h3>Ismerőseim ({friends.length})</h3>
            {friends.length === 0 && <p>Még nincs ismerősöd.</p>}
            {friends.map((f) => (
              <div key={f.friendshipId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                {f.profile.avatar_url ? (
                  <img src={f.profile.avatar_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ddd' }} />
                )}
                <div style={{ flex: 1 }}>
                  <strong>{f.profile.display_name}</strong>
                  {f.profile.university && <div style={{ fontSize: 13, color: '#777' }}>{f.profile.university}</div>}
                </div>
                <button onClick={() => declineOrRemove(f.friendshipId)}>Eltávolítás</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}