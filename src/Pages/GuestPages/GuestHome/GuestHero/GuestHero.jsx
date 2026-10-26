import { FaArrowRight, FaBed, FaShieldAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import FoldText from '../../../../Components/ReactBits/FoldText/FoldText'
import styles from './GuestHero.module.css'

const GuestHero = () => (
    <section className={styles.hero} aria-labelledby="guest-hero-title">
        <div className={styles.heroContainer}>
            <div className={styles.heroContent}>
                <div className={styles.eyebrow}>
                    <span className={styles.eyebrowDot} />
                    A better place to begin
                </div>

                <h1 id="guest-hero-title" className={styles.heroTitle}>
                    <span className={styles.titleLine}>
                        <FoldText
                            text="Find your"
                            splitBy="char"
                            hinge="top"
                            trigger="mount"
                            duration={0.65}
                            stagger={0.035}
                            ease="power3.out"
                            perspective={700}
                            creaseShading={0.3}
                            fontSize="clamp(3.25rem, 7.8vw, 7rem)"
                            fontWeight={750}
                            color="#fff8ef"
                        />
                    </span>
                    <span className={styles.titleLine}>
                        <FoldText
                            text="next stay."
                            splitBy="char"
                            hinge="top"
                            trigger="mount"
                            duration={0.72}
                            stagger={0.045}
                            ease="power3.out"
                            perspective={700}
                            creaseShading={0.35}
                            fontSize="clamp(3.25rem, 7.8vw, 7rem)"
                            fontWeight={750}
                            color="#e8b968"
                        />
                    </span>
                </h1>

                <p className={styles.description}>
                    Discover welcoming hostels, compare available rooms, and send a booking request directly to the owner.
                </p>

                <div className={styles.heroActions}>
                    <Link to="/hostels" className={styles.primaryButton}>
                        Explore hostels <FaArrowRight />
                    </Link>
                    <Link to="/register" className={styles.secondaryButton}>
                        Create an account
                    </Link>
                </div>

                <div className={styles.bottomNote}>
                    <span><FaShieldAlt /> Owner-reviewed hostels</span>
                    <span className={styles.noteDivider} />
                    <span><FaBed /> Current room availability</span>
                </div>
            </div>

            <aside className={styles.sideNote} aria-hidden="true">
                <span>ROOM TO FEEL AT HOME</span>
                <span className={styles.sideNoteLine} />
                <span>YOUR NEXT CHAPTER STARTS HERE</span>
            </aside>
        </div>
    </section>
)

export default GuestHero
