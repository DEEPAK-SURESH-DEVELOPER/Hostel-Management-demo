import { useEffect, useMemo, useState } from 'react'
import { FaCheck, FaClock, FaEnvelope, FaPhone, FaTimes, FaUserTie } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { fetchUsers, updateUser } from '../../../Redux/Slices/userSlice'
import styles from './AdminOwnerRequests.module.css'

const AdminOwnerRequests = () => {
    const dispatch = useDispatch()
    const { users, loading } = useSelector(state => state.users)
    const [updatingId, setUpdatingId] = useState(null)

    useEffect(() => {
        dispatch(fetchUsers())
    }, [dispatch])

    const pendingOwners = useMemo(
        () => users.filter(user => user.role === 'owner' && user.status === 'pending'),
        [users]
    )

    const updateRequest = async (owner, status) => {
        const actionLabel = status === 'active' ? 'approve' : 'reject'
        if (!window.confirm(`Are you sure you want to ${actionLabel} ${owner.name}'s owner application?`)) return

        try {
            setUpdatingId(owner.id)
            await dispatch(updateUser({
                id: owner.id,
                userData: { ...owner, status }
            })).unwrap()
            toast.success(status === 'active'
                ? 'Owner approved. They can now sign in.'
                : 'Owner application rejected.')
        } catch {
            toast.error(`Could not ${actionLabel} this application`)
        } finally {
            setUpdatingId(null)
        }
    }

    return (
        <main className={styles.page}>
            <header className={styles.pageHeader}>
                <div>
                    <span className={styles.eyebrow}>PARTNER REVIEW</span>
                    <h1>Owner applications</h1>
                    <p>Review new HostelHub owner accounts and decide whether they can access the owner panel.</p>
                </div>
                <div className={styles.countCard}>
                    <span className={styles.countIcon}><FaUserTie /></span>
                    <div><strong>{pendingOwners.length}</strong><span>Waiting for review</span></div>
                </div>
            </header>

            <section className={styles.listCard} aria-labelledby="pending-title">
                <div className={styles.listHeader}>
                    <div>
                        <h2 id="pending-title">Pending applications</h2>
                        <p>Approving an application activates the owner account.</p>
                    </div>
                    <span className={styles.pendingBadge}><FaClock /> {pendingOwners.length} pending</span>
                </div>

                {loading ? (
                    <div className={styles.message}>Loading owner applications…</div>
                ) : pendingOwners.length === 0 ? (
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}><FaCheck /></span>
                        <h3>All caught up</h3>
                        <p>There are no owner applications waiting for review.</p>
                    </div>
                ) : (
                    <div className={styles.applicationList}>
                        {pendingOwners.map(owner => (
                            <article className={styles.application} key={owner.id}>
                                <div className={styles.ownerIdentity}>
                                    <span className={styles.avatar}>{owner.name?.charAt(0)?.toUpperCase() || 'O'}</span>
                                    <div>
                                        <h3>{owner.name}</h3>
                                        <span>Owner application · #{owner.id}</span>
                                    </div>
                                </div>

                                <div className={styles.contactDetails}>
                                    <span><FaEnvelope />{owner.email}</span>
                                    <span><FaPhone />{owner.phone || 'Phone not provided'}</span>
                                </div>

                                <div className={styles.actions}>
                                    <button
                                        className={styles.rejectButton}
                                        type="button"
                                        disabled={updatingId === owner.id}
                                        onClick={() => updateRequest(owner, 'rejected')}
                                    >
                                        <FaTimes /> Reject
                                    </button>
                                    <button
                                        className={styles.approveButton}
                                        type="button"
                                        disabled={updatingId === owner.id}
                                        onClick={() => updateRequest(owner, 'active')}
                                    >
                                        <FaCheck /> {updatingId === owner.id ? 'Updating…' : 'Approve'}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    )
}

export default AdminOwnerRequests
