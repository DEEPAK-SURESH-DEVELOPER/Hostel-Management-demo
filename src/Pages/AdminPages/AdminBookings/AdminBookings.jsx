import React, { useEffect, useState } from 'react'
import { FaTrash, FaSearch, FaClipboardList, FaEye } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { fetchBookings, deleteBooking } from '../../../Redux/Slices/bookingSlice'
import { fetchUsers } from '../../../Redux/Slices/userSlice'
import { fetchHostels } from '../../../Redux/Slices/hostelSlice'
import { fetchRooms } from '../../../Redux/Slices/roomSlice'
import styles from './AdminBookings.module.css'

const AdminBookings = () => {
  const dispatch = useDispatch()

  const { bookings, loading } = useSelector(state => state.bookings)
  const { users } = useSelector(state => state.users)
  const { hostels } = useSelector(state => state.hostels)
  const { rooms } = useSelector(state => state.rooms)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [hostelFilter, setHostelFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showView, setShowView] = useState(false)

  useEffect(() => {
    dispatch(fetchBookings())
    dispatch(fetchUsers())
    dispatch(fetchHostels())
    dispatch(fetchRooms())
  }, [dispatch])

  const getUserName = userId => {
    const user = users.find(user => user.id === userId)
    return user ? user.name : 'Unknown User'
  }

  const getHostelName = hostelId => {
    const hostel = hostels.find(hostel => hostel.id === hostelId)
    return hostel ? hostel.name : 'Unknown Hostel'
  }

  const getRoom = roomId => {
    return rooms.find(room => room.id === roomId)
  }

  const filteredBookings = bookings.filter(booking => {
    const userName = getUserName(booking.userId).toLowerCase()
    const hostelName = getHostelName(booking.hostelId).toLowerCase()
    const room = getRoom(booking.roomId)

    const matchesSearch =
      userName.includes(search.toLowerCase()) ||
      hostelName.includes(search.toLowerCase()) ||
      room?.roomNumber?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || booking.status === statusFilter

    const matchesHostel =
      hostelFilter === 'all' || booking.hostelId === hostelFilter

    return matchesSearch && matchesStatus && matchesHostel
  })

  const handleView = booking => {
    setSelectedBooking(booking)
    setShowView(true)
  }

  const handleDelete = async id => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this booking?'
    )

    if (!confirmDelete) return

    try {
      await dispatch(deleteBooking(id)).unwrap()
      toast.success('Booking deleted successfully')
    } catch (error) {
      toast.error('Failed to delete booking')
    }
  }

  return (
    <div className={styles.bookingsPage}>

      <div className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>Management</span>
          <h1>Bookings</h1>
          <p>View and manage all hostel bookings.</p>
        </div>

        <div className={styles.totalBookings}>
          <FaClipboardList />
          <span>{bookings.length} Bookings</span>
        </div>
      </div>

      <div className={styles.toolbar}>

        <div className={styles.searchBox}>
          <FaSearch />
          <input type="text" placeholder="Search bookings..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <select className={styles.filter} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select className={styles.filter} value={hostelFilter} onChange={e => setHostelFilter(e.target.value)}>
          <option value="all">All Hostels</option>
          {hostels.map(hostel => (
            <option key={hostel.id} value={hostel.id}>{hostel.name}</option>
          ))}
        </select>

      </div>

      <div className={styles.tableCard}>

        {loading ? (
          <div className={styles.message}>Loading bookings...</div>
        ) : filteredBookings.length === 0 ? (
          <div className={styles.message}>No bookings found.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table>

              <thead>
                <tr>
                  <th>Booking</th>
                  <th>User</th>
                  <th>Hostel</th>
                  <th>Room</th>
                  <th>Check-in</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredBookings.map(booking => {
                  const room = getRoom(booking.roomId)

                  return (
                    <tr key={booking.id}>

                      <td>
                        <div className={styles.bookingInfo}>
                          <strong>{booking.id}</strong>
                          <span>{booking.bookingDate}</span>
                        </div>
                      </td>

                      <td>{getUserName(booking.userId)}</td>

                      <td>{getHostelName(booking.hostelId)}</td>

                      <td>
                        {room ? `${room.roomNumber} - ${room.roomType}` : 'Unknown Room'}
                      </td>

                      <td>{booking.checkInDate}</td>

                      <td>
                        <span className={`${styles.status} ${styles[booking.status]}`}>
                          {booking.status}
                        </span>
                      </td>

                      <td>
                        <div className={styles.actions}>

                          <button className={styles.viewButton} title="View" onClick={() => handleView(booking)}>
                            <FaEye />
                          </button>

                          <button className={styles.deleteButton} title="Delete" onClick={() => handleDelete(booking.id)}>
                            <FaTrash />
                          </button>

                        </div>
                      </td>

                    </tr>
                  )
                })}
              </tbody>

            </table>
          </div>
        )}

      </div>

      {showView && selectedBooking && (
        <div className={styles.modalOverlay}>

          <div className={styles.modal}>

            <div className={styles.modalHeader}>
              <div>
                <span className={styles.eyebrow}>Booking Details</span>
                <h2>Booking {selectedBooking.id}</h2>
              </div>

              <button className={styles.closeButton} onClick={() => { setShowView(false); setSelectedBooking(null) }}>
                ×
              </button>
            </div>

            <div className={styles.details}>

              <div className={styles.detailItem}>
                <span>User</span>
                <strong>{getUserName(selectedBooking.userId)}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Hostel</span>
                <strong>{getHostelName(selectedBooking.hostelId)}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Room</span>
                <strong>{getRoom(selectedBooking.roomId)?.roomNumber || 'Unknown Room'}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Room Type</span>
                <strong>{getRoom(selectedBooking.roomId)?.roomType || 'Not available'}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Booking Date</span>
                <strong>{selectedBooking.bookingDate}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Check-in Date</span>
                <strong>{selectedBooking.checkInDate}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Status</span>
                <span className={`${styles.status} ${styles[selectedBooking.status]}`}>
                  {selectedBooking.status}
                </span>
              </div>

            </div>

            <div className={styles.modalActions}>
              <button onClick={() => { setShowView(false); setSelectedBooking(null) }}>
                Close
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}

export default AdminBookings