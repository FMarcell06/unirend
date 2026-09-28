import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { showSuccess } from '../toast'
import { FaCalendarCheck } from "react-icons/fa6";
import { MdLaptopMac } from "react-icons/md";
import { IoPeople } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import { IoMoon } from "react-icons/io5";
import { IoSunny } from "react-icons/io5";
import './Header.css'

const NAV_ITEMS = [
  { to: '/', label: 'Órarend', icon: <FaCalendarCheck /> },
  { to: '/courses', label: 'Kurzusok', icon:  <MdLaptopMac />},
  { to: '/common', label: 'Közös', icon: <IoPeople /> },
  { to: '/social', label: 'Ismerősök', icon: <IoSearch /> },
]

export const Header = () => {
  const { user, profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
    showSuccess('Sikeres kijelentkezés!')
    navigate('/login')
  }

  if (!user) return null

  return (
    <>
      {/* Felső sáv – mindig látszik */}
      <header className="app-header">
        <div className="header-left">
          <Link to="/" className="header-logo"><FaCalendarCheck /> Órarend</Link>
          <nav className="header-nav desktop-only">
            {NAV_ITEMS.map((item) => (
              <Link key={item.to} to={item.to}>{item.label}</Link>
            ))}
          </nav>
        </div>

        <div className="header-right">
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Téma váltása">
            {theme === 'light' ? <IoMoon /> : <IoSunny />}
          </button>
          <Link to="/profile" className="header-profile">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profil" className="header-avatar" />
            ) : (
              <div className="header-avatar-placeholder" />
            )}
            <span className="desktop-only">{profile?.display_name || user.email}</span>
          </Link>
          <button onClick={handleSignOut} className="header-signout desktop-only">Kijelentkezés</button>
        </div>
      </header>

      {/* Alsó tab-bar – csak mobilon látszik */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`bottom-nav-item ${location.pathname === item.to ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}