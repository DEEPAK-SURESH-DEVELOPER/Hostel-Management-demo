import React, { useEffect, useState } from 'react'
import { FaBell, FaUserCircle, FaSignOutAlt, FaUser } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchUsers } from '../../../Redux/Slices/userSlice'
import { fetchHostels } from '../../../Redux/Slices/hostelSlice'
import { fetchBookings } from '../../../Redux/Slices/bookingSlice'
import styles from './OwnerHeader.module.css'

const OwnerHeader = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { users } = useSelector(state => state.users)
  const { hostels } = useSelector(state => state.hostels)
  const { bookings } = useSelector(state => state.bookings)

  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [readBookings, setReadBookings] = useState([])

  const loggedInUser = JSON.parse(
    localStorage.getItem('hostelHubUser')
  )

  const owner = users.find(
    user => user.id === loggedInUser?.id
  )

  useEffect(() => {
    dispatch(fetchUsers())
    dispatch(fetchHostels())
    dispatch(fetchBookings())

    const storedReadBookings = JSON.parse(
      localStorage.getItem('hostelHubOwnerReadBookings')
    ) || []

    setReadBookings(storedReadBookings)
  }, [dispatch])

  const ownerHostels = hostels.filter(
    hostel => hostel.ownerId === owner?.id
  )

  const ownerHostelIds = ownerHostels.map(
    hostel => hostel.id
  )

  const ownerBookings = bookings.filter(
    booking => ownerHostelIds.includes(booking.hostelId)
  )

  const pendingBookings = ownerBookings.filter(
    booking => booking.status === 'pending'
  )

  const unreadBookings = pendingBookings.filter(
    booking => !readBookings.includes(booking.id)
  )

  const handleNotificationClick = (booking) => {
    const updatedReadBookings = [
      ...readBookings,
      booking.id
    ]

    setReadBookings(updatedReadBookings)

    localStorage.setItem(
      'hostelHubOwnerReadBookings',
      JSON.stringify(updatedReadBookings)
    )

    setShowNotifications(false)

    navigate(
      `/owner/bookings?booking=${booking.id}`
    )
  }

  const handleProfileClick = () => {
    setShowProfile(false)
    navigate('/owner/profile')
  }

  const handleLogout = () => {
    localStorage.removeItem('hostelHubUser')
    navigate('/login')
  }

  return (
    <header className={styles.header}>

      <div className={styles.welcomeSection}>
        <p>Welcome back</p>

        <h2>
          {owner?.name || 'Owner'}
        </h2>
      </div>

      <div className={styles.rightSection}>

        <div className={styles.notificationWrapper}>
          <button
            className={styles.iconButton}
            onClick={() =>
              setShowNotifications(!showNotifications)
            }
          >
            <FaBell />

            {unreadBookings.length > 0 && (
              <span className={styles.notificationCount}>
                {unreadBookings.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className={styles.notificationDropdown}>

              <div className={styles.notificationHeader}>
                <h3>Notifications</h3>
                <span>
                  {unreadBookings.length} new
                </span>
              </div>

              {pendingBookings.length === 0 ? (
                <div className={styles.emptyNotification}>
                  <FaBell />
                  <p>No pending bookings</p>
                </div>
              ) : (
                <div className={styles.notificationList}>

                  {pendingBookings.map(booking => {

                    const hostel = hostels.find(
                      hostel =>
                        hostel.id === booking.hostelId
                    )

                    const isUnread =
                      !readBookings.includes(booking.id)

                    return (
                      <div
                        key={booking.id}
                        className={`${styles.notificationItem} ${
                          isUnread
                            ? styles.unread
                            : ''
                        }`}
                        onClick={() =>
                          handleNotificationClick(booking)
                        }
                      >

                        <div className={styles.notificationIcon}>
                          <FaBell />
                        </div>

                        <div className={styles.notificationContent}>
                          <h4>
                            New Booking Request
                          </h4>

                          <p>
                            {hostel?.name || 'Hostel'}
                          </p>

                          <small>
                            Check-in:{' '}
                            {booking.checkInDate}
                          </small>
                        </div>

                      </div>
                    )
                  })}

                </div>
              )}

              {pendingBookings.length > 0 && (
                <button
                  className={styles.viewAllButton}
                  onClick={() => {
                    setShowNotifications(false)
                    navigate('/owner/bookings')
                  }}
                >
                  View All Bookings
                </button>
              )}

            </div>
          )}
        </div>

        <div className={styles.profileWrapper}>

          <button
            className={styles.profileButton}
            onClick={() =>
              setShowProfile(!showProfile)
            }
          >

            <div className={styles.profileAvatar}>
              {owner?.name
                ?.charAt(0)
                .toUpperCase() || 'O'}
            </div>

            <div className={styles.profileInfo}>
              <strong>
                {owner?.name || 'Owner'}
              </strong>

              <span>
                Owner
              </span>
            </div>

          </button>

          {showProfile && (
            <div className={styles.profileDropdown}>

              <div className={styles.dropdownProfile}>

                <div className={styles.largeAvatar}>
                  {owner?.name
                    ?.charAt(0)
                    .toUpperCase() || 'O'}
                </div>

                <div>
                  <h4>
                    {owner?.name || 'Owner'}
                  </h4>

                  <p>
                    {owner?.email ||
                      'owner@hostelhub.com'}
                  </p>
                </div>

              </div>

              <div className={styles.dropdownDivider} />

              <button
                onClick={handleProfileClick}
              >
                <FaUser />
                Profile
              </button>

              <button
                onClick={handleLogout}
              >
                <FaSignOutAlt />
                Logout
              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  )
}

export default OwnerHeader