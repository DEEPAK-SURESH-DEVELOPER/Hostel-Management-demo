import React, { useEffect, useMemo } from 'react'
import {
    FaBuilding,
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
    FaUser,
    FaCheckCircle,
    FaWifi,
    FaParking,
    FaUtensils,
    FaTshirt,
    FaArrowLeft
} from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchUsers } from '../../../Redux/Slices/userSlice'
import { fetchHostels } from '../../../Redux/Slices/hostelSlice'
import styles from './UserHostel.module.css'

const UserHostel = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { users } = useSelector(state => state.users)
    const { hostels } = useSelector(state => state.hostels)

    const loggedInUser = JSON.parse(
        localStorage.getItem('hostelHubUser')
    )

    const userId = loggedInUser?.id

    useEffect(() => {
        dispatch(fetchUsers())
        dispatch(fetchHostels())
    }, [dispatch])

    const user = useMemo(() => {
        return users.find(
            item => String(item.id) === String(userId)
        )
    }, [users, userId])

    const userHostel = useMemo(() => {
        return hostels.find(
            hostel =>
                String(hostel.id) ===
                String(user?.hostelId)
        )
    }, [hostels, user])

    const owner = useMemo(() => {
        if (!userHostel?.ownerId) {
            return null
        }

        return users.find(
            item =>
                String(item.id) ===
                String(userHostel.ownerId)
        )
    }, [users, userHostel])

    const getFacilityIcon = facility => {
        const value = facility.toLowerCase()

        if (value.includes('wifi')) {
            return <FaWifi />
        }

        if (value.includes('parking')) {
            return <FaParking />
        }

        if (
            value.includes('food') ||
            value.includes('meal')
        ) {
            return <FaUtensils />
        }

        if (value.includes('laundry')) {
            return <FaTshirt />
        }

        return <FaCheckCircle />
    }

    if (!userHostel) {
        return (
            <div className={styles.emptyPage}>
                <div className={styles.emptyIcon}>
                    <FaBuilding />
                </div>

                <h2>Hostel Not Assigned</h2>

                <p>
                    You have not been assigned to a hostel yet.
                    Please contact your hostel administrator.
                </p>

                <button
                    onClick={() => navigate('/user')}
                >
                    <FaArrowLeft />
                    Back to Dashboard
                </button>
            </div>
        )
    }

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <span className={styles.eyebrow}>
                        MY HOSTEL
                    </span>

                    <h2>{userHostel.name}</h2>

                   
                </div>

                <div className={styles.status}>
                    <FaCheckCircle />
                    {userHostel.status}
                </div>
            </div>

            <section className={styles.heroCard}>
                <div className={styles.heroImage}>
                    {userHostel.image ? (
                        <img
                            src={userHostel.image}
                            alt={userHostel.name}
                        />
                    ) : (
                        <FaBuilding />
                    )}
                </div>

                <div className={styles.heroContent}>
                    <span className={styles.cardLabel}>
                        YOUR CURRENT HOSTEL
                    </span>

                    <h3>{userHostel.name}</h3>

                    <div className={styles.location}>
                        <FaMapMarkerAlt />

                        <span>
                            {userHostel.address ||
                                userHostel.location ||
                                'Location not available'}
                        </span>
                    </div>

                    <p>
                        {userHostel.description ||
                            'No description available for this hostel.'}
                    </p>
                </div>
            </section>

            <div className={styles.contentGrid}>
                <section className={styles.infoCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.headerIcon}>
                            <FaBuilding />
                        </div>

                        <div>
                            <span>HOSTEL INFORMATION</span>
                            <h3>About Your Hostel</h3>
                        </div>
                    </div>

                    <div className={styles.detailsGrid}>
                        <div className={styles.detailItem}>
                            <span>Hostel Name</span>
                            <strong>
                                {userHostel.name}
                            </strong>
                        </div>

                        <div className={styles.detailItem}>
                            <span>Location</span>
                            <strong>
                                {userHostel.location ||
                                    'Not available'}
                            </strong>
                        </div>

                        <div className={styles.detailItem}>
                            <span>Address</span>
                            <strong>
                                {userHostel.address ||
                                    'Not available'}
                            </strong>
                        </div>

                        <div className={styles.detailItem}>
                            <span>Status</span>
                            <strong className={styles.approved}>
                                {userHostel.status}
                            </strong>
                        </div>
                    </div>
                </section>

                <section className={styles.ownerCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.headerIcon}>
                            <FaUser />
                        </div>

                        <div>
                            <span>HOSTEL MANAGEMENT</span>
                            <h3>Owner Details</h3>
                        </div>
                    </div>

                    {owner ? (
                        <div className={styles.ownerDetails}>
                            <div className={styles.ownerAvatar}>
                                {owner.name
                                    ?.charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div className={styles.ownerInfo}>
                                <h4>{owner.name}</h4>

                                <span>
                                    Hostel Owner
                                </span>

                                <div
                                    className={
                                        styles.contactItem
                                    }
                                >
                                    <FaEnvelope />
                                    <span>
                                        {owner.email}
                                    </span>
                                </div>

                                <div
                                    className={
                                        styles.contactItem
                                    }
                                >
                                    <FaPhone />
                                    <span>
                                        {owner.phone ||
                                            'Phone not available'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.noOwner}>
                            <FaUser />

                            <p>
                                Owner information is not
                                available.
                            </p>
                        </div>
                    )}
                </section>
            </div>

            <section className={styles.facilityCard}>
                <div className={styles.cardHeader}>
                    <div className={styles.headerIcon}>
                        <FaCheckCircle />
                    </div>

                    <div>
                        <span>HOSTEL FACILITIES</span>
                        <h3>Available Facilities</h3>
                    </div>
                </div>

                {userHostel.facilities?.length > 0 ? (
                    <div className={styles.facilityGrid}>
                        {userHostel.facilities.map(
                            (facility, index) => (
                                <div
                                    className={styles.facilityItem}
                                    key={index}
                                >
                                    <div
                                        className={
                                            styles.facilityIcon
                                        }
                                    >
                                        {getFacilityIcon(
                                            facility
                                        )}
                                    </div>

                                    <span>{facility}</span>
                                </div>
                            )
                        )}
                    </div>
                ) : (
                    <div className={styles.noFacilities}>
                        No facilities have been listed for this
                        hostel.
                    </div>
                )}
            </section>

            <section className={styles.contactBanner}>
                <div className={styles.contactBannerIcon}>
                    <FaPhone />
                </div>

                <div>
                    <span>NEED HELP?</span>

                    <h3>
                        Contact your hostel owner
                    </h3>

                    <p>
                        For hostel-related issues, room
                        concerns or other assistance, contact
                        your hostel management.
                    </p>
                </div>

                {owner?.phone && (
                    <a
                        href={`tel:${owner.phone}`}
                        className={styles.contactButton}
                    >
                        <FaPhone />
                        Call Owner
                    </a>
                )}
            </section>
        </div>
    )
}

export default UserHostel