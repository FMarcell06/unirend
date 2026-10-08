import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useSlidingIndicator } from './useSlidingIndicator'
import { showSuccess } from '../toast'
import { FaCalendarCheck } from 'react-icons/fa6'
import { MdLaptopMac } from 'react-icons/md'
import { IoPeople, IoSearch, IoMoon, IoSunny } from 'react-icons/io5'
import './Header.css'

const NAV_ITEMS = [
  { to: '/', label: 'Órarend', Icon: FaCalendarCheck },
  { to: '/courses', label: 'Kurzusok', Icon: MdLaptopMac },
  { to: '/common', label: 'Közös', Icon: IoPeople },
  { to: '/social', label: 'Ismerősök', Icon: IoSearch },
]

export const Header = () => {
  const { user, profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const desktopNav = useSlidingIndicator(NAV_ITEMS, location.pathname, (item) => item.to)
  const mobileNav = useSlidingIndicator(NAV_ITEMS, location.pathname, (item) => item.to)

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
          <Link to="/" className="header-logo">
            <FaCalendarCheck /> Órarend
          </Link>

          <nav className="header-nav desktop-only" ref={desktopNav.containerRef}>
            <span className="nav-indicator" style={desktopNav.style} />
            {NAV_ITEMS.map((item, i) => (
              <Link
                key={item.to}
                to={item.to}
                ref={(el) => (desktopNav.itemRefs.current[i] = el)}
                className={`nav-link ${location.pathname === item.to ? 'active' : ''}`}
              >
                {item.label}
              </Link>
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
        </div>
      </header>

      {/* Alsó tab-bar – csak mobilon látszik */}
      <nav className="bottom-nav" ref={mobileNav.containerRef}>
        <span className="nav-indicator bottom-indicator" style={mobileNav.style} />
        {NAV_ITEMS.map((item, i) => (
          <Link
            key={item.to}
            to={item.to}
            ref={(el) => (mobileNav.itemRefs.current[i] = el)}
            className={`bottom-nav-item ${location.pathname === item.to ? 'active' : ''}`}
          >
            <item.Icon className="bottom-nav-icon" />
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}