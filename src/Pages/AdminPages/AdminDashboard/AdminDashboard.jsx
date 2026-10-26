import React, { useEffect } from 'react'
import {
  FaUsers,
  FaUserTie,
  FaBuilding,
  FaClipboardList,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaArrowRight
} from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchUsers
} from '../../../Redux/Slices/userSlice'
import {
  fetchHostels
} from '../../../Redux/Slices/hostelSlice'
import {
  fetchBookings
} from '../../../Redux/Slices/bookingSlice'
import {
  fetchComplaints
} from '../../../Redux/Slices/complaintSlice'
import styles from './AdminDashboard.module.css'

const AdminDashboard = () => {
  const dispatch = useDispatch()

  const { users } = useSelector(state => state.users)
  const { hostels } = useSelector(state => state.hostels)
  const { bookings } = useSelector(state => state.bookings)
  const { complaints } = useSelector(state => state.complaints)

  useEffect(() => {
    dispatch(fetchUsers())
    dispatch(fetchHostels())
    dispatch(fetchBookings())
    dispatch(fetchComplaints())
  }, [dispatch])

  // dashboard counts
  const totalUsers = users.filter(user => user.role === 'user').length
  const totalOwners = users.filter(user => user.role === 'owner').length
  const totalHostels = hostels.length
  const totalBookings = bookings.length

  const pendingHostels = hostels.filter(
    hostel => hostel.status === 'pending'
  ).length

  const pendingBookings = bookings.filter(
    booking => booking.status === 'pending'
  ).length

  const openComplaints = complaints.filter(
    complaint => complaint.status === 'open'
  ).length

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: <FaUsers />,
      type: 'users'
    },
    {
      title: 'Hostel Owners',
      value: totalOwners,
      icon: <FaUserTie />,
      type: 'owners'
    },
    {
      title: 'Total Hostels',
      value: totalHostels,
      icon: <FaBuilding />,
      type: 'hostels'
    },
    {
      title: 'Total Bookings',
      value: totalBookings,
      icon: <FaClipboardList />,
      type: 'bookings'
    }
  ]

  const recentActivities = [
    ...hostels.map(hostel => ({
      id: `hostel-${hostel.id}`,
      icon: <FaBuilding />,
      title: 'Hostel registration',
      description: `${hostel.name} was added to HostelHub.`,
      time: hostel.createdAt || 'Recently',
      type: 'hostel'
    })),
    ...users
      .filter(user => user.role === 'user')
      .map(user => ({
        id: `user-${user.id}`,
        icon: <FaUsers />,
        title: 'New user registered',
        description: `${user.name} joined HostelHub.`,
        time: user.createdAt || 'Recently',
        type: 'user'
      })),
    ...bookings.map(booking => ({
      id: `booking-${booking.id}`,
      icon: <FaClipboardList />,
      title: 'New booking created',
      description: `A user created a new hostel booking.`,
      time: booking.bookingDate || 'Recently',
      type: 'booking'
    })),
    ...complaints.map(complaint => ({
      id: `complaint-${complaint.id}`,
      icon: <FaExclamationCircle />,
      title: 'New complaint',
      description: complaint.subject || 'A user submitted a complaint.',
      time: complaint.createdAt || 'Recently',
      type: 'complaint'
    }))
  ].slice(-4).reverse()

  const pendingItems = [
    {
      title: 'Hostel approvals',
      count: pendingHostels,
      icon: <FaBuilding />
    },
    {
      title: 'Pending bookings',
      count: pendingBookings,
      icon: <FaClock />
    },
    {
      title: 'Open complaints',
      count: openComplaints,
      icon: <FaExclamationCircle />
    }
  ]

  return (
    <div className={styles.dashboard}>

      <div className={styles.pageHeader}>
        <div>
          
          <h1>Dashboard</h1>
          <p>Monitor your HostelHub platform from one place.</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {stats.map(stat => (
          <div className={styles.statCard} key={stat.title}>
            <div className={styles.statTop}>
              <div className={`${styles.statIcon} ${styles[stat.type]}`}>
                {stat.icon}
              </div>
            </div>

            <div className={styles.statBottom}>
              <span>{stat.title}</span>
              <h2>{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.mainGrid}>

        <section className={styles.activityCard}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardEyebrow}>Activity</span>
              <h3>Recent Activity</h3>
            </div>

            <button className={styles.viewButton}>
              View all
              <FaArrowRight />
            </button>
          </div>

          <div className={styles.activityList}>
            {recentActivities.length > 0 ? (
              recentActivities.map(activity => (
                <div
                  className={styles.activityItem}
                  key={activity.id}
                >
                  <div
                    className={`${styles.activityIcon} ${styles[activity.type]}`}
                  >
                    {activity.icon}
                  </div>

                  <div className={styles.activityContent}>
                    <h4>{activity.title}</h4>
                    <p>{activity.description}</p>
                    <span>{activity.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <p>No recent activity available.</p>
            )}
          </div>
        </section>

        <section className={styles.pendingCard}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardEyebrow}>Attention</span>
              <h3>Pending Actions</h3>
            </div>
          </div>

          <div className={styles.pendingList}>
            {pendingItems.map(item => (
              <div
                className={styles.pendingItem}
                key={item.title}
              >
                <div className={styles.pendingLeft}>
                  <div className={styles.pendingIcon}>
                    {item.icon}
                  </div>

                  <span>{item.title}</span>
                </div>

                <div className={styles.pendingRight}>
                  <strong>{item.count}</strong>
                  <FaArrowRight />
                </div>
              </div>
            ))}
          </div>

          <div className={styles.systemStatus}>
            <div className={styles.statusIcon}>
              <FaCheckCircle />
            </div>

            <div>
              <strong>System running normally</strong>
              <span>All services are operational</span>
            </div>
          </div>
        </section>

      </div>

      <section className={styles.welcomeCard}>
        <div className={styles.welcomeContent}>
          <span>HostelHub Administration</span>

          <h2>
            Keep your hostel network
            <br />
            running smoothly.
          </h2>

          <p>
            Manage users, owners, hostels, bookings and
            complaints from your admin panel.
          </p>
        </div>

        <div className={styles.welcomeDecoration}>
          <FaBuilding />
        </div>
      </section>

    </div>
  )
}

export default AdminDashboard
