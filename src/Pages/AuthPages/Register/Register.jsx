import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getAllUsersAPI, registerUserAPI } from '../../../Services/allAPI'
import styles from './Register.module.css'

const Register = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    const {
      name,
      email,
      password,
      confirmPassword,
      phone
    } = formData

    if (!name || !email || !password || !confirmPassword || !phone) {
      toast.error('Please fill all fields')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must contain at least 6 characters')
      return
    }

    if (phone.length !== 10) {
      toast.error('Enter a valid 10 digit phone number')
      return
    }

    try {
      setLoading(true)

      const response = await getAllUsersAPI()
      const users = response.data

      const existingUser = users.find(
        user => user.email.toLowerCase() === email.toLowerCase()
      )

      if (existingUser) {
        toast.error('Email already registered')
        return
      }

      const userData = {
        name,
        email,
        password,
        role: 'user',
        phone,
        status: 'active'
      }

      await registerUserAPI(userData)

      toast.success('Registration successful')

      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: ''
      })

      navigate('/login')

    } catch (error) {
      console.log(error)
      toast.error('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.registerPage}>
      <div className={styles.registerLayout}>
        <section className={styles.welcomePanel} aria-label="Join HostelHub">
          <span className={styles.welcomeEyebrow}>YOUR NEXT CHAPTER STARTS HERE</span>
          <h1>A better stay begins with a simple step.</h1>
          <p>
            Create your resident account to explore welcoming hostels and request the stay that feels right for you.
          </p>
          <div className={styles.welcomeNote}>
            <span className={styles.noteDot} />
            Your HostelHub account, all in one place.
          </div>
        </section>

        <section className={styles.registerCard} aria-labelledby="register-title">
          <div className={styles.logo}>
            <span className={styles.brandMark} aria-hidden="true">H</span>
            <div>
              <h2 id="register-title">Create your account</h2>
              <p>Join HostelHub as a resident</p>
            </div>
          </div>

          <div className={styles.formIntro}>
            <span>YOUR DETAILS</span>
            <p>Fill in the information below to get started.</p>
          </div>

          <form onSubmit={handleRegister}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="register-name">Full name</label>
                <input
                  id="register-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="register-phone">Phone number</label>
                <input
                  id="register-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10 digit phone number"
                  maxLength="10"
                  autoComplete="tel"
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label htmlFor="register-email">Email address</label>
                <input
                  id="register-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="register-password">Password</label>
                <input
                  id="register-password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="register-confirm-password">Confirm password</label>
                <input
                  id="register-confirm-password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Enter it once more"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button className={styles.submitButton} type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create resident account'}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <div className={styles.loginText}>
            <p>
              Already have an account?
              <button type="button" onClick={() => navigate('/login')}>
                Sign in
              </button>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Register
