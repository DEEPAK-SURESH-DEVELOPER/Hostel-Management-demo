import React, { useEffect, useMemo } from 'react'
import {
    FaDoorOpen,
    FaBuilding,
    FaMapMarkerAlt,
    FaUser,
    FaUsers,
    FaBed,
    FaRupeeSign,
    FaCheckCircle,
    FaPhone,
    FaEnvelope,
    FaArrowLeft,
    FaHome
} from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchUsers } from '../../../Redux/Slices/userSlice'
import { fetchRooms } from '../../../Redux/Slices/roomSlice'
import { fetchHostels } from '../../../Redux/Slices/hostelSlice'
import styles from './UserRoom.module.css'

const UserRoom = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { users } = useSelector(state => state.users)
    const { rooms } = useSelector(state => state.rooms)
    const { hostels } = useSelector(state => state.hostels)

    const loggedInUser = JSON.parse(localStorage.getItem('hostelHubUser'))
    const userId = loggedInUser?.id

    useEffect(() => {
        dispatch(fetchUsers())
        dispatch(fetchRooms())
        dispatch(fetchHostels())
    }, [dispatch])

    const user = useMemo(() => {
        return users.find(item => String(item.id) === String(userId))
    }, [users, userId])

    const userRoom = useMemo(() => {
        return rooms.find(
            room => String(room.id) === String(user?.roomId)
        )
    }, [rooms, user])

    const userHostel = useMemo(() => {
        return hostels.find(
            hostel => String(hostel.id) === String(userRoom?.hostelId)
        )
    }, [hostels, userRoom])

    const owner = useMemo(() => {
        if (!userHostel?.ownerId) return null

        return users.find(
            item => String(item.id) === String(userHostel.ownerId)
        )
    }, [users, userHostel])

    const roomResidents = useMemo(() => {
        if (!userRoom?.id) return []

        return users.filter(
            item =>
                String(item.roomId) === String(userRoom.id) &&
                item.status === 'active' &&
                item.role === 'user'
        )
    }, [users, userRoom])

    const occupiedBeds = roomResidents.length

    const availableBeds = userRoom
        ? Math.max(Number(userRoom.capacity) - occupiedBeds, 0)
        : 0

    if (!userRoom) {
        return (
            <div className={styles.emptyPage}>
                <div className={styles.emptyIcon}>
                    <FaDoorOpen />
                </div>

                <h2>No Room Assigned</h2>

                <p>
                    You have not been assigned a room yet.
                    Please contact your hostel owner for room assignment.
                </p>

                <button
                    className={styles.backButton}
                    onClick={() => navigate('/user/hostel')}
                >
                    <FaArrowLeft />
                    My Hostel
                </button>
            </div>
        )
    }

    return (
        <div className={styles.page}>

            <div className={styles.topSection}>
                <div>
                    <span className={styles.pageLabel}>ACCOMMODATION</span>
                    <h1>My Room</h1>
                    
                </div>

                <button
                    className={styles.hostelButton}
                    onClick={() => navigate('/user/hostel')}
                >
                    <FaBuilding />
                    My Hostel
                </button>
            </div>

            <div className={styles.roomHero}>

                <div className={styles.roomIcon}>
                    <FaDoorOpen />
                </div>

                <div className={styles.heroContent}>
                    <span>ROOM NUMBER</span>
                    <h2>{userRoom.roomNumber}</h2>

                    <div className={styles.heroMeta}>
                        <div>
                            <FaBuilding />
                            <span>{userHostel?.name || 'Hostel'}</span>
                        </div>

                        <div>
                            <FaMapMarkerAlt />
                            <span>
                                {userHostel?.location || 'Location not available'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.statusBadge}>
                    <FaCheckCircle />
                    {userRoom.status === 'available'
                        ? 'Available'
                        : userRoom.status}
                </div>

            </div>

            <div className={styles.statsGrid}>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <FaDoorOpen />
                    </div>

                    <div>
                        <span>ROOM TYPE</span>
                        <strong>{userRoom.roomType}</strong>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <FaRupeeSign />
                    </div>

                    <div>
                        <span>MONTHLY RENT</span>
                        <strong>₹{userRoom.price}</strong>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <FaUsers />
                    </div>

                    <div>
                        <span>OCCUPIED</span>
                        <strong>
                            {occupiedBeds} / {userRoom.capacity}
                        </strong>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <FaBed />
                    </div>

                    <div>
                        <span>AVAILABLE BEDS</span>
                        <strong>{availableBeds}</strong>
                    </div>
                </div>

            </div>

            <div className={styles.contentGrid}>

                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div>
                            <span>ROOM INFORMATION</span>
                            <h3>Room Details</h3>
                        </div>

                        <div className={styles.cardIcon}>
                            <FaDoorOpen />
                        </div>
                    </div>

                    <div className={styles.detailsGrid}>

                        <div className={styles.detailItem}>
                            <span>Room Number</span>
                            <strong>{userRoom.roomNumber}</strong>
                        </div>

                        <div className={styles.detailItem}>
                            <span>Room Type</span>
                            <strong>{userRoom.roomType}</strong>
                        </div>

                        <div className={styles.detailItem}>
                            <span>Monthly Rent</span>
                            <strong>₹{userRoom.price}</strong>
                        </div>

                        <div className={styles.detailItem}>
                            <span>Room Capacity</span>
                            <strong>{userRoom.capacity} Residents</strong>
                        </div>

                        <div className={styles.detailItem}>
                            <span>Occupied Beds</span>
                            <strong>{occupiedBeds}</strong>
                        </div>

                        <div className={styles.detailItem}>
                            <span>Available Beds</span>
                            <strong>{availableBeds}</strong>
                        </div>

                    </div>
                </section>

                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div>
                            <span>HOSTEL</span>
                            <h3>Accommodation</h3>
                        </div>

                        <div className={styles.cardIcon}>
                            <FaBuilding />
                        </div>
                    </div>

                    <div className={styles.hostelInfo}>

                        <div className={styles.hostelIcon}>
                            <FaHome />
                        </div>

                        <div>
                            <h4>{userHostel?.name || 'Hostel'}</h4>

                            <p>
                                <FaMapMarkerAlt />
                                {userHostel?.address ||
                                    userHostel?.location ||
                                    'Address not available'}
                            </p>
                        </div>

                    </div>

                    <div className={styles.locationBox}>
                        <FaMapMarkerAlt />

                        <div>
                            <span>LOCATION</span>
                            <strong>
                                {userHostel?.location || 'Not available'}
                            </strong>
                        </div>
                    </div>

                    <button
                        className={styles.viewHostelButton}
                        onClick={() => navigate('/user/hostel')}
                    >
                        View Hostel Details
                    </button>
                </section>

            </div>

            <section className={styles.card}>

                <div className={styles.cardHeader}>
                    <div>
                        <span>ROOMMATES</span>
                        <h3>Current Residents</h3>
                    </div>

                    <div className={styles.cardIcon}>
                        <FaUsers />
                    </div>
                </div>

                {roomResidents.length > 0 ? (
                    <div className={styles.residentsGrid}>

                        {roomResidents.map(resident => (
                            <div
                                className={styles.residentCard}
                                key={resident.id}
                            >
                                <div className={styles.residentAvatar}>
                                    {resident.name?.charAt(0).toUpperCase()}
                                </div>

                                <div>
                                    <h4>
                                        {String(resident.id) === String(userId)
                                            ? `${resident.name} (You)`
                                            : resident.name}
                                    </h4>

                                    <p>
                                        <FaEnvelope />
                                        {resident.email}
                                    </p>

                                    {resident.phone && (
                                        <p>
                                            <FaPhone />
                                            {resident.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}

                    </div>
                ) : (
                    <div className={styles.noResidents}>
                        <FaUsers />
                        <p>No other residents are currently assigned.</p>
                    </div>
                )}

            </section>

            {owner && (
                <section className={styles.ownerCard}>

                    <div className={styles.ownerAvatar}>
                        {owner.name?.charAt(0).toUpperCase()}
                    </div>

                    <div className={styles.ownerContent}>
                        <span>HOSTEL OWNER</span>
                        <h3>{owner.name}</h3>

                        <div className={styles.ownerDetails}>
                            <span>
                                <FaEnvelope />
                                {owner.email}
                            </span>

                            {owner.phone && (
                                <span>
                                    <FaPhone />
                                    {owner.phone}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className={styles.ownerActions}>

                        {owner.phone && (
                            <a
                                href={`tel:${owner.phone}`}
                                className={styles.callButton}
                            >
                                <FaPhone />
                                Contact Owner
                            </a>
                        )}

                    </div>

                </section>
            )}

        </div>
    )
}

export default UserRoom