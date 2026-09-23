import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Header.css'

export const Header = () => {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  if (!user) return null // bejelentkezés nélkül ne jelenjen meg

  return (
    <header className="app-header">
      <div className="header-left">
        <Link to="/" className="header-logo">📅 Órarend</Link>
        <nav className="header-nav">
          <Link to="/">Órarend</Link>
          <Link to="/add-course">Új kurzus</Link>
          <Link to="/courses">Kurzusaim</Link>
          <Link to="/social">Ismerősök</Link>
        </nav>
      </div>

      <div className="header-right">
        <Link to="/profile" className="header-profile">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Profil" className="header-avatar" />
          ) : (
            <div className="header-avatar-placeholder" />
          )}
          <span>{profile?.display_name || user.email}</span>
        </Link>
        <button onClick={handleSignOut} className="header-signout">Kijelentkezés</button>
      </div>
    </header>
  )
}