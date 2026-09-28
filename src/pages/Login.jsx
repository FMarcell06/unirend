import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { showSuccess, showError } from '../toast'

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

      <p>Nincs még fiókod? <Link to="/signup">Regisztrálj</Link></p>
    </div>
  )
}