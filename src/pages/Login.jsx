import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { showSuccess, showError } from '../toast'
import './Auth.css'

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M23.52 12.27c0-.82-.07-1.42-.22-2.05H12v3.72h6.62c-.13 1.1-.86 2.76-2.47 3.87l-.02.15 3.59 2.78.25.02c2.28-2.1 3.55-5.2 3.55-8.49Z" />
    <path fill="#34A853" d="M12 23.5c3.24 0 5.96-1.07 7.95-2.9l-3.79-2.95c-1.01.71-2.37 1.2-4.16 1.2-3.17 0-5.86-2.1-6.82-5h-3.92v3.05C3.23 20.92 7.26 23.5 12 23.5Z" />
    <path fill="#FBBC05" d="M5.18 13.85a6.9 6.9 0 0 1 0-4.4V6.4H1.26a11.5 11.5 0 0 0 0 10.5l3.92-3.05Z" />
    <path fill="#EA4335" d="M12 5.4c2.25 0 3.77.97 4.64 1.78l3.39-3.3C17.95 2.13 15.24 1 12 1 7.26 1 3.23 3.58 1.26 7.4l3.92 3.05c.96-2.9 3.65-5.05 6.82-5.05Z" />
  </svg>
)

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await signIn(email, password)

    setLoading(false)

    if (error) {
      showError(error.message)
    } else {
      showSuccess('Sikeres bejelentkezés!')
      navigate('/')
    }
  }

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle()
    if (error) showError(error.message)
  }

  return (
    <div className="auth-page">
      <div className="glass-card auth-card">
        <div className="auth-brand">
          <span className="auth-brand-icon">📅</span>
          <span>Órarend</span>
        </div>

        <h1>Üdv újra!</h1>
        <p className="auth-subtitle">Jelentkezz be a folytatáshoz.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="login-password">Jelszó</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Bejelentkezés…' : 'Bejelentkezés'}
          </button>
        </form>

        <div className="auth-divider">vagy</div>

        <button type="button" className="btn auth-google" onClick={handleGoogleSignIn}>
          <GoogleIcon />
          Bejelentkezés Google-lel
        </button>

        <p className="auth-footer">
          Nincs még fiókod? <Link to="/signup">Regisztrálj</Link>
        </p>
      </div>
    </div>
  )
}