import React, { useEffect, useRef, useState } from 'react'
import { FaBell, FaUser, FaCog, FaSignOutAlt, FaExclamationCircle } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchComplaints } from '../../../Redux/Slices/complaintSlice'
import { fetchUsers } from '../../../Redux/Slices/userSlice'
import { fetchHostels } from '../../../Redux/Slices/hostelSlice'
import styles from './AdminHeader.module.css'

const AdminHeader = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { complaints } = useSelector(state => state.complaints)
  const { users } = useSelector(state => state.users)
  const { hostels } = useSelector(state => state.hostels)

  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [readComplaints, setReadComplaints] = useState(() => {
    const saved = localStorage.getItem('hostelHubReadComplaints')
    return saved ? JSON.parse(saved) : []
  })

  const notificationRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    dispatch(fetchComplaints())
    dispatch(fetchUsers())
    dispatch(fetchHostels())
  }, [dispatch])

  useEffect(() => {
    localStorage.setItem('hostelHubReadComplaints', JSON.stringify(readComplaints))
  }, [readComplaints])

  useEffect(() => {
    const handleClickOutside = event => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }

      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const admin = users.find(user => user.role === 'admin')

  const getUser = userId => {
    return users.find(user => user.id === userId)
  }

  const getHostel = hostelId => {
    return hostels.find(hostel => hostel.id === hostelId)
  }

  const complaintNotifications = complaints
    .filter(complaint => complaint.status === 'open')
    .map(complaint => {
      const user = getUser(complaint.userId)
      const hostel = getHostel(complaint.hostelId)

      return {
        id: complaint.id,
        title: complaint.subject,
        message: `${user?.name || 'Unknown user'} submitted a complaint for ${hostel?.name || 'Unknown hostel'}.`,
        date: complaint.createdAt,
        read: readComplaints.includes(complaint.id),
        complaint
      }
    })

  const unreadCount = complaintNotifications.filter(
    notification => !notification.read
  ).length

  const handleNotificationClick = complaint => {
    setReadComplaints(prev =>
      prev.includes(complaint.id) ? prev : [...prev, complaint.id]
    )

    setShowNotifications(false)

    navigate(`/admin/complaints?complaint=${complaint.id}`)
  }

  const markAllAsRead = () => {
    const ids = complaintNotifications.map(notification => notification.id)

    setReadComplaints(prev => [
      ...new Set([...prev, ...ids])
    ])
  }

  const toggleNotifications = () => {
    setShowNotifications(prev => !prev)
    setShowProfile(false)
  }

  const toggleProfile = () => {
    setShowProfile(prev => !prev)
    setShowNotifications(false)
  }

  const handleProfile = () => {
    setShowProfile(false)
    navigate('/admin/profile')
  }

  const handleLogout = () => {
    localStorage.removeItem('hostelHubUser')
    navigate('/login')
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.welcomeSection}>
          <p>Welcome back</p>
          <h2>{admin?.name || 'Admin'}</h2>
        </div>
      </div>

      <div className={styles.headerRight}>
        <div className={styles.notificationWrapper} ref={notificationRef}>
          <button
            className={`${styles.iconButton} ${showNotifications ? styles.activeButton : ''}`}
            onClick={toggleNotifications}
          >
            <FaBell />

            {unreadCount > 0 && (
              <span className={styles.notificationBadge}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className={styles.notificationDropdown}>
              <div className={styles.dropdownHeader}>
                <div>
                  <h3>Complaints</h3>
                  <span>
                    {unreadCount} unread complaint{unreadCount !== 1 ? 's' : ''}
                  </span>
                </div>

                {unreadCount > 0 && (
                  <button
                    className={styles.markButton}
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className={styles.notificationList}>
                {complaintNotifications.length === 0 ? (
                  <div className={styles.emptyNotification}>
                    <FaBell />
                    <p>No new complaints</p>
                  </div>
                ) : (
                  complaintNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                      onClick={() => handleNotificationClick(notification.complaint)}
                    >
                      <div className={styles.notificationIcon}>
                        <FaExclamationCircle />
                      </div>

                      <div className={styles.notificationContent}>
                        <div className={styles.notificationTitleRow}>
                          <h4>{notification.title}</h4>

                          {!notification.read && (
                            <span className={styles.unreadDot}></span>
                          )}
                        </div>

                        <p>{notification.message}</p>

                        <span className={styles.notificationTime}>
                          {notification.date || 'Recently'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className={styles.notificationFooter}>
                <button
                  onClick={() => {
                    setShowNotifications(false)
                    navigate('/admin/complaints')
                  }}
                >
                  View all complaints
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.profileWrapper} ref={profileRef}>
          <button
            className={`${styles.profileButton} ${showProfile ? styles.profileActive : ''}`}
            onClick={toggleProfile}
          >
            <div className={styles.avatar}>
              {admin?.name?.charAt(0).toUpperCase() || 'A'}
            </div>

            <div className={styles.profileText}>
              <strong>{admin?.name || 'Admin'}</strong>
              <span>Administrator</span>
            </div>

            <span className={`${styles.profileArrow} ${showProfile ? styles.arrowUp : ''}`}>
              ⌄
            </span>
          </button>

          {showProfile && (
            <div className={styles.profileDropdown}>
              <div className={styles.profileTop}>
                <div className={styles.largeAvatar}>
                  {admin?.name?.charAt(0).toUpperCase() || 'A'}
                </div>

                <div>
                  <h3>{admin?.name || 'Admin'}</h3>
                  <p>{admin?.email || 'admin@hostelhub.com'}</p>
                  <span>Administrator</span>
                </div>
              </div>

              <div className={styles.profileDivider}></div>

              <div className={styles.profileMenu}>
                <button onClick={handleProfile}>
                  <FaUser />
                  <span>My Profile</span>
                </button>

                <button onClick={() => console.log('Settings clicked')}>
                  <FaCog />
                  <span>Settings</span>
                </button>
              </div>

              <div className={styles.profileDivider}></div>

              <button
                className={styles.logoutButton}
                onClick={handleLogout}
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default AdminHeader