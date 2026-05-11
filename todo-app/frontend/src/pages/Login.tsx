import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import styles from './PagePlaceholder.module.css'
import { login } from '../services/authService'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    const performLogin = async () => {
      try {
        setIsLoading(true)
        await login({ email, password })
        navigate(redirectTo, { replace: true })
      } catch (loginError) {
        setError(loginError instanceof Error ? loginError.message : 'Failed to sign in')
      } finally {
        setIsLoading(false)
      }
    }

    void performLogin()
  }

  return (
    <div className={styles.authShell}>
      <main className={styles.authPage}>
        <div className={styles.authContainer}>
          <div className={styles.authHeader}>
            <h1 className={styles.title}>Sign In</h1>
            <p className={styles.subtitle}>Welcome back to Todo App</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {error && (
              <div className={styles.errorMessage}>
                <p>{error}</p>
              </div>
            )}

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={styles.fieldInput}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className={styles.fieldInput}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className={styles.primaryButton}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className={styles.authFooter}>
            <p>
              Don't have an account?{' '}
              <Link to="/register" className={styles.authLink}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
