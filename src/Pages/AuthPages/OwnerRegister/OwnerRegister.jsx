import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getAllUsersAPI, registerUserAPI } from '../../../Services/allAPI'
import styles from './OwnerRegister.module.css'

const initialForm = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
}

const OwnerRegister = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState(initialForm)
    const [loading, setLoading] = useState(false)

    const handleChange = event => {
        const { name, value } = event.target
        setFormData(current => ({ ...current, [name]: value }))
    }

    const handleRegister = async event => {
        event.preventDefault()

        const name = formData.name.trim()
        const email = formData.email.trim()
        const phone = formData.phone.trim()

        if (!name || !email || !phone || !formData.password || !formData.confirmPassword) {
            toast.error('Please fill all fields')
            return
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            toast.error('Enter a valid email address')
            return
        }

        if (!/^\d{10}$/.test(phone)) {
            toast.error('Enter a valid 10 digit phone number')
            return
        }

        if (formData.password.length < 6) {
            toast.error('Password must contain at least 6 characters')
            return
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        try {
            setLoading(true)
            const response = await getAllUsersAPI()
            const users = response.data
            const existingUser = users.find(
                user => String(user.email || '').toLowerCase() === email.toLowerCase()
            )

            if (existingUser) {
                toast.error('Email already registered')
                return
            }

            await registerUserAPI({
                name,
                email,
                phone,
                password: formData.password,
                role: 'owner',
                status: 'pending'
            })

            setFormData(initialForm)
            toast.success('Owner application submitted for admin approval')
            navigate('/login')
        } catch (error) {
            console.error(error)
            toast.error('Could not submit your application. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className={styles.page}>
            <div className={styles.layout}>
                <section className={styles.welcome} aria-label="Become a HostelHub partner">
                    <span className={styles.eyebrow}>HOSTELHUB PARTNERS</span>
                    <h1>Bring your hostel to a wider community.</h1>
                    <p>
                        Create an owner account to join HostelHub. An administrator
                        will review your application before you can access the owner panel.
                    </p>
                    <div className={styles.note}>
                        <span /> Owner accounts are activated after approval.
                    </div>
                </section>

                <section className={styles.card} aria-labelledby="owner-register-title">
                    <div className={styles.cardHeader}>
                        <span className={styles.brandMark} aria-hidden="true">H</span>
                        <div>
                            <h2 id="owner-register-title">Partner application</h2>
                            <p>Register your owner account</p>
                        </div>
                    </div>

                    <div className={styles.formIntro}>
                        <span>OWNER DETAILS</span>
                        <p>Use the contact details you want associated with your account.</p>
                    </div>

                    <form onSubmit={handleRegister}>
                        <div className={styles.formGrid}>
                            <div className={styles.field}>
                                <label htmlFor="owner-name">Full name</label>
                                <input id="owner-name" name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" autoComplete="name" />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="owner-phone">Phone number</label>
                                <input id="owner-phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="10 digit phone number" maxLength={10} autoComplete="tel" />
                            </div>
                            <div className={`${styles.field} ${styles.fullWidth}`}>
                                <label htmlFor="owner-email">Email address</label>
                                <input id="owner-email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="owner-password">Password</label>
                                <input id="owner-password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="At least 6 characters" autoComplete="new-password" />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="owner-confirm-password">Confirm password</label>
                                <input id="owner-confirm-password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Enter it once more" autoComplete="new-password" />
                            </div>
                        </div>

                        <button className={styles.submitButton} type="submit" disabled={loading}>
                            {loading ? 'Submitting application...' : 'Submit for approval'}
                            {!loading && <span aria-hidden="true">→</span>}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        <p>Already have an account?</p>
                        <button type="button" onClick={() => navigate('/login')}>Sign in</button>
                        <span className={styles.footerDivider}>·</span>
                        <button type="button" onClick={() => navigate('/register')}>Resident sign up</button>
                    </div>
                </section>
            </div>
        </main>
    )
}

export default OwnerRegister
