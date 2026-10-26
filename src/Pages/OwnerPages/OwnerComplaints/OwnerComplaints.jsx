import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaEye, FaEdit, FaTrash, FaPlus, FaTimes, FaCheck } from 'react-icons/fa'
import { toast } from 'react-toastify'
import {
    fetchComplaints,
    addComplaint,
    updateComplaint,
    deleteComplaint
} from '../../../Redux/Slices/complaintSlice'
import { fetchUsers } from '../../../Redux/Slices/userSlice'
import { fetchHostels } from '../../../Redux/Slices/hostelSlice'
import { fetchRooms } from '../../../Redux/Slices/roomSlice'
import { fetchBookings } from '../../../Redux/Slices/bookingSlice'
import styles from './OwnerComplaints.module.css'

const OwnerComplaints = () => {
    const dispatch = useDispatch()

    const { complaints, loading } = useSelector(state => state.complaints)
    const { users } = useSelector(state => state.users)
    const { hostels } = useSelector(state => state.hostels)
    const { rooms } = useSelector(state => state.rooms)
    const { bookings } = useSelector(state => state.bookings)

    const [activeResidentFilter, setActiveResidentFilter] = useState('all')
    const [showAdminForm, setShowAdminForm] = useState(false)
    const [selectedComplaint, setSelectedComplaint] = useState(null)
    const [editingComplaint, setEditingComplaint] = useState(null)

    const [formData, setFormData] = useState({
        hostelId: '',
        subject: '',
        message: ''
    })

    const loggedInUser = JSON.parse(
        localStorage.getItem('hostelHubUser')
    )

    const ownerId = loggedInUser?.id

    useEffect(() => {
        dispatch(fetchComplaints())
        dispatch(fetchUsers())
        dispatch(fetchHostels())
        dispatch(fetchRooms())
        dispatch(fetchBookings())
    }, [dispatch])

    const ownerHostels = hostels.filter(
        hostel => String(hostel.ownerId) === String(ownerId)
    )

    const ownerHostelIds = ownerHostels.map(
        hostel => String(hostel.id)
    )

    const residentComplaints = complaints.filter(
        complaint =>
            complaint.type === 'resident_to_owner' &&
            ownerHostelIds.includes(String(complaint.hostelId))
    )

    const adminComplaints = complaints.filter(
        complaint =>
            complaint.type === 'owner_to_admin' &&
            String(complaint.ownerId) === String(ownerId)
    )

    const filteredResidentComplaints = residentComplaints.filter(
        complaint => {
            if (activeResidentFilter === 'all') {
                return true
            }

            return complaint.status === activeResidentFilter
        }
    )

    const getUser = userId => {
        return users.find(
            user => String(user.id) === String(userId)
        )
    }

    const getHostel = hostelId => {
        return hostels.find(
            hostel => String(hostel.id) === String(hostelId)
        )
    }

    const getRoom = bookingId => {
        const booking = bookings.find(
            item => String(item.id) === String(bookingId)
        )

        if (!booking) {
            return null
        }

        return rooms.find(
            room => String(room.id) === String(booking.roomId)
        )
    }

    const handleStatusUpdate = async (complaint, status) => {
        try {
            await dispatch(
                updateComplaint({
                    id: complaint.id,
                    complaintData: {
                        ...complaint,
                        status
                    }
                })
            ).unwrap()

            toast.success('Complaint status updated')
        } catch (error) {
            toast.error('Failed to update complaint')
        }
    }

    const handleFormChange = e => {
        const { name, value } = e.target

        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleAdminSubmit = async e => {
        e.preventDefault()

        if (
            !formData.hostelId ||
            !formData.subject.trim() ||
            !formData.message.trim()
        ) {
            toast.error('Please fill all fields')
            return
        }

        try {
            const complaintData = {
                userId: null,
                ownerId,
                hostelId: formData.hostelId,
                bookingId: null,
                subject: formData.subject,
                message: formData.message,
                type: 'owner_to_admin',
                status: 'open',
                createdAt: new Date().toISOString().split('T')[0]
            }

            await dispatch(
                addComplaint(complaintData)
            ).unwrap()

            toast.success('Complaint sent to admin')

            setFormData({
                hostelId: '',
                subject: '',
                message: ''
            })

            setShowAdminForm(false)
        } catch (error) {
            toast.error('Failed to send complaint')
        }
    }

    const handleEdit = complaint => {
        setEditingComplaint(complaint)

        setFormData({
            hostelId: complaint.hostelId,
            subject: complaint.subject,
            message: complaint.message
        })
    }

    const handleAdminUpdate = async e => {
        e.preventDefault()

        if (
            !formData.hostelId ||
            !formData.subject.trim() ||
            !formData.message.trim()
        ) {
            toast.error('Please fill all fields')
            return
        }

        try {
            await dispatch(
                updateComplaint({
                    id: editingComplaint.id,
                    complaintData: {
                        ...editingComplaint,
                        hostelId: formData.hostelId,
                        subject: formData.subject,
                        message: formData.message
                    }
                })
            ).unwrap()

            toast.success('Complaint updated')

            setEditingComplaint(null)

            setFormData({
                hostelId: '',
                subject: '',
                message: ''
            })
        } catch (error) {
            toast.error('Failed to update complaint')
        }
    }

    const handleDelete = async id => {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this complaint?'
        )

        if (!confirmDelete) {
            return
        }

        try {
            await dispatch(deleteComplaint(id)).unwrap()

            toast.success('Complaint deleted')
        } catch (error) {
            toast.error('Failed to delete complaint')
        }
    }

    const getStatusClass = status => {
        if (status === 'open') {
            return styles.statusOpen
        }

        if (status === 'in-progress') {
            return styles.statusProgress
        }

        if (status === 'resolved') {
            return styles.statusResolved
        }

        return styles.statusOpen
    }

    return (
        <div className={styles.page}>

            <div className={styles.pageHeader}>
                <div>
                    <span className={styles.eyebrow}>
                        COMPLAINT CENTER
                    </span>

                    <h1>Complaints</h1>

                    
                </div>

                <button
                    className={styles.adminButton}
                    onClick={() => {
                        setShowAdminForm(true)
                        setEditingComplaint(null)
                    }}
                >
                    <FaPlus />
                    Contact Admin
                </button>
            </div>

            <div className={styles.summaryGrid}>

                <div className={styles.summaryCard}>
                    <div className={`${styles.summaryIcon} ${styles.residentIcon}`}>
                        <FaEye />
                    </div>

                    <div>
                        <span>Resident Issues</span>
                        <strong>{residentComplaints.length}</strong>
                        
                    </div>
                </div>

                <div className={styles.summaryCard}>
                    <div className={`${styles.summaryIcon} ${styles.adminIcon}`}>
                        <FaPlus />
                    </div>

                    <div>
                        <span>To Administration</span>
                        <strong>{adminComplaints.length}</strong>
                        
                    </div>
                </div>

                <div className={styles.summaryCard}>
                    <div className={`${styles.summaryIcon} ${styles.pendingIcon}`}>
                        <FaCheck />
                    </div>

                    <div>
                        <span>Open Issues</span>
                        <strong>
                            {
                                residentComplaints.filter(
                                    complaint => complaint.status === 'open'
                                ).length
                            }
                        </strong>
                        
                    </div>
                </div>

            </div>

            <section className={styles.section}>

                <div className={styles.sectionHeader}>
                    <div>
                        {/* <span className={styles.sectionLabel}>
                            RESIDENT
                        </span> */}

                        <h2>Resident Complaints</h2>

                       
                    </div>

                    <div className={styles.filters}>
                        <button
                            className={
                                activeResidentFilter === 'all'
                                    ? styles.activeFilter
                                    : ''
                            }
                            onClick={() => setActiveResidentFilter('all')}
                        >
                            All
                        </button>

                        <button
                            className={
                                activeResidentFilter === 'open'
                                    ? styles.activeFilter
                                    : ''
                            }
                            onClick={() => setActiveResidentFilter('open')}
                        >
                            Open
                        </button>

                        <button
                            className={
                                activeResidentFilter === 'in-progress'
                                    ? styles.activeFilter
                                    : ''
                            }
                            onClick={() =>
                                setActiveResidentFilter('in-progress')
                            }
                        >
                            In Progress
                        </button>

                        <button
                            className={
                                activeResidentFilter === 'resolved'
                                    ? styles.activeFilter
                                    : ''
                            }
                            onClick={() =>
                                setActiveResidentFilter('resolved')
                            }
                        >
                            Resolved
                        </button>
                    </div>
                </div>

                {filteredResidentComplaints.length === 0 ? (
                    <div className={styles.emptyState}>
                        <FaCheck />
                        <h3>No resident complaints</h3>
                        <p>
                            There are no complaints matching this filter.
                        </p>
                    </div>
                ) : (
                    <div className={styles.complaintGrid}>
                        {filteredResidentComplaints.map(complaint => {
                            const resident = getUser(complaint.userId)
                            const hostel = getHostel(complaint.hostelId)
                            const room = getRoom(complaint.bookingId)

                            return (
                                <div
                                    className={styles.complaintCard}
                                    key={complaint.id}
                                >
                                    <div className={styles.cardTop}>
                                        <span className={styles.typeBadge}>
                                            Resident
                                        </span>

                                        <span
                                            className={`${styles.statusBadge} ${getStatusClass(
                                                complaint.status
                                            )}`}
                                        >
                                            {complaint.status}
                                        </span>
                                    </div>

                                    <h3>{complaint.subject}</h3>

                                    <p className={styles.message}>
                                        {complaint.message}
                                    </p>

                                    <div className={styles.metaList}>

                                        <div>
                                            <span>Resident</span>
                                            <strong>
                                                {resident?.name || 'Unknown'}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Hostel</span>
                                            <strong>
                                                {hostel?.name || 'Unknown'}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Room</span>
                                            <strong>
                                                {room?.roomNumber || 'N/A'}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Date</span>
                                            <strong>
                                                {complaint.createdAt}
                                            </strong>
                                        </div>

                                    </div>

                                    <div className={styles.cardActions}>
                                        <button
                                            className={styles.viewButton}
                                            onClick={() =>
                                                setSelectedComplaint(complaint)
                                            }
                                        >
                                            <FaEye />
                                            View
                                        </button>

                                        <select
                                            value={complaint.status}
                                            onChange={e =>
                                                handleStatusUpdate(
                                                    complaint,
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="open">
                                                Open
                                            </option>

                                            <option value="in-progress">
                                                In Progress
                                            </option>

                                            <option value="resolved">
                                                Resolved
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

            </section>

            <section className={styles.section}>

                <div className={styles.sectionHeader}>
                    <div>
                        {/* <span className={styles.sectionLabel}>
                            ADMIN
                        </span> */}

                        <h2>My Complaints to Admin</h2>

                       
                    </div>

                    <button
                        className={styles.smallAddButton}
                        onClick={() => {
                            setEditingComplaint(null)
                            setFormData({
                                hostelId: '',
                                subject: '',
                                message: ''
                            })
                            setShowAdminForm(true)
                        }}
                    >
                        <FaPlus />
                        New Complaint
                    </button>
                </div>

                {adminComplaints.length === 0 ? (
                    <div className={styles.emptyState}>
                        <FaPlus />
                        <h3>No complaints sent to admin</h3>
                        <p>
                            Use the button above to contact administration.
                        </p>
                    </div>
                ) : (
                    <div className={styles.complaintGrid}>
                        {adminComplaints.map(complaint => {
                            const hostel = getHostel(complaint.hostelId)

                            return (
                                <div
                                    className={`${styles.complaintCard} ${styles.adminComplaintCard}`}
                                    key={complaint.id}
                                >
                                    <div className={styles.cardTop}>
                                        <span className={styles.adminBadge}>
                                            To Admin
                                        </span>

                                        <span
                                            className={`${styles.statusBadge} ${getStatusClass(
                                                complaint.status
                                            )}`}
                                        >
                                            {complaint.status}
                                        </span>
                                    </div>

                                    <h3>{complaint.subject}</h3>

                                    <p className={styles.message}>
                                        {complaint.message}
                                    </p>

                                    <div className={styles.metaList}>

                                        <div>
                                            <span>Hostel</span>
                                            <strong>
                                                {hostel?.name || 'Unknown'}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Submitted By</span>
                                            <strong>
                                                You
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Date</span>
                                            <strong>
                                                {complaint.createdAt}
                                            </strong>
                                        </div>

                                    </div>

                                    <div className={styles.cardActions}>

                                        <button
                                            className={styles.viewButton}
                                            onClick={() =>
                                                setSelectedComplaint(complaint)
                                            }
                                        >
                                            <FaEye />
                                            View
                                        </button>

                                        <button
                                            className={styles.editButton}
                                            onClick={() =>
                                                handleEdit(complaint)
                                            }
                                        >
                                            <FaEdit />
                                            Edit
                                        </button>

                                        <button
                                            className={styles.deleteButton}
                                            onClick={() =>
                                                handleDelete(complaint.id)
                                            }
                                        >
                                            <FaTrash />
                                        </button>

                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

            </section>

            {(showAdminForm || editingComplaint) && (
                <div className={styles.modalOverlay}>
                    <div className={styles.formModal}>

                        <div className={styles.modalHeader}>
                            <div>
                                <span className={styles.sectionLabel}>
                                    OWNER → ADMIN
                                </span>

                                <h2>
                                    {editingComplaint
                                        ? 'Edit Complaint'
                                        : 'Contact Administration'}
                                </h2>
                            </div>

                            <button
                                className={styles.closeButton}
                                onClick={() => {
                                    setShowAdminForm(false)
                                    setEditingComplaint(null)
                                }}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form
                            onSubmit={
                                editingComplaint
                                    ? handleAdminUpdate
                                    : handleAdminSubmit
                            }
                        >

                            <div className={styles.formGroup}>
                                <label>Select Hostel</label>

                                <select
                                    name="hostelId"
                                    value={formData.hostelId}
                                    onChange={handleFormChange}
                                >
                                    <option value="">
                                        Select hostel
                                    </option>

                                    {ownerHostels.map(hostel => (
                                        <option
                                            key={hostel.id}
                                            value={hostel.id}
                                        >
                                            {hostel.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Subject</label>

                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleFormChange}
                                    placeholder="Enter complaint subject"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Message</label>

                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleFormChange}
                                    placeholder="Describe the issue..."
                                    rows="6"
                                />
                            </div>

                            <div className={styles.formActions}>

                                <button
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={() => {
                                        setShowAdminForm(false)
                                        setEditingComplaint(null)
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                >
                                    {editingComplaint
                                        ? 'Update Complaint'
                                        : 'Send to Admin'}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}

            {selectedComplaint && (
                <div className={styles.modalOverlay}>
                    <div className={styles.detailModal}>

                        <div className={styles.modalHeader}>
                            <div>
                                <span className={styles.sectionLabel}>
                                    {selectedComplaint.type ===
                                    'resident_to_owner'
                                        ? 'RESIDENT → OWNER'
                                        : 'OWNER → ADMIN'}
                                </span>

                                <h2>
                                    {selectedComplaint.subject}
                                </h2>
                            </div>

                            <button
                                className={styles.closeButton}
                                onClick={() =>
                                    setSelectedComplaint(null)
                                }
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {selectedComplaint.type ===
                        'resident_to_owner' ? (
                            <>
                                <div className={styles.detailGrid}>

                                    <div>
                                        <span>Resident</span>
                                        <strong>
                                            {
                                                getUser(
                                                    selectedComplaint.userId
                                                )?.name
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Hostel</span>
                                        <strong>
                                            {
                                                getHostel(
                                                    selectedComplaint.hostelId
                                                )?.name
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Room</span>
                                        <strong>
                                            {
                                                getRoom(
                                                    selectedComplaint.bookingId
                                                )?.roomNumber || 'N/A'
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Date</span>
                                        <strong>
                                            {selectedComplaint.createdAt}
                                        </strong>
                                    </div>

                                </div>
                            </>
                        ) : (
                            <div className={styles.detailGrid}>

                                <div>
                                    <span>Submitted By</span>
                                    <strong>You</strong>
                                </div>

                                <div>
                                    <span>Hostel</span>
                                    <strong>
                                        {
                                            getHostel(
                                                selectedComplaint.hostelId
                                            )?.name
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>Date</span>
                                    <strong>
                                        {selectedComplaint.createdAt}
                                    </strong>
                                </div>

                                <div>
                                    <span>Status</span>
                                    <strong>
                                        {selectedComplaint.status}
                                    </strong>
                                </div>

                            </div>
                        )}

                        <div className={styles.detailMessage}>
                            <span>Complaint Message</span>
                            <p>
                                {selectedComplaint.message}
                            </p>
                        </div>

                        {selectedComplaint.type ===
                            'resident_to_owner' && (
                            <div className={styles.modalStatus}>
                                <label>Update Status</label>

                                <select
                                    value={
                                        selectedComplaint.status
                                    }
                                    onChange={async e => {
                                        await handleStatusUpdate(
                                            selectedComplaint,
                                            e.target.value
                                        )

                                        setSelectedComplaint({
                                            ...selectedComplaint,
                                            status: e.target.value
                                        })
                                    }}
                                >
                                    <option value="open">
                                        Open
                                    </option>

                                    <option value="in-progress">
                                        In Progress
                                    </option>

                                    <option value="resolved">
                                        Resolved
                                    </option>
                                </select>
                            </div>
                        )}

                    </div>
                </div>
            )}

            {loading && (
                <div className={styles.loadingOverlay}>
                    Loading complaints...
                </div>
            )}

        </div>
    )
}

export default OwnerComplaints