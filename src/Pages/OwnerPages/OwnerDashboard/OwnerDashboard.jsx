import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  FaBuilding,
  FaBed,
  FaDoorOpen,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaCalendarAlt,
  FaMapMarkerAlt
} from 'react-icons/fa'
import { fetchHostels } from '../../../Redux/Slices/hostelSlice'
import { fetchRooms } from '../../../Redux/Slices/roomSlice'
import { fetchBookings } from '../../../Redux/Slices/bookingSlice'
import { fetchComplaints } from '../../../Redux/Slices/complaintSlice'
import { fetchUsers } from '../../../Redux/Slices/userSlice'
import styles from './OwnerDashboard.module.css'

const OwnerDashboard = () => {
  const dispatch = useDispatch()

  const { users } = useSelector(state => state.users)
  const { hostels, loading: hostelLoading } = useSelector(
    state => state.hostels
  )
  const { rooms } = useSelector(state => state.rooms)
  const { bookings } = useSelector(state => state.bookings)
  const { complaints } = useSelector(state => state.complaints)

  useEffect(() => {
    dispatch(fetchUsers())
    dispatch(fetchHostels())
    dispatch(fetchRooms())
    dispatch(fetchBookings())
    dispatch(fetchComplaints())
  }, [dispatch])

  const loggedInUser = JSON.parse(
    localStorage.getItem('hostelHubUser')
  )

  const ownerId = loggedInUser?.id

  const owner = users.find(
    user => user.id === ownerId
  )

  const ownerHostels = hostels.filter(
    hostel => hostel.ownerId === ownerId
  )

  const ownerHostelIds = ownerHostels.map(
    hostel => hostel.id
  )

  const ownerRooms = rooms.filter(
    room => ownerHostelIds.includes(room.hostelId)
  )

  const ownerBookings = bookings.filter(
    booking => ownerHostelIds.includes(booking.hostelId)
  )

  const ownerComplaints = complaints.filter(
    complaint => ownerHostelIds.includes(complaint.hostelId)
  )

  const getRoomCapacity = room =>
    Number(room.capacity) || Number(room.roomType?.match(/\d+/)?.[0]) || 1

  const getOccupiedBeds = roomId => users.filter(
    user =>
      user.role === 'user' &&
      user.status === 'active' &&
      String(user.roomId) === String(roomId)
  ).length

  const getAvailableBeds = room =>
    Math.max(getRoomCapacity(room) - getOccupiedBeds(room.id), 0)

  const totalHostels = ownerHostels.length

  const totalRooms = ownerRooms.length

  const availableBeds = ownerRooms.reduce(
    (total, room) => total + getAvailableBeds(room),
    0
  )

  const pendingBookings = ownerBookings.filter(
    booking => booking.status === 'pending'
  )

  const approvedBookings = ownerBookings.filter(
    booking => booking.status === 'approved'
  )

  const rejectedBookings = ownerBookings.filter(
    booking => booking.status === 'rejected'
  )
  const vacatedBookings = ownerBookings.filter(
    booking => booking.status === 'vacated'
  )

  const pendingPieEnd = ownerBookings.length
    ? (pendingBookings.length / ownerBookings.length) * 360
    : 0
  const approvedPieEnd = ownerBookings.length
    ? pendingPieEnd + (approvedBookings.length / ownerBookings.length) * 360
    : 0
  const rejectedPieEnd = ownerBookings.length
    ? approvedPieEnd + (rejectedBookings.length / ownerBookings.length) * 360
    : 0
  const bookingPie = ownerBookings.length
    ? `conic-gradient(from -90deg, #d99a35 0deg ${pendingPieEnd}deg, #5d9968 ${pendingPieEnd}deg ${approvedPieEnd}deg, #c75b5b ${approvedPieEnd}deg ${rejectedPieEnd}deg, #9aa8a2 ${rejectedPieEnd}deg 360deg)`
    : '#e9efeb'

  const openComplaints = ownerComplaints.filter(
    complaint =>
      complaint.status === 'open' ||
      complaint.status === 'in-progress'
  )

  const recentBookings = [...ownerBookings]
    .sort(
      (a, b) =>
        new Date(b.bookingDate) -
        new Date(a.bookingDate)
    )
    .slice(0, 5)

  const getUserName = (userId) => {
    const user = users.find(
      user => user.id === userId
    )

    return user?.name || 'Unknown User'
  }

  const getHostelName = (hostelId) => {
    const hostel = hostels.find(
      hostel => hostel.id === hostelId
    )

    return hostel?.name || 'Unknown Hostel'
  }

  const getRoomNumber = (roomId) => {
    const room = rooms.find(
      room => room.id === roomId
    )

    return room?.roomNumber || 'N/A'
  }

  const getStatusClass = (status) => {
    if (status === 'approved') {
      return styles.approved
    }

    if (status === 'rejected') {
      return styles.rejected
    }

    if (status === 'vacated') {
      return styles.vacated
    }

    return styles.pending
  }

  if (!loggedInUser) {
    return (
      <div className={styles.emptyDashboard}>
        <h2>Session expired</h2>
        <p>Please login again to continue.</p>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>

      <div className={styles.pageHeader}>
        <div>
          <p className={styles.greeting}>
            Owner Dashboard
          </p>

          <h1>
            Welcome back, {owner?.name || 'Owner'}
          </h1>

          {/*  */}
        </div>

        <div className={styles.dateBox}>
          <FaCalendarAlt />
          <span>
            {new Date().toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>
      </div>

      <div className={styles.statsGrid}>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.tealIcon}`}>
            <FaBuilding />
          </div>

          <div>
            <p>My Hostels</p>
            <h2>{totalHostels}</h2>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.blueIcon}`}>
            <FaBed />
          </div>

          <div>
            <p>Total Rooms</p>
            <h2>{totalRooms}</h2>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.greenIcon}`}>
            <FaDoorOpen />
          </div>

          <div>
            <p>Available Beds</p>
            <h2>{availableBeds}</h2>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.orangeIcon}`}>
            <FaClock />
          </div>

          <div>
            <p>Pending Bookings</p>
            <h2>{pendingBookings.length}</h2>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.purpleIcon}`}>
            <FaCheckCircle />
          </div>

          <div>
            <p>Approved Bookings</p>
            <h2>{approvedBookings.length}</h2>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.redIcon}`}>
            <FaExclamationCircle />
          </div>

          <div>
            <p>Open Complaints</p>
            <h2>{openComplaints.length}</h2>
          </div>
        </div>

      </div>

      <div className={styles.mainGrid}>

        <div className={styles.sectionCard}>

          <div className={styles.sectionHeader}>
            <div>
              <h3>Recent Booking Requests</h3>
              
            </div>
          </div>

          {recentBookings.length === 0 ? (
            <div className={styles.emptyState}>
              <FaCalendarAlt />
              <p>No bookings found</p>
            </div>
          ) : (
            <div className={styles.bookingList}>

              {recentBookings.map(booking => (
                <div
                  className={styles.bookingItem}
                  key={booking.id}
                >

                  <div className={styles.bookingUser}>
                    <div className={styles.userAvatar}>
                      {getUserName(booking.userId)
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <h4>
                        {getUserName(booking.userId)}
                      </h4>

                      <p>
                        {getHostelName(booking.hostelId)}
                      </p>
                    </div>
                  </div>

                  <div className={styles.bookingDetails}>
                    <span>
                      Room {getRoomNumber(booking.roomId)}
                    </span>

                    <span>
                      Check-in: {booking.checkInDate}
                    </span>
                  </div>

                  <span
                    className={`${styles.status} ${getStatusClass(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>

                </div>
              ))}

            </div>
          )}

        </div>

        <div className={styles.sectionCard}>

          <div className={styles.sectionHeader}>
            <div>
              <h3>Booking Summary</h3>
              
            </div>
          </div>

          <div className={styles.bookingSummary}>
            <div
              className={styles.pieChart}
              style={{ background: bookingPie }}
              role="img"
              aria-label={`Booking status chart: ${pendingBookings.length} pending, ${approvedBookings.length} approved, ${rejectedBookings.length} rejected, ${vacatedBookings.length} vacated`}
            />

            <div className={styles.summaryList}>

            <div className={styles.summaryItem}>
              <div>
                <span className={`${styles.summaryDot} ${styles.pendingDot}`} />
                <span>Pending</span>
              </div>

              <strong>
                {pendingBookings.length}
              </strong>
            </div>

            <div className={styles.summaryItem}>
              <div>
                <span className={`${styles.summaryDot} ${styles.approvedDot}`} />
                <span>Approved</span>
              </div>

              <strong>
                {approvedBookings.length}
              </strong>
            </div>

            <div className={styles.summaryItem}>
              <div>
                <span className={`${styles.summaryDot} ${styles.rejectedDot}`} />
                <span>Rejected</span>
              </div>

              <strong>{rejectedBookings.length}</strong>
            </div>

            <div className={styles.summaryItem}>
              <div>
                <span className={`${styles.summaryDot} ${styles.vacatedDot}`} />
                <span>Vacated</span>
              </div>

              <strong>{vacatedBookings.length}</strong>
            </div>

            </div>
          </div>

          <div className={styles.totalBookings}>
            <span>Total Bookings</span>

            <strong>
              {ownerBookings.length}
            </strong>
          </div>

        </div>

      </div>

      <div className={styles.sectionCard}>

        <div className={styles.sectionHeader}>
          <div>
            <h3>My Hostels</h3>
            
          </div>

          <span className={styles.hostelCount}>
            {ownerHostels.length} Hostels
          </span>
        </div>

        {ownerHostels.length === 0 ? (
          <div className={styles.emptyState}>
            <FaBuilding />
            <p>No hostels found</p>
          </div>
        ) : (
          <div className={styles.hostelGrid}>

            {ownerHostels.map(hostel => {

              const hostelRooms = ownerRooms.filter(
                room => room.hostelId === hostel.id
              )

              const hostelAvailableBeds =
                hostelRooms.reduce(
                  (total, room) => total + getAvailableBeds(room),
                  0
                )

              return (
                <div
                  className={styles.hostelCard}
                  key={hostel.id}
                >

                  <div className={styles.hostelTop}>
                    <div className={styles.hostelIcon}>
                      <FaBuilding />
                    </div>

                    <span className={styles.approvedBadge}>
                      {hostel.status}
                    </span>
                  </div>

                  <h4>
                    {hostel.name}
                  </h4>

                  <div className={styles.location}>
                    <FaMapMarkerAlt />
                    <span>
                      {hostel.location}
                    </span>
                  </div>

                  <p className={styles.hostelDescription}>
                    {hostel.description}
                  </p>

                  <div className={styles.hostelStats}>

                    <div>
                      <strong>
                        {hostelRooms.length}
                      </strong>
                      <span>Rooms</span>
                    </div>

                    <div>
                      <strong>
                        {hostelAvailableBeds}
                      </strong>
                      <span>Available Beds</span>
                    </div>

                  </div>

                </div>
              )
            })}

          </div>
        )}

      </div>

    </div>
  )
}

export default OwnerDashboard
