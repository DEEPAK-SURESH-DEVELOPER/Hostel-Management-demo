import { useState } from 'react'
import { FaHotel, FaBars, FaTimes, FaArrowRight } from 'react-icons/fa'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import styles from './GuestHeader.module.css'

const GuestHeader = () => {
    const [menuOpen, setMenuOpen] = useState(false)
    const navigate = useNavigate()

    const closeMenu = () => {
        setMenuOpen(false)
    }

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link to="/" className={styles.logo} onClick={closeMenu}>
                    <div className={styles.logoIcon}>
                        <FaHotel />
                    </div>

                    <div className={styles.logoText}>
                        <span>HOSTEL</span>
                        <strong>HUB</strong>
                    </div>
                </Link>

                <nav className={`${styles.navigation} ${menuOpen ? styles.showMenu : ''}`}>
                    <NavLink
                        to="/"
                        end
                        onClick={closeMenu}
                        className={({ isActive }) =>
                            `${styles.navLink} ${isActive ? styles.active : ''}`
                        }
                    >
                        Home
                    </NavLink>

                    <NavLink
                        to="/hostels"
                        onClick={closeMenu}
                        className={({ isActive }) =>
                            `${styles.navLink} ${isActive ? styles.active : ''}`
                        }
                    >
                        Hostels
                    </NavLink>

                    <a
                        href="#how-it-works"
                        onClick={closeMenu}
                        className={styles.navLink}
                    >
                        How It Works
                    </a>

                    <a
                        href="#about"
                        onClick={closeMenu}
                        className={styles.navLink}
                    >
                        About
                    </a>
                </nav>

                <div className={styles.actions}>
                    <button
                        className={styles.loginButton}
                        onClick={() => navigate('/login')}
                    >
                        Login
                    </button>

                    <button
                        className={styles.partnerButton}
                        onClick={() => navigate('/owner-register')}
                    >
                        Become a Partner
                        <FaArrowRight />
                    </button>
                </div>

                <button
                    className={styles.menuButton}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle navigation"
                >
                    {menuOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>
        </header>
    )
}

export default GuestHeader
