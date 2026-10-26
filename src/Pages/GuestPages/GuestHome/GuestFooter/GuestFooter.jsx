import React from 'react'
import { FaHotel, FaInstagram, FaFacebookF, FaTwitter, FaArrowUp } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import styles from './GuestFooter.module.css'

const GuestFooter = () => {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    return (
        <footer className={styles.footer} id="about">
            <div className={styles.container}>
                <div className={styles.main}>
                    <div className={styles.brand}>
                        <Link to="/" className={styles.logo}>
                            <div className={styles.logoIcon}>
                                <FaHotel />
                            </div>

                            <div className={styles.logoText}>
                                <span>HOSTEL</span>
                                <strong>HUB</strong>
                            </div>
                        </Link>

                        <p>
                            A simpler way to discover hostels, compare rooms
                            and find a place that feels like home.
                        </p>

                        <div className={styles.socials}>
                            <a href="#" aria-label="Instagram">
                                <FaInstagram />
                            </a>

                            <a href="#" aria-label="Facebook">
                                <FaFacebookF />
                            </a>

                            <a href="#" aria-label="Twitter">
                                <FaTwitter />
                            </a>
                        </div>
                    </div>

                    <div className={styles.linksColumn}>
                        <span className={styles.columnTitle}>EXPLORE</span>

                        <Link to="/">Home</Link>
                        <Link to="/hostels">Hostels</Link>
                        <a href="#how-it-works">How It Works</a>
                        <a href="#about">About Us</a>
                    </div>

                    <div className={styles.linksColumn}>
                        <span className={styles.columnTitle}>ACCOUNT</span>

                        <Link to="/login">Login</Link>
                        <Link to="/register">Create Account</Link>
                        <Link to="/hostels">Find a Hostel</Link>
                    </div>

                    <div className={styles.contactColumn}>
                        <span className={styles.columnTitle}>GET IN TOUCH</span>

                        <a href="mailto:hello@hostelhub.com">
                            hello@hostelhub.com
                        </a>

                        <a href="tel:+919876543210">
                            +91 98765 43210
                        </a>

                        <p>
                            Kerala, India
                        </p>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>
                        © {new Date().getFullYear()} HostelHub. All rights reserved.
                    </p>

                    <div className={styles.bottomLinks}>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms & Conditions</a>
                    </div>

                    <button
                        className={styles.topButton}
                        onClick={scrollToTop}
                        aria-label="Back to top"
                    >
                        <FaArrowUp />
                    </button>
                </div>
            </div>
        </footer>
    )
}

export default GuestFooter