import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { showSuccess, showError } from '../toast'

export const SignUp = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await signUp(email, password)

    setLoading(false)

    if (error) {
      showError(error.message)
    } else {
      showSuccess('Sikeres regisztráció!')
      navigate('/')
    }
  }

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle()
    if (error) showError(error.message)
  }

  return (
    <div>
      <h1>Regisztráció</h1>
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
          minLength={6}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Regisztráció...' : 'Regisztráció'}
        </button>
      </form>

      <div style={{ margin: '16px 0', textAlign: 'center' }}>vagy</div>

      <button onClick={handleGoogleSignIn} type="button">
        Regisztráció Google-lel
      </button>

      <p>Van már fiókod? <Link to="/login">Jelentkezz be</Link></p>
    </div>
  )
}