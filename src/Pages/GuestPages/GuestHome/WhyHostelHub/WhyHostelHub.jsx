import { FaCheckCircle, FaBed, FaComments, FaSearch } from 'react-icons/fa'
import BlurText from '../../../../Components/ReactBits/BlurText/BlurText'
import styles from './WhyHostelHub.module.css'

const WhyHostelHub = () => {
    const benefits = [
        {
            number: '01',
            icon: <FaCheckCircle />,
            title: 'Verified Hostels',
            description: 'Browse approved hostels you can trust.'
        },
        {
            number: '02',
            icon: <FaBed />,
            title: 'Live Availability',
            description: 'See available rooms and beds before you request.'
        },
        {
            number: '03',
            icon: <FaComments />,
            title: 'Direct Requests',
            description: 'Send your booking request directly to the owner.'
        },
        {
            number: '04',
            icon: <FaSearch />,
            title: 'Simple Experience',
            description: 'Explore, compare and request from one place.'
        }
    ]

    return (
        <section id="about" className={styles.section}>
            <div className={styles.container}>
                <div className={styles.heading}>
                    <span className={styles.eyebrow}>WHY HOSTEL HUB</span>

                    <BlurText
                        text="Everything you need to find the right stay."
                        delay={80}
                        animateBy="words"
                        direction="top"
                        effect="blur"
                        trigger="view"
                        blur={10}
                        distance={32}
                        stepDuration={0.45}
                        className={styles.title}
                    />

                    <p className={styles.description}>
                        A simpler way to discover hostels, check availability
                        and connect with the right owner.
                    </p>
                </div>

                <div className={styles.benefits}>
                    {benefits.map(benefit => (
                        <article
                            key={benefit.number}
                            className={styles.benefit}
                        >
                            <div className={styles.top}>
                                <span className={styles.number}>
                                    {benefit.number}
                                </span>

                                <span className={styles.icon}>
                                    {benefit.icon}
                                </span>
                            </div>

                            <div className={styles.content}>
                                <h3>{benefit.title}</h3>
                                <p>{benefit.description}</p>
                            </div>

                            <span className={styles.line} />
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default WhyHostelHub
