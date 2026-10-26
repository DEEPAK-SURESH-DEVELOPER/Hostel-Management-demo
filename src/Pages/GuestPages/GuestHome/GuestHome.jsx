import FeaturedHostels from './FeaturedHostels/FeaturedHostels'
import GuestHeader from './GuestHeader/GuestHeader'
import GuestHero from './GuestHero/GuestHero'
import HowItWorks from './HowItWorks/HowItWorks'

import styles from './GuestHome.module.css'
import WhyHostelHub from './WhyHostelHub/WhyHostelHub'
import GuestCTA from './GuestCTA/GuestCTA'
import GuestFooter from './GuestFooter/GuestFooter'

const GuestHome = () => {
    return (
        <main className={styles.page}>
            <section className={styles.heroShell}>
                <GuestHeader />
                <GuestHero />
            </section>
            <FeaturedHostels />
            <WhyHostelHub />
            <HowItWorks />
            <GuestCTA/>
            <GuestFooter/>
        </main>
    )
}

export default GuestHome
