import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signIn(email, password)

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      navigate('/')
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) setError(error.message)
  }

  return (
    <div>
      <h1>Bejelentkezés</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Bejelentkezés...' : 'Bejelentkezés'}
        </button>
      </form>

      <div style={{ margin: '16px 0', textAlign: 'center' }}>vagy</div>

      <button onClick={handleGoogleSignIn} type="button">
        Bejelentkezés Google-lel
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>Nincs még fiókod? <Link to="/signup">Regisztrálj</Link></p>
    </div>
  )
}