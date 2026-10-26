import { FaArrowRight, FaCheckCircle, FaSearch, FaPaperPlane } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import styles from './HowItWorks.module.css'

const steps = [
    {
        number: '01',
        icon: FaSearch,
        title: 'Explore hostels',
        description: 'Compare hostel details, facilities, and available rooms.'
    },
    {
        number: '02',
        icon: FaPaperPlane,
        title: 'Send a request',
        description: 'Choose a hostel and send your booking request to its owner.'
    },
    {
        number: '03',
        icon: FaCheckCircle,
        title: 'Get owner approval',
        description: 'The owner reviews your request. If approved, your stay is assigned.'
    }
]

const HowItWorks = () => (
    <section id="how-it-works" className={styles.section}>
        <div className={styles.container}>
            <div className={styles.heading}>
                <span className={styles.eyebrow}>A SIMPLE BOOKING JOURNEY</span>
                <h2>From discovery to move-in in three simple steps.</h2>
                <p>Know what to expect before you send a booking request.</p>
            </div>

            <div className={styles.steps}>
                {steps.map(({ number, icon: Icon, title, description }) => (
                    <article className={styles.step} key={number}>
                        <div className={styles.stepTop}>
                            <span className={styles.number}>{number}</span>
                            <span className={styles.icon}><Icon aria-hidden="true" /></span>
                        </div>
                        <div className={styles.stepCopy}>
                            <h3>{title}</h3>
                            <p>{description}</p>
                        </div>
                    </article>
                ))}
            </div>

            <Link to="/hostels" className={styles.cta}>
                Explore hostels <FaArrowRight aria-hidden="true" />
            </Link>
        </div>
    </section>
)

export default HowItWorks
