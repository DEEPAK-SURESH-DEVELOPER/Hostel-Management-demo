import React, { useEffect, useMemo, useState } from 'react'
import {
    FaEye,
    FaTrash,
    FaExclamationCircle,
    FaUserTie,
    FaSearch,
    FaTimes
} from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
    fetchComplaints,
    updateComplaint,
    deleteComplaint
} from '../../../Redux/Slices/complaintSlice'
import { fetchUsers } from '../../../Redux/Slices/userSlice'
import { fetchHostels } from '../../../Redux/Slices/hostelSlice'
import styles from './AdminComplaints.module.css'

const AdminComplaints = () => {
    const dispatch = useDispatch()

    const { complaints, loading } = useSelector(
        state => state.complaints
    )

    const { users } = useSelector(
        state => state.users
    )

    const { hostels } = useSelector(
        state => state.hostels
    )

    const [statusFilter, setStatusFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [selectedComplaint, setSelectedComplaint] = useState(null)

    useEffect(() => {
        dispatch(fetchComplaints())
        dispatch(fetchUsers())
        dispatch(fetchHostels())
    }, [dispatch])

    const adminComplaints = useMemo(() => {
        return complaints.filter(
            complaint =>
                complaint.type === 'owner_to_admin'
        )
    }, [complaints])

    const filteredComplaints = useMemo(() => {
        return adminComplaints.filter(complaint => {
            const matchesStatus =
                statusFilter === 'all' ||
                complaint.status === statusFilter

            const owner = users.find(
                user =>
                    String(user.id) ===
                    String(complaint.ownerId)
            )

            const hostel = hostels.find(
                hostel =>
                    String(hostel.id) ===
                    String(complaint.hostelId)
            )

            const searchText = `
                ${complaint.subject}
                ${complaint.message}
                ${owner?.name || ''}
                ${hostel?.name || ''}
            `.toLowerCase()

            const matchesSearch =
                searchText.includes(search.toLowerCase())

            return matchesStatus && matchesSearch
        })
    }, [
        adminComplaints,
        statusFilter,
        search,
        users,
        hostels
    ])

    const getOwner = ownerId => {
        return users.find(
            user =>
                String(user.id) ===
                String(ownerId)
        )
    }

    const getHostel = hostelId => {
        return hostels.find(
            hostel =>
                String(hostel.id) ===
                String(hostelId)
        )
    }

    const handleStatusUpdate = async (
        complaint,
        status
    ) => {
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

            setSelectedComplaint(prev =>
                prev
                    ? {
                          ...prev,
                          status
                      }
                    : null
            )

            toast.success(
                'Complaint status updated successfully'
            )
        } catch (error) {
            toast.error(
                'Failed to update complaint status'
            )
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
            await dispatch(
                deleteComplaint(id)
            ).unwrap()

            if (
                selectedComplaint?.id === id
            ) {
                setSelectedComplaint(null)
            }

            toast.success(
                'Complaint deleted successfully'
            )
        } catch (error) {
            toast.error(
                'Failed to delete complaint'
            )
        }
    }

    const getStatusClass = status => {
        if (status === 'open') {
            return styles.open
        }

        if (status === 'in-progress') {
            return styles.inProgress
        }

        if (status === 'resolved') {
            return styles.resolved
        }

        if (status === 'rejected') {
            return styles.rejected
        }

        return ''
    }

    const openCount = adminComplaints.filter(
        complaint =>
            complaint.status === 'open'
    ).length

    const progressCount = adminComplaints.filter(
        complaint =>
            complaint.status === 'in-progress'
    ).length

    const resolvedCount = adminComplaints.filter(
        complaint =>
            complaint.status === 'resolved'
    ).length

    return (
        <div className={styles.complaintsPage}>

            <div className={styles.pageHeader}>

                <div>
                    
                    <h1>Owner Complaints</h1>

                   
                </div>

                <div className={styles.totalComplaints}>
                    <div className={styles.totalIcon}>
                        <FaExclamationCircle />
                    </div>

                    <div>
                        <strong>
                            {adminComplaints.length}
                        </strong>

                        <span>
                            Owner Complaints
                        </span>
                    </div>
                </div>

            </div>

            <div className={styles.summaryGrid}>

                <div className={styles.summaryCard}>
                    <div className={`${styles.summaryIcon} ${styles.openIcon}`}>
                        <FaExclamationCircle />
                    </div>

                    <div>
                        <span>Open</span>
                        <strong>{openCount}</strong>
                        
                    </div>
                </div>

                <div className={styles.summaryCard}>
                    <div className={`${styles.summaryIcon} ${styles.progressIcon}`}>
                        <FaExclamationCircle />
                    </div>

                    <div>
                        <span>In Progress</span>
                        <strong>{progressCount}</strong>
                        
                    </div>
                </div>

                <div className={styles.summaryCard}>
                    <div className={`${styles.summaryIcon} ${styles.resolvedIcon}`}>
                        <FaExclamationCircle />
                    </div>

                    <div>
                        <span>Resolved</span>
                        <strong>{resolvedCount}</strong>
                        
                    </div>
                </div>

            </div>

            <div className={styles.toolbar}>

                

                <div className={styles.statusFilters}>

                    <button
                        className={
                            statusFilter === 'all'
                                ? styles.activeFilter
                                : ''
                        }
                        onClick={() =>
                            setStatusFilter('all')
                        }
                    >
                        All
                    </button>

                    <button
                        className={
                            statusFilter === 'open'
                                ? styles.activeFilter
                                : ''
                        }
                        onClick={() =>
                            setStatusFilter('open')
                        }
                    >
                        Open
                    </button>

                    <button
                        className={
                            statusFilter === 'in-progress'
                                ? styles.activeFilter
                                : ''
                        }
                        onClick={() =>
                            setStatusFilter('in-progress')
                        }
                    >
                        In Progress
                    </button>

                    <button
                        className={
                            statusFilter === 'resolved'
                                ? styles.activeFilter
                                : ''
                        }
                        onClick={() =>
                            setStatusFilter('resolved')
                        }
                    >
                        Resolved
                    </button>

                    <button
                        className={
                            statusFilter === 'rejected'
                                ? styles.activeFilter
                                : ''
                        }
                        onClick={() =>
                            setStatusFilter('rejected')
                        }
                    >
                        Rejected
                    </button>

                </div>

            </div>

            <div className={styles.resultInfo}>
                Showing
                <strong>
                    {filteredComplaints.length}
                </strong>
                complaints sent by owners
            </div>

            {loading ? (

                <div className={styles.message}>
                    Loading complaints...
                </div>

            ) : filteredComplaints.length === 0 ? (

                <div className={styles.emptyState}>

                    <div className={styles.emptyIcon}>
                        <FaExclamationCircle />
                    </div>

                    <h3>
                        No complaints found
                    </h3>

                    <p>
                        There are no owner complaints
                        matching your current filters.
                    </p>

                </div>

            ) : (

                <div className={styles.complaintsList}>

                    {filteredComplaints.map(
                        complaint => {

                            const owner =
                                getOwner(
                                    complaint.ownerId
                                )

                            const hostel =
                                getHostel(
                                    complaint.hostelId
                                )

                            return (
                                <div
                                    className={
                                        styles.complaintCard
                                    }
                                    key={complaint.id}
                                >

                                    <div
                                        className={
                                            styles.cardTop
                                        }
                                    >

                                        <div
                                            className={
                                                styles.titleArea
                                            }
                                        >

                                            <div
                                                className={
                                                    styles.complaintIcon
                                                }
                                            >
                                                <FaUserTie />
                                            </div>

                                            <div>

                                                <span
                                                    className={
                                                        styles.complaintId
                                                    }
                                                >
                                                    #{complaint.id}
                                                </span>

                                                <h3>
                                                    {
                                                        complaint.subject
                                                    }
                                                </h3>

                                            </div>

                                        </div>

                                        <span
                                            className={`${styles.status} ${getStatusClass(
                                                complaint.status
                                            )}`}
                                        >
                                            {
                                                complaint.status
                                            }
                                        </span>

                                    </div>

                                    <div
                                        className={
                                            styles.cardInfo
                                        }
                                    >

                                        <div
                                            className={
                                                styles.infoItem
                                            }
                                        >
                                            <span>
                                                Owner
                                            </span>

                                            <strong>
                                                {
                                                    owner?.name ||
                                                    'Unknown Owner'
                                                }
                                            </strong>
                                        </div>

                                        <div
                                            className={
                                                styles.infoItem
                                            }
                                        >
                                            <span>
                                                Hostel
                                            </span>

                                            <strong>
                                                {
                                                    hostel?.name ||
                                                    'Unknown Hostel'
                                                }
                                            </strong>
                                        </div>

                                        <div
                                            className={
                                                styles.infoItem
                                            }
                                        >
                                            <span>
                                                Location
                                            </span>

                                            <strong>
                                                {
                                                    hostel?.location ||
                                                    'Not available'
                                                }
                                            </strong>
                                        </div>

                                        <div
                                            className={
                                                styles.infoItem
                                            }
                                        >
                                            <span>
                                                Submitted
                                            </span>

                                            <strong>
                                                {
                                                    complaint.createdAt ||
                                                    'Not available'
                                                }
                                            </strong>
                                        </div>

                                    </div>

                                    <div
                                        className={
                                            styles.messagePreview
                                        }
                                    >
                                        {
                                            complaint.message
                                        }
                                    </div>

                                    <div
                                        className={
                                            styles.cardFooter
                                        }
                                    >

                                        <span>
                                            {complaint.status ===
                                            'open'
                                                ? 'Requires attention'
                                                : complaint.status ===
                                                  'in-progress'
                                                ? 'Currently being handled'
                                                : complaint.status ===
                                                  'resolved'
                                                ? 'Complaint resolved'
                                                : 'Complaint rejected'}
                                        </span>

                                        <div
                                            className={
                                                styles.actions
                                            }
                                        >

                                            <select
                                                value={
                                                    complaint.status
                                                }
                                                onChange={e =>
                                                    handleStatusUpdate(
                                                        complaint,
                                                        e.target
                                                            .value
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

                                                <option value="rejected">
                                                    Rejected
                                                </option>
                                            </select>

                                            <button
                                                className={
                                                    styles.viewButton
                                                }
                                                onClick={() =>
                                                    setSelectedComplaint(
                                                        complaint
                                                    )
                                                }
                                            >
                                                <FaEye />
                                                View
                                            </button>

                                            <button
                                                className={
                                                    styles.deleteButton
                                                }
                                                onClick={() =>
                                                    handleDelete(
                                                        complaint.id
                                                    )
                                                }
                                            >
                                                <FaTrash />
                                            </button>

                                        </div>

                                    </div>

                                </div>
                            )
                        }
                    )}

                </div>
            )}

            {selectedComplaint && (() => {

                const owner =
                    getOwner(
                        selectedComplaint.ownerId
                    )

                const hostel =
                    getHostel(
                        selectedComplaint.hostelId
                    )

                return (
                    <div
                        className={
                            styles.modalOverlay
                        }
                    >

                        <div
                            className={
                                styles.modal
                            }
                        >

                            <div
                                className={
                                    styles.modalHeader
                                }
                            >

                                <div>
                                    <span
                                        className={
                                            styles.eyebrow
                                        }
                                    >
                                        OWNER → ADMIN
                                    </span>

                                    <h2>
                                        {
                                            selectedComplaint.subject
                                        }
                                    </h2>
                                </div>

                                <button
                                    className={
                                        styles.closeButton
                                    }
                                    onClick={() =>
                                        setSelectedComplaint(
                                            null
                                        )
                                    }
                                >
                                    <FaTimes />
                                </button>

                            </div>

                            <div
                                className={
                                    styles.sourceBanner
                                }
                            >

                                <div
                                    className={
                                        styles.sourceIcon
                                    }
                                >
                                    <FaUserTie />
                                </div>

                                <div>
                                    <span>
                                        Submitted by
                                    </span>

                                    <strong>
                                        {
                                            owner?.name ||
                                            'Unknown Owner'
                                        }
                                    </strong>

                                    <small>
                                        Hostel Owner
                                    </small>
                                </div>

                            </div>

                            <div
                                className={
                                    styles.detailGrid
                                }
                            >

                                <div
                                    className={
                                        styles.detailItem
                                    }
                                >
                                    <span>
                                        Complaint ID
                                    </span>

                                    <strong>
                                        {
                                            selectedComplaint.id
                                        }
                                    </strong>
                                </div>

                                <div
                                    className={
                                        styles.detailItem
                                    }
                                >
                                    <span>
                                        Status
                                    </span>

                                    <span
                                        className={`${styles.status} ${getStatusClass(
                                            selectedComplaint.status
                                        )}`}
                                    >
                                        {
                                            selectedComplaint.status
                                        }
                                    </span>
                                </div>

                                <div
                                    className={
                                        styles.detailItem
                                    }
                                >
                                    <span>
                                        Owner
                                    </span>

                                    <strong>
                                        {
                                            owner?.name ||
                                            'Unknown Owner'
                                        }
                                    </strong>
                                </div>

                                <div
                                    className={
                                        styles.detailItem
                                    }
                                >
                                    <span>
                                        Email
                                    </span>

                                    <strong>
                                        {
                                            owner?.email ||
                                            'Not available'
                                        }
                                    </strong>
                                </div>

                                <div
                                    className={
                                        styles.detailItem
                                    }
                                >
                                    <span>
                                        Hostel
                                    </span>

                                    <strong>
                                        {
                                            hostel?.name ||
                                            'Unknown Hostel'
                                        }
                                    </strong>
                                </div>

                                <div
                                    className={
                                        styles.detailItem
                                    }
                                >
                                    <span>
                                        Location
                                    </span>

                                    <strong>
                                        {
                                            hostel?.location ||
                                            'Not available'
                                        }
                                    </strong>
                                </div>

                                <div
                                    className={
                                        styles.detailItem
                                    }
                                >
                                    <span>
                                        Submitted On
                                    </span>

                                    <strong>
                                        {
                                            selectedComplaint.createdAt ||
                                            'Not available'
                                        }
                                    </strong>
                                </div>

                            </div>

                            <div
                                className={
                                    styles.statusControl
                                }
                            >

                                <label>
                                    Update Complaint Status
                                </label>

                                <select
                                    value={
                                        selectedComplaint.status
                                    }
                                    onChange={e =>
                                        handleStatusUpdate(
                                            selectedComplaint,
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

                                    <option value="rejected">
                                        Rejected
                                    </option>
                                </select>

                            </div>

                            <div
                                className={
                                    styles.complaintMessage
                                }
                            >

                                <span>
                                    Complaint Message
                                </span>

                                <div>
                                    {
                                        selectedComplaint.message
                                    }
                                </div>

                            </div>

                            <div
                                className={
                                    styles.modalFooter
                                }
                            >

                                <button
                                    className={
                                        styles.modalDeleteButton
                                    }
                                    onClick={() =>
                                        handleDelete(
                                            selectedComplaint.id
                                        )
                                    }
                                >
                                    <FaTrash />
                                    Delete Complaint
                                </button>

                                <button
                                    className={
                                        styles.closeModalButton
                                    }
                                    onClick={() =>
                                        setSelectedComplaint(
                                            null
                                        )
                                    }
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>
                )
            })()}

        </div>
    )
}

export default AdminComplaints
