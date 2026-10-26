import { useEffect, useMemo } from 'react'
import { FaArrowRight, FaBed, FaMapMarkerAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchHostels } from '../../../../Redux/Slices/hostelSlice'
import { fetchRooms } from '../../../../Redux/Slices/roomSlice'
import SpotlightCard from '../../../../Components/ReactBits/SpotlightCard/SpotlightCard'
import styles from './FeaturedHostels.module.css'

const FeaturedHostels = () => {
    const dispatch = useDispatch()

    const { hostels, loading: hostelLoading } = useSelector(
        state => state.hostels
    )

    const { rooms, loading: roomLoading } = useSelector(
        state => state.rooms
    )

    useEffect(() => {
        dispatch(fetchHostels())
        dispatch(fetchRooms())
    }, [dispatch])

    const featuredHostels = useMemo(() => {
        return hostels
            .filter(hostel => hostel.status === 'approved')
            .slice(0, 3)
            .map(hostel => {
                const hostelRooms = rooms.filter(
                    room => String(room.hostelId) === String(hostel.id)
                )

                const availableRooms = hostelRooms.filter(
                    room => Number(room.availableBeds) > 0
                )

                const availableBeds = availableRooms.reduce(
                    (total, room) => total + Number(room.availableBeds || 0),
                    0
                )

                const prices = hostelRooms
                    .map(room => Number(room.price || 0))
                    .filter(price => price > 0)

                const lowestPrice = prices.length
                    ? Math.min(...prices)
                    : 0

                return {
                    ...hostel,
                    availableRooms: availableRooms.length,
                    availableBeds,
                    lowestPrice
                }
            })
    }, [hostels, rooms])

    const loading = hostelLoading || roomLoading

    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <div className={styles.heading}>
                    <span className={styles.eyebrow}>EXPLORE HOSTELS</span>

                    <h2>
                        Find your <em>perfect stay.</em>
                    </h2>

                    <p>
                        Comfortable spaces, great facilities and rooms ready for you.
                    </p>
                </div>

                <Link to="/hostels" className={styles.viewAll}>
                    View all
                    <FaArrowRight />
                </Link>
            </div>

            {loading ? (
                <div className={styles.loading}>
                    <span />
                    <span />
                    <span />
                </div>
            ) : featuredHostels.length > 0 ? (
                <div className={styles.hostelGrid}>
                    {featuredHostels.map(hostel => (
                        <SpotlightCard
                            key={hostel.id}
                            className={styles.hostelCard}
                            spotlightColor="rgba(215, 133, 52, 0.16)"
                        >
                            <div className={styles.cardImage}>
                                {hostel.image ? (
                                    <img
                                        src={hostel.image}
                                        alt={hostel.name}
                                    />
                                ) : (
                                    <div className={styles.imagePlaceholder}>
                                        <FaMapMarkerAlt />
                                        <span>HOSTEL HUB</span>
                                    </div>
                                )}

                                <div
                                    className={`${styles.status} ${
                                        hostel.availableBeds === 0
                                            ? styles.full
                                            : ''
                                    }`}
                                >
                                    <span />
                                    {hostel.availableBeds > 0
                                        ? 'Available'
                                        : 'Full'}
                                </div>
                            </div>

                            <div className={styles.cardBody}>
                                <div className={styles.location}>
                                    <FaMapMarkerAlt />
                                    <span>{hostel.location}</span>
                                </div>

                                <h3>{hostel.name}</h3>

                                <p className={styles.description}>
                                    {hostel.description ||
                                        'Comfortable accommodation with essential facilities.'}
                                </p>

                                {hostel.facilities?.length > 0 && (
                                    <div className={styles.facilities}>
                                        {hostel.facilities
                                            .slice(0, 3)
                                            .map((facility, index) => (
                                                <span key={index}>
                                                    {facility}
                                                </span>
                                            ))}

                                        {hostel.facilities.length > 3 && (
                                            <span>
                                                +{hostel.facilities.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className={styles.details}>
                                    <div className={styles.beds}>
                                        <div className={styles.iconBox}>
                                            <FaBed />
                                        </div>

                                        <div>
                                            <strong>
                                                {hostel.availableBeds}
                                            </strong>
                                            <span>beds available</span>
                                        </div>
                                    </div>

                                    <div className={styles.price}>
                                        <span>Starting from</span>
                                        <strong>
                                            ₹{hostel.lowestPrice.toLocaleString()}
                                        </strong>
                                        <small>/month</small>
                                    </div>
                                </div>

                                <div className={styles.cardFooter}>
                                    <span>
                                        {hostel.availableRooms} rooms available
                                    </span>

                                    <Link
                                        to="/hostels"
                                        className={styles.cardButton}
                                    >
                                        View hostel
                                        <FaArrowRight />
                                    </Link>
                                </div>
                            </div>
                        </SpotlightCard>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <span>No hostels available right now.</span>

                    <Link to="/hostels">
                        Explore hostels
                        <FaArrowRight />
                    </Link>
                </div>
            )}
        </section>
    )
}

export default FeaturedHostels
