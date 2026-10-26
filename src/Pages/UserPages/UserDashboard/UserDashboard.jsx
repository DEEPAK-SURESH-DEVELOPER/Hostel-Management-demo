import { useEffect, useMemo } from 'react'
import {
    FaArrowRight,
    FaBed,
    FaBuilding,
    FaCalendarAlt,
    FaCheckCircle,
    FaClock,
    FaCompass,
    FaDoorOpen,
    FaExclamationCircle,
    FaMapMarkerAlt,
    FaUserCheck
} from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchUsers } from '../../../Redux/Slices/userSlice'
import { fetchHostels } from '../../../Redux/Slices/hostelSlice'
import { fetchRooms } from '../../../Redux/Slices/roomSlice'
import { fetchUserComplaints } from '../../../Redux/Slices/complaintSlice'
import { fetchUserBookings } from '../../../Redux/Slices/bookingSlice'
import styles from './UserDashboard.module.css'


const UserDashboard = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { users } = useSelector(state => state.users)
    const { hostels } = useSelector(state => state.hostels)
    const { rooms } = useSelector(state => state.rooms)
    const { complaints } = useSelector(state => state.complaints)
    const { bookings } = useSelector(state => state.bookings)

    const loggedInUser = JSON.parse(localStorage.getItem('hostelHubUser') || 'null')
    const userId = loggedInUser?.id

    useEffect(() => {
        dispatch(fetchUsers())
        dispatch(fetchHostels())
        dispatch(fetchRooms())
        if (userId) {
            dispatch(fetchUserComplaints(userId))
            dispatch(fetchUserBookings(userId))
        }
    }, [dispatch, userId])

    const user = useMemo(() => users.find(item => String(item.id) === String(userId)), [users, userId])
    const userHostel = useMemo(() => hostels.find(hostel => String(hostel.id) === String(user?.hostelId)), [hostels, user])
    const userRoom = useMemo(() => rooms.find(room => String(room.id) === String(user?.roomId)), [rooms, user])
    const userComplaints = useMemo(() => complaints
        .filter(complaint => String(complaint.userId) === String(userId) && complaint.type === 'resident_to_owner')
        .sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0)), [complaints, userId])
    const userBookings = useMemo(() => bookings
        .filter(booking => String(booking.userId) === String(userId))
        .sort((first, second) => new Date(second.bookingDate || 0) - new Date(first.bookingDate || 0)), [bookings, userId])

    const openComplaints = userComplaints.filter(complaint => ['open', 'in_progress', 'in-progress'].includes(complaint.status)).length
    const latestBooking = userBookings[0]
    const residentName = user?.name || loggedInUser?.name || 'Resident'
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

    const formatDate = date => date
        ? new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'Date not set'

    const getStatusClass = status => {
        if (status === 'resolved') return styles.resolved
        if (status === 'in_progress' || status === 'in-progress') return styles.inProgress
        return styles.open
    }

    const getBookingClass = status => {
        if (status === 'approved') return styles.approved
        if (status === 'rejected') return styles.rejected
        return styles.pending
    }

    return (
        <div className={styles.dashboard}>
            <section className={styles.welcomeSection}>
                <div className={styles.welcomeCopy}>
                    
                    <h2>{greeting}, {residentName}</h2>
                    <br></br>
                    <div className={styles.today}><FaCalendarAlt /> {today}</div>
                </div>
                <div className={styles.welcomeAside}>
                    <span className={styles.welcomeIcon}><FaBuilding /></span>
                    <strong>{userHostel?.name || 'Your next stay starts here'}</strong>
                    <span>{userHostel ? 'Your hostel' : 'Explore available hostels'}</span>
                    {!userHostel && <button onClick={() => navigate('/user/explore-hostels')}>Explore Hostels <FaArrowRight /></button>}
                </div>
            </section>

            <section className={styles.statsGrid}>
                <article className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.teal}`}><FaBuilding /></div>
                    <div><span>MY HOSTEL</span><strong title={userHostel?.name}>{userHostel?.name || 'Not assigned'}</strong><small>{userHostel?.location || 'Browse available stays'}</small></div>
                </article>
                <article className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.gold}`}><FaDoorOpen /></div>
                    <div><span>MY ROOM</span><strong>{userRoom?.roomNumber ? `Room ${userRoom.roomNumber}` : 'Not assigned'}</strong><small>{userRoom?.roomType || 'Room details will appear here'}</small></div>
                </article>
                <article className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.rose}`}><FaExclamationCircle /></div>
                    <div><span>OPEN COMPLAINTS</span><strong>{openComplaints}</strong><small>{userComplaints.length} total submitted</small></div>
                </article>
                <article className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.green}`}><FaUserCheck /></div>
                    <div><span>ACCOUNT STATUS</span><strong>{user?.status === 'active' ? 'Active' : 'Inactive'}</strong><small>{userHostel ? 'Resident access available' : 'No hostel assigned yet'}</small></div>
                </article>
            </section>

            {latestBooking && (
                <section className={styles.bookingBanner}>
                    <div className={styles.bookingSymbol}>{latestBooking.status === 'approved' ? <FaCheckCircle /> : <FaClock />}</div>
                    <div className={styles.bookingText}>
                        <span>YOUR LATEST BOOKING REQUEST</span>
                        <strong>{hostels.find(hostel => String(hostel.id) === String(latestBooking.hostelId))?.name || 'Hostel booking'}</strong>
                        <small>Requested {formatDate(latestBooking.bookingDate)}{latestBooking.checkInDate ? ` · Check-in ${formatDate(latestBooking.checkInDate)}` : ''}</small>
                    </div>
                    <span className={`${styles.bookingStatus} ${getBookingClass(latestBooking.status)}`}>{latestBooking.status || 'pending'}</span>
                </section>
            )}

            <section className={styles.mainGrid}>
                <article className={styles.card}>
                    <div className={styles.sectionHeader}>
                        <div><span>YOUR ACCOMMODATION</span><h3>{userHostel?.name || 'Find your hostel'}</h3></div>
                        <button onClick={() => navigate(userHostel ? '/user/hostel' : '/user/explore-hostels')}>{userHostel ? 'Hostel details' : 'Explore'} <FaArrowRight /></button>
                    </div>
                    {userHostel ? (
                        <div className={styles.hostelContent}>
                            <div className={styles.hostelImage}>{userHostel.image ? <img src={userHostel.image} alt={userHostel.name} /> : <FaBuilding />}</div>
                            <div className={styles.hostelInfo}>
                                <div className={styles.infoRow}><FaMapMarkerAlt /><span>{userHostel.address || userHostel.location || 'Location not available'}</span></div>
                                <p>{userHostel.description || 'Hostel details are available in your accommodation page.'}</p>
                                <div className={styles.facilities}>{userHostel.facilities?.slice(0, 5).map(facility => <span key={facility}>{facility}</span>)}</div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.emptyAccommodation}><span><FaCompass /></span><div><strong>No hostel assigned yet</strong><p>Browse approved hostels and send a request to get started.</p></div><button onClick={() => navigate('/user/explore-hostels')}>Browse hostels <FaArrowRight /></button></div>
                    )}
                </article>

                <article className={styles.card}>
                    <div className={styles.sectionHeader}>
                        <div><span>ROOM INFORMATION</span><h3>My Room</h3></div>
                        <button onClick={() => navigate('/user/room')}>Room details <FaArrowRight /></button>
                    </div>
                    {userRoom ? (
                        <div className={styles.roomDetails}>
                            <div className={styles.roomNumber}><span>ROOM</span><strong>{userRoom.roomNumber || '—'}</strong><small>{userRoom.roomType || 'Room'}</small></div>
                            <div className={styles.roomRows}>
                                <div><span>Hostel</span><strong>{userHostel?.name || 'Assigned hostel'}</strong></div>
                                <div><span>Monthly rent</span><strong>{userRoom.price ? `₹${Number(userRoom.price).toLocaleString('en-IN')}` : 'Not listed'}</strong></div>
                                <div><span>Room capacity</span><strong>{userRoom.capacity ? `${userRoom.capacity} residents` : userRoom.roomType || 'Not listed'}</strong></div>
                                <div><span>Room status</span><strong className={styles.roomStatus}>{userRoom.status || 'Assigned'}</strong></div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.roomEmpty}><span><FaBed /></span><strong>No room assignment yet</strong><p>Your room details will appear here after the owner approves and assigns your request.</p></div>
                    )}
                </article>
            </section>

            <section className={styles.card}>
                <div className={styles.sectionHeader}>
                    <div><span>RECENT ACTIVITY</span><h3>My Complaints</h3></div>
                    <button onClick={() => navigate('/user/complaints')}>View all complaints <FaArrowRight /></button>
                </div>
                {userComplaints.length ? (
                    <div className={styles.complaintList}>
                        {userComplaints.slice(0, 3).map(complaint => (
                            <article className={styles.complaintItem} key={complaint.id}>
                                <div className={styles.complaintIcon}><FaExclamationCircle /></div>
                                <div className={styles.complaintContent}><h4>{complaint.subject || 'Resident complaint'}</h4><p>{complaint.message || 'No details provided.'}</p><small><FaCalendarAlt /> {formatDate(complaint.createdAt)}</small></div>
                                <span className={`${styles.complaintStatus} ${getStatusClass(complaint.status)}`}>{(complaint.status || 'open').replace('_', ' ').replace('-', ' ')}</span>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className={styles.noComplaints}><span><FaCheckCircle /></span><div><strong>All clear</strong><p>You have no complaints submitted to your hostel.</p></div><button onClick={() => navigate('/user/complaints')}>Go to complaints <FaArrowRight /></button></div>
                )}
            </section>
        </div>
    )
}

export default UserDashboard
