import { useLayoutEffect, useRef, useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
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

// a kapszulát csúsztatja az aktív link mögé, a link tényleges méretei alapján
const useSlidingIndicator = (activeKey) => {
  const containerRef = useRef(null)
  const itemRefs = useRef([])
  const [style, setStyle] = useState({ opacity: 0 })

  const measure = () => {
    const index = NAV_ITEMS.findIndex((item) => item.to === activeKey)
    const el = itemRefs.current[index]
    const container = containerRef.current
    if (!el || !container) {
      setStyle({ opacity: 0 })
      return
    }

    const elRect = el.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    setStyle({
      opacity: 1,
      width: elRect.width,
      transform: `translateX(${elRect.left - containerRect.left}px)`,
    })
  }

  useLayoutEffect(() => {
    measure()
  }, [activeKey])

  useEffect(() => {
    // ablakméret-váltáskor (vagy mobilon elforgatáskor) újraméri a kapszulát,
    // animáció nélkül ugrik a helyére, hogy ne "csússzon" feleslegesen
    const onResize = () => {
      const el = document.documentElement
      el.classList.add('nav-resizing')
      measure()
      requestAnimationFrame(() => {
        requestAnimationFrame(() => el.classList.remove('nav-resizing'))
      })
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [activeKey])

  return { containerRef, itemRefs, style }
}

export const Header = () => {
  const { user, profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const desktopNav = useSlidingIndicator(location.pathname)
  const mobileNav = useSlidingIndicator(location.pathname)

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