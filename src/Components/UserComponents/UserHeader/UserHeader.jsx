import React, { useEffect, useMemo, useState } from 'react'
import {
    FaArrowRight,
    FaBell,
    FaCalendarAlt,
    FaCheckCircle,
    FaClock,
    FaExclamationCircle,
    FaSignOutAlt
} from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchUsers } from '../../../Redux/Slices/userSlice'
import { fetchUserBookings } from '../../../Redux/Slices/bookingSlice'
import { fetchUserComplaints } from '../../../Redux/Slices/complaintSlice'
import styles from './UserHeader.module.css'

const UserHeader = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [openPanel, setOpenPanel] = useState('')
    const [seenNotifications, setSeenNotifications] = useState([])

    const { users } = useSelector(state => state.users)
    const { bookings } = useSelector(state => state.bookings)
    const { complaints } = useSelector(state => state.complaints)

    const loggedInUser = JSON.parse(localStorage.getItem('hostelHubUser') || 'null')
    const userId = loggedInUser?.id
    const seenNotificationsKey = `hostelHubSeenNotifications-${userId}`

    useEffect(() => {
        setSeenNotifications(JSON.parse(localStorage.getItem(seenNotificationsKey) || '[]'))
    }, [seenNotificationsKey])

    useEffect(() => {
        dispatch(fetchUsers())
        if (userId) {
            dispatch(fetchUserBookings(userId))
            dispatch(fetchUserComplaints(userId))
        }
    }, [dispatch, userId])

    const user = useMemo(() => users.find(item => String(item.id) === String(userId)), [users, userId])
    const displayUser = user || loggedInUser
    const userName = displayUser?.name || 'Resident'
    const userInitial = userName.charAt(0).toUpperCase()
    const today = new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    })

    const notifications = useMemo(() => {
        const bookingNotifications = bookings
            .filter(booking => String(booking.userId) === String(userId))
            .map(booking => ({
                id: `booking-${booking.id}`,
                type: 'booking',
                title: booking.status === 'approved'
                    ? 'Booking request approved'
                    : booking.status === 'rejected'
                        ? 'Booking request declined'
                        : 'Booking request sent',
                message: booking.status === 'pending'
                    ? 'Your request is waiting for the hostel owner to review.'
                    : booking.status === 'approved'
                        ? 'Your hostel and room access is ready.'
                        : 'Open your dashboard to see your latest booking details.',
                date: booking.updatedAt || booking.bookingDate,
                href: booking.status === 'approved' ? '/user/room' : '/user',
                status: booking.status
            }))

        const complaintNotifications = complaints
            .filter(complaint =>
                String(complaint.userId) === String(userId) &&
                complaint.type === 'resident_to_owner'
            )
            .map(complaint => ({
                id: `complaint-${complaint.id}`,
                type: 'complaint',
                title: complaint.status === 'resolved'
                    ? 'Complaint resolved'
                    : complaint.status === 'in_progress' || complaint.status === 'in-progress'
                        ? 'Complaint is being handled'
                        : 'Complaint submitted',
                message: complaint.subject || 'Your complaint has an update.',
                date: complaint.updatedAt || complaint.createdAt,
                href: '/user/complaints',
                status: complaint.status
            }))

        return [...bookingNotifications, ...complaintNotifications]
            .filter(notification => !seenNotifications.includes(notification.id))
            .sort((first, second) => new Date(second.date || 0) - new Date(first.date || 0))
            .slice(0, 6)
    }, [bookings, complaints, userId, seenNotifications])

    const formatDate = date => {
        if (!date) return 'Recent update'
        const parsedDate = new Date(date)
        return Number.isNaN(parsedDate.getTime())
            ? 'Recent update'
            : parsedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    }

    const handleLogout = () => {
        localStorage.removeItem('hostelHubUser')
        navigate('/login')
    }

    const openNotification = notification => {
        const updatedSeenNotifications = [...seenNotifications, notification.id]
        setSeenNotifications(updatedSeenNotifications)
        localStorage.setItem(seenNotificationsKey, JSON.stringify(updatedSeenNotifications))
        setOpenPanel('')
        navigate(notification.href)
    }

    return (
        <>
            {openPanel && <button className={styles.dismissLayer} aria-label="Close menu" onClick={() => setOpenPanel('')} />}
            <header className={styles.header}>
                <div className={styles.leftSection}>
                    <button className={styles.menuButton} aria-label="Menu"><span /></button>
                    <div className={styles.greeting}>
                        <p className={styles.pageLabel}>RESIDENT PORTAL</p>
                        <h1>Welcome back, {userName}</h1>
                    </div>
                </div>

                <div className={styles.rightSection}>
                    <div className={styles.dateBadge}><FaCalendarAlt /><span>{today}</span></div>
                    <div className={styles.panelAnchor}>
                        <button
                            className={`${styles.notificationButton} ${openPanel === 'notifications' ? styles.selectedButton : ''}`}
                            aria-label={`Notifications (${notifications.length})`}
                            aria-expanded={openPanel === 'notifications'}
                            onClick={() => setOpenPanel(openPanel === 'notifications' ? '' : 'notifications')}
                        >
                            <FaBell />
                            {notifications.length > 0 && <span className={styles.notificationCount}>{notifications.length}</span>}
                        </button>
                        {openPanel === 'notifications' && (
                            <section className={`${styles.popover} ${styles.notificationPopover}`} aria-label="Notifications">
                                <div className={styles.popoverHeader}>
                                    <div><span>YOUR ACTIVITY</span><h2>Notifications</h2></div>
                                    <span className={styles.countPill}>{notifications.length}</span>
                                </div>
                                {notifications.length ? (
                                    <div className={styles.notificationList}>
                                        {notifications.map(notification => (
                                            <button className={styles.notificationItem} key={notification.id} onClick={() => openNotification(notification)}>
                                                <span className={`${styles.notificationIcon} ${notification.type === 'booking' ? styles.bookingIcon : styles.complaintIcon}`}>
                                                    {notification.type === 'booking'
                                                        ? notification.status === 'approved' ? <FaCheckCircle /> : <FaClock />
                                                        : <FaExclamationCircle />}
                                                </span>
                                                <span className={styles.notificationCopy}>
                                                    <strong>{notification.title}</strong>
                                                    <span>{notification.message}</span>
                                                    <small>{formatDate(notification.date)}</small>
                                                </span>
                                                <FaArrowRight className={styles.notificationArrow} />
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles.emptyNotifications}><FaBell /><strong>You’re all caught up</strong><span>Booking and complaint updates will appear here.</span></div>
                                )}
                            </section>
                        )}
                    </div>

                    <div className={styles.panelAnchor}>
                        <button
                            className={`${styles.profileButton} ${openPanel === 'profile' ? styles.selectedProfile : ''}`}
                            aria-expanded={openPanel === 'profile'}
                            onClick={() => setOpenPanel(openPanel === 'profile' ? '' : 'profile')}
                        >
                            <span className={styles.avatar}>{userInitial}</span>
                            <span className={styles.userInfo}><strong>{userName}</strong></span>
                        </button>
                        {openPanel === 'profile' && (
                            <section className={`${styles.popover} ${styles.profilePopover}`} aria-label="Account menu">
                                <div className={styles.profileSummary}>
                                    <span className={styles.profileAvatar}>{userInitial}</span>
                                    <span><strong>{userName}</strong><small>{displayUser?.email || 'Resident account'}</small></span>
                                </div>
                                <div className={styles.accountDetails}>
                                    <span>ACCOUNT TYPE</span><strong>Resident</strong>
                                    {displayUser?.phone && <><span>PHONE</span><strong>{displayUser.phone}</strong></>}
                                </div>
                                <button className={styles.viewProfileButton} onClick={() => { setOpenPanel(''); navigate('/user/profile') }}>View profile <FaArrowRight /></button>
                                <button className={styles.logoutButton} onClick={handleLogout}><FaSignOutAlt /> Log out</button>
                            </section>
                        )}
                    </div>
                </div>
            </header>
        </>
    )
}

export default UserHeader
