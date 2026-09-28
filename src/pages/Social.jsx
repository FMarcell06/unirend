import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { showSuccess, showError } from '../toast'
import './Social.css'

const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

const PersonAvatar = ({ profile }) =>
  profile.avatar_url ? (
    <img className="person-avatar" src={profile.avatar_url} alt="" />
  ) : (
    <div className="person-avatar person-avatar-fallback">
      {(profile.display_name || '?').trim().charAt(0).toUpperCase()}
    </div>
  )

export const Social = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searched, setSearched] = useState(false)
  const [searching, setSearching] = useState(false)

  const [friends, setFriends] = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])
  const [outgoingRequests, setOutgoingRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const fetchFriendships = async () => {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id, status, user_id, friend_id,
        requester:profiles!friendships_user_id_profiles_fkey(id, display_name, avatar_url, university),
        addressee:profiles!friendships_friend_id_profiles_fkey(id, display_name, avatar_url, university)
      `)
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)

    if (error) {
      showError('Nem sikerült betölteni az ismerősöket.')
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
      } else if (isMine) {
        outgoing.push({ friendshipId: row.id, profile: otherProfile })
      } else {
        incoming.push({ friendshipId: row.id, profile: otherProfile })
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
      .ilike('display_name', `%${searchTerm.trim()}%`)
      .neq('id', user.id)
      .limit(15)

    if (error) showError('Hiba a keresés közben.')
    else setSearchResults(data)

    setSearched(true)
    setSearching(false)
  }

  const isAlreadyConnected = (profileId) =>
    friends.some((f) => f.profile.id === profileId) ||
    incomingRequests.some((r) => r.profile.id === profileId) ||
    outgoingRequests.some((r) => r.profile.id === profileId)

  const sendRequest = async (friendId) => {
    setBusyId(friendId)
    const { error } = await supabase
      .from('friendships')
      .insert({ user_id: user.id, friend_id: friendId, status: 'pending' })

    setBusyId(null)

    if (error) {
      showError('Hiba: ' + error.message)
      return
    }
    fetchFriendships()
    showSuccess('Barátkérés elküldve!')
  }

  const acceptRequest = async (friendshipId) => {
    setBusyId(friendshipId)
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)

    setBusyId(null)

    if (error) {
      showError(error.message)
      return
    }
    fetchFriendships()
    showSuccess('Barátkérés elfogadva!')
  }

  const declineOrRemove = async (friendshipId, kind) => {
    setBusyId(friendshipId)
    const { error } = await supabase.from('friendships').delete().eq('id', friendshipId)
    setBusyId(null)

    if (error) {
      showError(error.message)
      return
    }
    fetchFriendships()
    if (kind === 'remove') showSuccess('Ismerős eltávolítva.')
  }

  return (
    <div className="social-page">
      <div className="page-head">
        <div>
          <h1>Ismerősök</h1>
          {!loading && <p>{friends.length} ismerős</p>}
        </div>
      </div>

      <form className="search-bar glass-card" onSubmit={handleSearch}>
        <SearchIcon />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Keresés név alapján…"
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={searching}>
          {searching ? 'Keresés…' : 'Keresés'}
        </button>
      </form>

      {searched && (
        <section className="social-section">
          <h2>Találatok</h2>
          {searchResults.length === 0 ? (
            <p className="section-empty">Nincs ilyen nevű felhasználó.</p>
          ) : (
            <div className="person-list">
              {searchResults.map((p) => (
                <div key={p.id} className="glass-card person-row">
                  <PersonAvatar profile={p} />
                  <div className="person-info">
                    <strong>{p.display_name}</strong>
                    {p.university && <span>{p.university}</span>}
                  </div>
                  {isAlreadyConnected(p.id) ? (
                    <span className="person-status">Már kapcsolatban</span>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => sendRequest(p.id)}
                      disabled={busyId === p.id}
                    >
                      Hozzáadás
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {loading ? (
        <p className="page-status">Betöltés…</p>
      ) : (
        <>
          {incomingRequests.length > 0 && (
            <section className="social-section">
              <h2>Beérkezett kérések</h2>
              <div className="person-list">
                {incomingRequests.map((r) => (
                  <div key={r.friendshipId} className="glass-card person-row">
                    <PersonAvatar profile={r.profile} />
                    <div className="person-info">
                      <strong>{r.profile.display_name}</strong>
                      {r.profile.university && <span>{r.profile.university}</span>}
                    </div>
                    <div className="person-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => acceptRequest(r.friendshipId)}
                        disabled={busyId === r.friendshipId}
                      >
                        Elfogadás
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => declineOrRemove(r.friendshipId, 'decline')}
                        disabled={busyId === r.friendshipId}
                      >
                        Elutasítás
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {outgoingRequests.length > 0 && (
            <section className="social-section">
              <h2>Küldött kérések</h2>
              <div className="person-list">
                {outgoingRequests.map((r) => (
                  <div key={r.friendshipId} className="glass-card person-row">
                    <PersonAvatar profile={r.profile} />
                    <div className="person-info">
                      <strong>{r.profile.display_name}</strong>
                      <span>Függőben…</span>
                    </div>
                    <button
                      className="btn btn-sm"
                      onClick={() => declineOrRemove(r.friendshipId, 'cancel')}
                      disabled={busyId === r.friendshipId}
                    >
                      Visszavonás
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="social-section">
            <h2>Ismerőseim</h2>
            {friends.length === 0 ? (
              <div className="glass-card empty-state">
                <p>Még nincs ismerősöd. Keress rá valakire fent a névvel.</p>
              </div>
            ) : (
              <div className="person-list">
                {friends.map((f) => (
                  <div key={f.friendshipId} className="glass-card person-row">
                    <PersonAvatar profile={f.profile} />
                    <div className="person-info">
                      <strong>{f.profile.display_name}</strong>
                      {f.profile.university && <span>{f.profile.university}</span>}
                    </div>
                    <button
                      className="btn btn-sm"
                      onClick={() => declineOrRemove(f.friendshipId, 'remove')}
                      disabled={busyId === f.friendshipId}
                    >
                      Eltávolítás
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}