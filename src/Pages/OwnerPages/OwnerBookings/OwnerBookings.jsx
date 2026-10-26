import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
    fetchBookings,
    updateBooking
} from '../../../Redux/Slices/bookingSlice'
import { fetchUsers, updateUser } from '../../../Redux/Slices/userSlice'
import { fetchHostels } from '../../../Redux/Slices/hostelSlice'
import { fetchRooms } from '../../../Redux/Slices/roomSlice'
import styles from './OwnerBookings.module.css'

const OwnerBookings = () => {
    const dispatch = useDispatch()
    const [searchParams, setSearchParams] = useSearchParams()

    const { bookings, loading } = useSelector(
        state => state.bookings
    )

    const { users } = useSelector(
        state => state.users
    )

    const { hostels } = useSelector(
        state => state.hostels
    )

    const { rooms } = useSelector(
        state => state.rooms
    )

    const [activeFilter, setActiveFilter] = useState('all')
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [updatingId, setUpdatingId] = useState(null)

    const loggedInUser = JSON.parse(
        localStorage.getItem('hostelHubUser')
    )

    const ownerId = loggedInUser?.id

    useEffect(() => {
        if (ownerId) {
            dispatch(fetchBookings())
            dispatch(fetchUsers())
            dispatch(fetchHostels())
            dispatch(fetchRooms())
        }
    }, [dispatch, ownerId])

    const ownerHostels = hostels.filter(
        hostel => String(hostel.ownerId) === String(ownerId)
    )

    const ownerHostelIds = ownerHostels.map(
        hostel => String(hostel.id)
    )

    const ownerBookings = bookings.filter(
        booking =>
            ownerHostelIds.includes(String(booking.hostelId))
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

    const filteredBookings =
        activeFilter === 'pending'
            ? pendingBookings
            : activeFilter === 'approved'
            ? approvedBookings
            : activeFilter === 'rejected'
            ? rejectedBookings
            : activeFilter === 'vacated'
            ? vacatedBookings
            : ownerBookings

    const linkedBookingId = searchParams.get('booking')
    const linkedBooking = ownerBookings.find(
        booking => String(booking.id) === String(linkedBookingId)
    )
    const bookingToShow = selectedBooking || linkedBooking

    const getUser = userId => {
        return users.find(
            user => String(user.id) === String(userId)
        )
    }

    const getHostel = hostelId => {
        return hostels.find(
            hostel =>
                String(hostel.id) === String(hostelId)
        )
    }

    const getRoom = roomId => {
        return rooms.find(
            room =>
                String(room.id) === String(roomId)
        )
    }

    const getStatusClass = status => {
        if (status === 'pending') {
            return styles.pending
        }

        if (status === 'approved') {
            return styles.approved
        }

        if (status === 'rejected') {
            return styles.rejected
        }

        if (status === 'vacated') {
            return styles.vacated
        }

        return ''
    }

    const getStatusText = status => {
        if (status === 'pending') {
            return 'Pending'
        }

        if (status === 'approved') {
            return 'Approved'
        }

        if (status === 'rejected') {
            return 'Rejected'
        }

        if (status === 'vacated') {
            return 'Vacated'
        }

        return status
    }

    const formatDate = date => {
        if (!date) {
            return '-'
        }

        return new Date(date).toLocaleDateString(
            'en-IN',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }
        )
    }

    const handleViewBooking = booking => {
        setSelectedBooking(booking)

        setSearchParams({
            booking: booking.id
        })
    }

    const closeModal = () => {
        setSelectedBooking(null)
        setSearchParams({})
    }

    const handleBookingStatus = async (
        booking,
        status
    ) => {
        if (booking.status !== 'pending') {
            return
        }

        const actionText =
            status === 'approved'
                ? 'approve'
                : 'reject'

        const confirmed = window.confirm(
            `Are you sure you want to ${actionText} this booking?`
        )

        if (!confirmed) {
            return
        }

        let residentToRestore = null
        let assignmentSaved = false

        try {
            setUpdatingId(booking.id)
            const latestBookings = await dispatch(fetchBookings()).unwrap()
            const bookingToUpdate = latestBookings.find(
                item => String(item.id) === String(booking.id)
            )

            if (!bookingToUpdate || bookingToUpdate.status !== 'pending') {
                toast.error('This booking is no longer pending. Refresh the page to see its latest status.')
                return
            }

            if (status === 'approved') {
                const [latestUsers, latestRooms] = await Promise.all([
                    dispatch(fetchUsers()).unwrap(),
                    dispatch(fetchRooms()).unwrap()
                ])
                const resident = latestUsers.find(user => String(user.id) === String(bookingToUpdate.userId))
                const room = latestRooms.find(item => String(item.id) === String(bookingToUpdate.roomId))

                if (!resident || !room) {
                    toast.error('The resident or requested room could not be found.')
                    return
                }

                if (String(room.hostelId) !== String(bookingToUpdate.hostelId)) {
                    toast.error('The requested room does not belong to this hostel.')
                    return
                }

                if (resident.status !== 'active') {
                    toast.error('This resident account is inactive and cannot be assigned.')
                    return
                }

                const otherOpenBooking = latestBookings.find(item =>
                    String(item.userId) === String(resident.id) &&
                    String(item.id) !== String(bookingToUpdate.id) &&
                    ['pending', 'approved'].includes(item.status)
                )
                if (otherOpenBooking) {
                    toast.error('This resident has another pending or approved booking. Resolve it before approving this request.')
                    return
                }

                const alreadyAssigned = resident.roomId || resident.hostelId
                const sameAssignment =
                    String(resident.roomId) === String(bookingToUpdate.roomId) &&
                    String(resident.hostelId) === String(bookingToUpdate.hostelId)

                if (alreadyAssigned && !sameAssignment) {
                    toast.error('This resident already has a hostel or room assignment.')
                    return
                }

                const roomCapacity = Number(room.capacity) ||
                    Number(room.roomType?.match(/\d+/)?.[0]) || 1
                const occupiedResidents = latestUsers.filter(item =>
                    item.role === 'user' &&
                    item.status === 'active' &&
                    String(item.roomId) === String(room.id) &&
                    String(item.id) !== String(resident.id)
                ).length

                if (!sameAssignment && occupiedResidents >= roomCapacity) {
                    toast.error('This room no longer has an available bed.')
                    return
                }

                if (!sameAssignment) {
                    residentToRestore = resident
                    await dispatch(updateUser({
                        id: resident.id,
                        userData: {
                            ...resident,
                            hostelId: String(bookingToUpdate.hostelId),
                            roomId: String(bookingToUpdate.roomId)
                        }
                    })).unwrap()
                    assignmentSaved = true
                }
            }

            await dispatch(
                updateBooking({
                    id: bookingToUpdate.id,
                    bookingData: {
                        ...bookingToUpdate,
                        status: status
                    }
                })
            ).unwrap()

            if (status === 'approved') {
                toast.success(
                    'Booking approved successfully'
                )
            } else {
                toast.success(
                    'Booking rejected successfully'
                )
            }

            if (selectedBooking && String(selectedBooking.id) === String(bookingToUpdate.id)) {
                setSelectedBooking({
                    ...bookingToUpdate,
                    status: status
                })
            }
        } catch {
            if (assignmentSaved && residentToRestore) {
                try {
                    await dispatch(updateUser({
                        id: residentToRestore.id,
                        userData: residentToRestore
                    })).unwrap()
                } catch {
                    toast.error('The booking failed and the resident assignment could not be restored.')
                }
            }
            toast.error(
                `Failed to ${actionText} booking`
            )
        } finally {
            setUpdatingId(null)
        }
    }

    const handleFilterChange = filter => {
        setActiveFilter(filter)
    }

    return (
        <div className={styles.bookingsPage}>

            <div className={styles.heroSection}>

                <div>
                    

                    <h1>Booking Requests</h1>

                      
                </div>

                <div className={styles.pendingSummary}>
                    <span className={styles.pendingIcon}>
                        !
                    </span>

                    <div>
                        <strong>
                            {pendingBookings.length}
                        </strong>

                        <span>
                            Pending Requests
                        </span>
                    </div>
                </div>

            </div>

            <div className={styles.statsGrid}>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        ≡
                    </div>

                    <div>
                        <span>Total Bookings</span>
                        <strong>
                            {ownerBookings.length}
                        </strong>
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.pendingStat}`}>
                    <div className={styles.statIcon}>
                        !
                    </div>

                    <div>
                        <span>Pending</span>
                        <strong>
                            {pendingBookings.length}
                        </strong>
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.approvedStat}`}>
                    <div className={styles.statIcon}>
                        ✓
                    </div>

                    <div>
                        <span>Approved</span>
                        <strong>
                            {approvedBookings.length}
                        </strong>
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.rejectedStat}`}>
                    <div className={styles.statIcon}>
                        ×
                    </div>

                    <div>
                        <span>Rejected</span>
                        <strong>
                            {rejectedBookings.length}
                        </strong>
                    </div>
                </div>

            </div>

            <div className={styles.bookingSection}>

                <div className={styles.sectionHeader}>

                    <div>
                        <span className={styles.sectionLabel}>
                            RESIDENT REQUESTS
                        </span>

                        <h2>Bookings</h2>
                    </div>

                    <div className={styles.filters}>

                        <button
                            className={
                                activeFilter === 'all'
                                    ? styles.activeFilter
                                    : ''
                            }
                            onClick={() =>
                                handleFilterChange('all')
                            }
                        >
                            All
                            <span>
                                {ownerBookings.length}
                            </span>
                        </button>

                        <button
                            className={
                                activeFilter === 'pending'
                                    ? styles.activeFilter
                                    : ''
                            }
                            onClick={() =>
                                handleFilterChange('pending')
                            }
                        >
                            Pending
                            <span>
                                {pendingBookings.length}
                            </span>
                        </button>

                        <button
                            className={
                                activeFilter === 'approved'
                                    ? styles.activeFilter
                                    : ''
                            }
                            onClick={() =>
                                handleFilterChange('approved')
                            }
                        >
                            Approved
                            <span>
                                {approvedBookings.length}
                            </span>
                        </button>

                        <button
                            className={
                                activeFilter === 'rejected'
                                    ? styles.activeFilter
                                    : ''
                            }
                            onClick={() =>
                                handleFilterChange('rejected')
                            }
                        >
                            Rejected
                            <span>
                                {rejectedBookings.length}
                            </span>
                        </button>

                        <button
                            className={
                                activeFilter === 'vacated'
                                    ? styles.activeFilter
                                    : ''
                            }
                            onClick={() => handleFilterChange('vacated')}
                        >
                            Vacated
                            <span>{vacatedBookings.length}</span>
                        </button>

                    </div>

                </div>

                {loading ? (
                    <div className={styles.loadingState}>
                        Loading bookings...
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className={styles.emptyState}>

                        <div className={styles.emptyIcon}>
                            ✓
                        </div>

                        <h3>
                            No bookings found
                        </h3>

                        <p>
                            There are no bookings in this
                            category yet.
                        </p>

                    </div>
                ) : (
                    <div className={styles.bookingList}>

                        {filteredBookings.map(booking => {

                            const user =
                                getUser(booking.userId)

                            const hostel =
                                getHostel(booking.hostelId)

                            const room =
                                getRoom(booking.roomId)

                            return (
                                <div
                                    className={`${styles.bookingCard} ${
                                        booking.status === 'pending'
                                            ? styles.pendingCard
                                            : ''
                                    }`}
                                    key={booking.id}
                                >

                                    <div className={styles.bookingMain}>

                                        <div className={styles.userSection}>

                                            <div className={styles.userAvatar}>
                                                {user?.name
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || 'U'}
                                            </div>

                                            <div>
                                                <h3>
                                                    {user?.name ||
                                                        'Unknown User'}
                                                </h3>

                                                <p>
                                                    {user?.email ||
                                                        'No email available'}
                                                </p>

                                                {user?.phone && (
                                                    <small>
                                                        {user.phone}
                                                    </small>
                                                )}
                                            </div>

                                        </div>

                                        <div className={styles.bookingInfo}>

                                            <div>
                                                <span>
                                                    Hostel
                                                </span>

                                                <strong>
                                                    {hostel?.name ||
                                                        'Unknown Hostel'}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Room
                                                </span>

                                                <strong>
                                                    {room?.roomNumber ||
                                                        booking.roomId}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Room Type
                                                </span>

                                                <strong>
                                                    {room?.roomType ||
                                                        '-'}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Check-in
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        booking.checkInDate
                                                    )}
                                                </strong>
                                            </div>

                                        </div>

                                    </div>

                                    <div className={styles.bookingSide}>

                                        <span
                                            className={`${styles.status} ${getStatusClass(
                                                booking.status
                                            )}`}
                                        >
                                            <span className={styles.statusDot}></span>

                                            {getStatusText(
                                                booking.status
                                            )}
                                        </span>

                                        <span className={styles.bookingDate}>
                                            Requested{' '}
                                            {formatDate(
                                                booking.bookingDate
                                            )}
                                        </span>

                                        <div className={styles.actionButtons}>

                                            <button
                                                className={styles.viewButton}
                                                onClick={() =>
                                                    handleViewBooking(
                                                        booking
                                                    )
                                                }
                                            >
                                                View
                                            </button>

                                            {booking.status ===
                                                'pending' && (
                                                <>
                                                    <button
                                                        className={
                                                            styles.approveButton
                                                        }
                                                        disabled={
                                                            updatingId ===
                                                            booking.id
                                                        }
                                                        onClick={() =>
                                                            handleBookingStatus(
                                                                booking,
                                                                'approved'
                                                            )
                                                        }
                                                    >
                                                        {updatingId ===
                                                        booking.id
                                                            ? '...'
                                                            : 'Approve'}
                                                    </button>

                                                    <button
                                                        className={
                                                            styles.rejectButton
                                                        }
                                                        disabled={
                                                            updatingId ===
                                                            booking.id
                                                        }
                                                        onClick={() =>
                                                            handleBookingStatus(
                                                                booking,
                                                                'rejected'
                                                            )
                                                        }
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}

                                        </div>

                                    </div>

                                </div>
                            )
                        })}

                    </div>
                )}

            </div>

            {bookingToShow && (
                <div
                    className={styles.modalOverlay}
                    onClick={closeModal}
                >

                    <div
                        className={styles.modal}
                        onClick={e =>
                            e.stopPropagation()
                        }
                    >

                        <div className={styles.modalHeader}>

                            <div>
                                <span className={styles.modalLabel}>
                                    BOOKING DETAILS
                                </span>

                                <h2>
                                    Booking #{bookingToShow.id}
                                </h2>
                            </div>

                            <button
                                className={styles.modalClose}
                                onClick={closeModal}
                            >
                                ×
                            </button>

                        </div>

                        <div className={styles.modalStatus}>

                            <span
                                className={`${styles.status} ${getStatusClass(
                                    bookingToShow.status
                                )}`}
                            >
                                <span className={styles.statusDot}></span>

                                {getStatusText(
                                    bookingToShow.status
                                )}
                            </span>

                        </div>

                        <div className={styles.detailGrid}>

                            <div className={styles.detailBox}>
                                <span>Resident</span>

                                <strong>
                                    {
                                        getUser(
                                            bookingToShow.userId
                                        )?.name || 'Account permanently deleted'
                                    }
                                </strong>

                                <small>
                                    {
                                        getUser(
                                            bookingToShow.userId
                                        )?.email || 'No email available'
                                    }
                                </small>
                            </div>

                            <div className={styles.detailBox}>
                                <span>Phone</span>

                                <strong>
                                    {
                                        getUser(
                                            bookingToShow.userId
                                        )?.phone || '—'
                                    }
                                </strong>
                            </div>

                            <div className={styles.detailBox}>
                                <span>Hostel</span>

                                <strong>
                                    {
                                        getHostel(
                                            bookingToShow.hostelId
                                        )?.name
                                    }
                                </strong>
                            </div>

                            <div className={styles.detailBox}>
                                <span>Room</span>

                                <strong>
                                    {
                                        getRoom(
                                            bookingToShow.roomId
                                        )?.roomNumber ||
                                        bookingToShow.roomId
                                    }
                                </strong>

                                <small>
                                    {
                                        getRoom(
                                            bookingToShow.roomId
                                        )?.roomType
                                    }
                                </small>
                            </div>

                            <div className={styles.detailBox}>
                                <span>Booking Date</span>

                                <strong>
                                    {formatDate(
                                        bookingToShow.bookingDate
                                    )}
                                </strong>
                            </div>

                            <div className={styles.detailBox}>
                                <span>Check-in Date</span>

                                <strong>
                                    {formatDate(
                                        bookingToShow.checkInDate
                                    )}
                                </strong>
                            </div>

                        </div>

                        {bookingToShow.status ===
                            'pending' && (
                            <div className={styles.modalActions}>

                                <button
                                    className={
                                        styles.modalApprove
                                    }
                                    disabled={
                                        updatingId ===
                                        bookingToShow.id
                                    }
                                    onClick={() =>
                                        handleBookingStatus(
                                            bookingToShow,
                                            'approved'
                                        )
                                    }
                                >
                                    {updatingId ===
                                    bookingToShow.id
                                        ? 'Processing...'
                                        : 'Approve Booking'}
                                </button>

                                <button
                                    className={
                                        styles.modalReject
                                    }
                                    disabled={
                                        updatingId ===
                                        bookingToShow.id
                                    }
                                    onClick={() =>
                                        handleBookingStatus(
                                            bookingToShow,
                                            'rejected'
                                        )
                                    }
                                >
                                    Reject Booking
                                </button>

                            </div>
                        )}

                    </div>

                </div>
            )}

        </div>
    )
}

export default OwnerBookings
