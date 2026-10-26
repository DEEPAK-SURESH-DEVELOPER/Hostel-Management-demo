import React, { useEffect, useMemo, useState } from 'react'
import {
    FaExclamationCircle,
    FaPlus,
    FaTimes,
    FaClock,
    FaCheckCircle,
    FaPaperPlane,
    FaBuilding,
    FaDoorOpen
} from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
    fetchUserComplaints,
    addComplaint
} from '../../../Redux/Slices/complaintSlice'
import { fetchUsers } from '../../../Redux/Slices/userSlice'
import { fetchHostels } from '../../../Redux/Slices/hostelSlice'
import { fetchRooms } from '../../../Redux/Slices/roomSlice'
import styles from './UserComplaints.module.css'

const UserComplaints = () => {
    const dispatch = useDispatch()

    const { users } = useSelector(state => state.users)
    const { hostels } = useSelector(state => state.hostels)
    const { rooms } = useSelector(state => state.rooms)
    const { complaints, loading } = useSelector(state => state.complaints)

    const loggedInUser = JSON.parse(localStorage.getItem('hostelHubUser'))
    const userId = loggedInUser?.id

    const [showForm, setShowForm] = useState(false)

    const [formData, setFormData] = useState({
        subject: '',
        message: ''
    })

    useEffect(() => {
        if (userId) {
            dispatch(fetchUserComplaints(userId))
        }

        dispatch(fetchUsers())
        dispatch(fetchHostels())
        dispatch(fetchRooms())
    }, [dispatch, userId])

    const user = useMemo(() => {
        return users.find(
            item => String(item.id) === String(userId)
        )
    }, [users, userId])

    const userHostel = useMemo(() => {
        return hostels.find(
            hostel =>
                String(hostel.id) === String(user?.hostelId)
        )
    }, [hostels, user])

    const userRoom = useMemo(() => {
        return rooms.find(
            room =>
                String(room.id) === String(user?.roomId)
        )
    }, [rooms, user])

    const userComplaints = useMemo(() => {
        return complaints
            .filter(
                complaint =>
                    String(complaint.userId) === String(userId) &&
                    complaint.type === 'resident_to_owner'
            )
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )
    }, [complaints, userId])

    const handleChange = e => {
        const { name, value } = e.target

        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async e => {
        e.preventDefault()

        if (!formData.subject.trim()) {
            toast.error('Please enter complaint subject')
            return
        }

        if (!formData.message.trim()) {
            toast.error('Please enter complaint message')
            return
        }

        if (!userHostel?.ownerId) {
            toast.error('Hostel owner information not available')
            return
        }

        const complaintData = {
            userId: String(userId),
            ownerId: String(userHostel.ownerId),
            hostelId: String(userHostel.id),
            bookingId: null,
            subject: formData.subject.trim(),
            message: formData.message.trim(),
            type: 'resident_to_owner',
            status: 'open',
            createdAt: new Date().toISOString().split('T')[0]
        }

        try {
            await dispatch(addComplaint(complaintData)).unwrap()

            toast.success('Complaint submitted successfully')

            setFormData({
                subject: '',
                message: ''
            })

            setShowForm(false)

            dispatch(fetchUserComplaints(userId))
        } catch (error) {
            toast.error('Failed to submit complaint')
        }
    }

    const getStatusClass = status => {
        if (status === 'resolved') {
            return styles.resolved
        }

        if (status === 'in_progress') {
            return styles.inProgress
        }

        return styles.open
    }

    const getStatusIcon = status => {
        if (status === 'resolved') {
            return <FaCheckCircle />
        }

        if (status === 'in_progress') {
            return <FaClock />
        }

        return <FaExclamationCircle />
    }

    return (
        <div className={styles.page}>

            <div className={styles.topSection}>
                <div>
                    <span className={styles.pageLabel}>
                        RESIDENT SUPPORT
                    </span>

                    <h1>My Complaints</h1>

                   
                </div>

                <button
                    className={styles.addButton}
                    onClick={() => setShowForm(true)}
                >
                    <FaPlus />
                    New Complaint
                </button>
            </div>

            <div className={styles.infoBanner}>
                <div className={styles.bannerIcon}>
                    <FaBuilding />
                </div>

                <div>
                    <strong>
                        Complaint will be sent to your hostel owner
                    </strong>

                    <p>
                        {userHostel?.name || 'Your hostel'}
                        {userRoom
                            ? ` • Room ${userRoom.roomNumber}`
                            : ''}
                    </p>
                </div>
            </div>

            <div className={styles.statsGrid}>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <FaExclamationCircle />
                    </div>

                    <div>
                        <span>TOTAL</span>
                        <strong>{userComplaints.length}</strong>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <FaExclamationCircle />
                    </div>

                    <div>
                        <span>OPEN</span>
                        <strong>
                            {
                                userComplaints.filter(
                                    item => item.status === 'open'
                                ).length
                            }
                        </strong>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <FaClock />
                    </div>

                    <div>
                        <span>IN PROGRESS</span>
                        <strong>
                            {
                                userComplaints.filter(
                                    item =>
                                        item.status === 'in_progress'
                                ).length
                            }
                        </strong>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <FaCheckCircle />
                    </div>

                    <div>
                        <span>RESOLVED</span>
                        <strong>
                            {
                                userComplaints.filter(
                                    item =>
                                        item.status === 'resolved'
                                ).length
                            }
                        </strong>
                    </div>
                </div>

            </div>

            <div className={styles.sectionHeader}>
                <div>
                    <span>COMPLAINT HISTORY</span>
                    <h2>Your Complaints</h2>
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>
                    Loading complaints...
                </div>
            ) : userComplaints.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <FaCheckCircle />
                    </div>

                    <h3>No Complaints</h3>

                    <p>
                        You have not submitted any complaints yet.
                    </p>

                    <button
                        className={styles.emptyButton}
                        onClick={() => setShowForm(true)}
                    >
                        <FaPlus />
                        Submit Complaint
                    </button>
                </div>
            ) : (
                <div className={styles.complaintsList}>

                    {userComplaints.map(complaint => (
                        <div
                            className={styles.complaintCard}
                            key={complaint.id}
                        >

                            <div className={styles.complaintTop}>

                                <div className={styles.complaintTitle}>
                                    <div className={styles.complaintIcon}>
                                        <FaExclamationCircle />
                                    </div>

                                    <div>
                                        <h3>
                                            {complaint.subject}
                                        </h3>

                                        <span>
                                            Submitted on{' '}
                                            {complaint.createdAt}
                                        </span>
                                    </div>
                                </div>

                                <div
                                    className={`${styles.status} ${getStatusClass(
                                        complaint.status
                                    )}`}
                                >
                                    {getStatusIcon(complaint.status)}

                                    {complaint.status === 'in_progress'
                                        ? 'In Progress'
                                        : complaint.status
                                              .charAt(0)
                                              .toUpperCase() +
                                          complaint.status.slice(1)}
                                </div>

                            </div>

                            <p className={styles.message}>
                                {complaint.message}
                            </p>

                            <div className={styles.complaintFooter}>

                                <span>
                                    <FaBuilding />
                                    {userHostel?.name ||
                                        'Hostel'}
                                </span>

                                {userRoom && (
                                    <span>
                                        <FaDoorOpen />
                                        Room {userRoom.roomNumber}
                                    </span>
                                )}

                                <span>
                                    <FaPaperPlane />
                                    Sent to Hostel Owner
                                </span>

                            </div>

                        </div>
                    ))}

                </div>
            )}

            {showForm && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setShowForm(false)}
                >
                    <div
                        className={styles.modal}
                        onClick={e => e.stopPropagation()}
                    >

                        <div className={styles.modalHeader}>
                            <div>
                                <span>NEW REQUEST</span>
                                <h2>Submit Complaint</h2>
                            </div>

                            <button
                                className={styles.closeButton}
                                onClick={() => setShowForm(false)}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className={styles.recipientBox}>
                            <FaBuilding />

                            <div>
                                <span>COMPLAINT WILL BE SENT TO</span>
                                <strong>
                                    {userHostel?.name ||
                                        'Hostel Owner'}
                                </strong>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className={styles.formGroup}>
                                <label>
                                    Complaint Subject
                                </label>

                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="Example: Water supply issue"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>
                                    Complaint Details
                                </label>

                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Describe your issue clearly..."
                                    rows="6"
                                />
                            </div>

                            <div className={styles.formActions}>

                                <button
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={() =>
                                        setShowForm(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                >
                                    <FaPaperPlane />
                                    Submit Complaint
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}

        </div>
    )
}

export default UserComplaints