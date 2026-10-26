import React from 'react'
import { FaArrowRight, FaHotel } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import styles from './GuestCTA.module.css'

const GuestCTA = () => {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.icon}>
                        <FaHotel />
                    </div>

                    <span className={styles.eyebrow}>YOUR NEXT STAY AWAITS</span>

                    <h2>
                        Ready to find
                        <em> your place?</em>
                    </h2>

                    <p>
                        Explore approved hostels, check room availability and
                        send your booking request in just a few simple steps.
                    </p>

                    <div className={styles.actions}>
                        <Link to="/hostels" className={styles.primaryButton}>
                            Explore hostels
                            <FaArrowRight />
                        </Link>

                        <Link to="/login" className={styles.secondaryButton}>
                            Sign in
                        </Link>
                    </div>
                </div>

                <div className={styles.backgroundText}>
                    HOSTELHUB
                </div>

                <span className={`${styles.decor} ${styles.decorOne}`} />
                <span className={`${styles.decor} ${styles.decorTwo}`} />
            </div>
        </section>
    )
}

export default GuestCTA