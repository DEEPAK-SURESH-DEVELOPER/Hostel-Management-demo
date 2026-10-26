import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getAllUsersAPI } from '../../../Services/allAPI'
import styles from './Login.module.css'

const Login = () => {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Please enter email and password')
      return
    }

    try {
      setLoading(true)

      const response = await getAllUsersAPI()
      const users = response.data

      const user = users.find(
        item =>
          item.email === email &&
          item.password === password
      )

      if (!user) {
        toast.error('Invalid email or password')
        return
      }

      if (user.status !== 'active') {
        if (user.role === 'owner' && user.status === 'pending') {
          toast.error('Your owner registration is waiting for admin approval')
        } else if (user.role === 'owner' && user.status === 'rejected') {
          toast.error('Your owner registration was not approved')
        } else {
          toast.error('Your account is inactive')
        }
        return
      }

      localStorage.setItem(
        'hostelHubUser',
        JSON.stringify(user)
      )

      toast.success(`Welcome ${user.name}`)

      if (user.role === 'admin') {
        navigate('/admin')
      } else if (user.role === 'owner') {
        navigate('/owner')
      } else if (user.role === 'user') {
        navigate('/user')
      } else {
        toast.error('Invalid user role')
      }

    } catch (error) {
      console.log(error)
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginLayout}>
        <section className={styles.welcomePanel} aria-label="Welcome to HostelHub">
          <span className={styles.welcomeEyebrow}>A BETTER PLACE TO BEGIN</span>
          <h1>Find your place to feel at home.</h1>
          <p>
            Sign in to explore your HostelHub space and continue your stay journey.
          </p>
          <div className={styles.welcomeNote}>
            <span className={styles.noteDot} />
            Thoughtful stays. A simpler way to settle in.
          </div>
        </section>

        <section className={styles.loginCard} aria-labelledby="login-title">
          <div className={styles.logo}>
            <span className={styles.brandMark} aria-hidden="true">H</span>
            <div>
              <h2 id="login-title">Welcome back</h2>
              <p>Sign in to your HostelHub account</p>
            </div>
          </div>

          <div className={styles.formIntro}>
            <span>YOUR ACCOUNT</span>
            <p>Enter your details to continue.</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Sign in to HostelHub'}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <div className={styles.registerText}>
            <p>
              New to HostelHub?
              <button type="button" onClick={() => navigate('/register')}>
                Create an account
              </button>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Login
