import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  FaBed,
  FaBuilding,
  FaEdit,
  FaSearch,
  FaTrash,
  FaUser,
  FaUserSlash
} from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { fetchHostels } from '../../../Redux/Slices/hostelSlice'
import { fetchRooms } from '../../../Redux/Slices/roomSlice'
import { fetchBookings, updateBooking } from '../../../Redux/Slices/bookingSlice'
import {
  deleteUser,
  fetchUsers,
  updateUser
} from '../../../Redux/Slices/userSlice'
import styles from './OwnerResidents.module.css'

const OwnerResidents = () => {
  const dispatch = useDispatch()
  const { users, loading } = useSelector(state => state.users)
  const { hostels } = useSelector(state => state.hostels)
  const { rooms } = useSelector(state => state.rooms)
  const { bookings } = useSelector(state => state.bookings)
  const [selectedHostelId, setSelectedHostelId] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingResident, setEditingResident] = useState(null)
  const [saving, setSaving] = useState(false)
  const [vacatingResident, setVacatingResident] = useState(null)
  const [vacateAccountStatus, setVacateAccountStatus] = useState('active')
  const [vacating, setVacating] = useState(false)

  const loggedInUser = JSON.parse(localStorage.getItem('hostelHubUser') || 'null')
  const ownerId = loggedInUser?.id

  useEffect(() => {
    if (ownerId) {
      dispatch(fetchUsers())
      dispatch(fetchHostels())
      dispatch(fetchRooms())
      dispatch(fetchBookings())
    }
  }, [dispatch, ownerId])

  const ownerHostels = useMemo(
    () => hostels.filter(hostel => String(hostel.ownerId) === String(ownerId)),
    [hostels, ownerId]
  )
  const ownerHostelIds = useMemo(
    () => ownerHostels.map(hostel => String(hostel.id)),
    [ownerHostels]
  )

  // Show current residents and residents with a vacated booking at this owner's hostel.
  const ownerResidents = useMemo(
    () => users.filter(user => {
      if (user.role !== 'user') return false
      const currentlyAssignedHere = ownerHostelIds.includes(String(user.hostelId))
      const previouslyStayedHere = bookings.some(booking =>
        String(booking.userId) === String(user.id) &&
        ownerHostelIds.includes(String(booking.hostelId)) &&
        booking.status === 'vacated'
      )
      return currentlyAssignedHere || previouslyStayedHere
    }),
    [users, ownerHostelIds, bookings]
  )

  const getResidentRecord = useCallback(resident => {
    const currentHostelId = String(resident.hostelId || '')
    const currentAssignmentIsInFilter =
      ownerHostelIds.includes(currentHostelId) &&
      (selectedHostelId === 'all' || currentHostelId === String(selectedHostelId))

    if (currentAssignmentIsInFilter) {
      return {
        hostelId: resident.hostelId,
        roomId: resident.roomId,
        isFormer: false
      }
    }

    const formerBooking = bookings
      .filter(booking =>
        String(booking.userId) === String(resident.id) &&
        ownerHostelIds.includes(String(booking.hostelId)) &&
        booking.status === 'vacated' &&
        (selectedHostelId === 'all' || String(booking.hostelId) === String(selectedHostelId))
      )
      .sort((first, second) =>
        new Date(second.checkInDate || second.bookingDate) -
        new Date(first.checkInDate || first.bookingDate)
      )[0]

    return formerBooking
      ? { hostelId: formerBooking.hostelId, roomId: formerBooking.roomId, isFormer: true }
      : null
  }, [bookings, ownerHostelIds, selectedHostelId])

  const filteredResidents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return ownerResidents.filter(resident => {
      const residentRecord = getResidentRecord(resident)
      const matchesHostel = Boolean(residentRecord)
      const matchesStatus =
        statusFilter === 'all' || resident.status === statusFilter
      const matchesName =
        !normalizedSearch || resident.name?.toLowerCase().includes(normalizedSearch)

      return matchesHostel && matchesStatus && matchesName
    }).sort((first, second) => (first.name || '').localeCompare(second.name || ''))
  }, [ownerResidents, getResidentRecord, statusFilter, searchTerm])

  const activeCount = ownerResidents.filter(resident => resident.status === 'active').length
  const inactiveCount = ownerResidents.filter(resident => resident.status !== 'active').length
  const canEditResident = resident =>
    ownerHostelIds.includes(String(resident.hostelId))
  const hasVacatedOwnerBooking = (resident, bookingList = bookings) => bookingList.some(booking =>
    String(booking.userId) === String(resident.id) &&
    ownerHostelIds.includes(String(booking.hostelId)) &&
    booking.status === 'vacated'
  )
  const canDeleteResident = resident =>
    !resident.hostelId && !resident.roomId && hasVacatedOwnerBooking(resident)

  const getHostelName = hostelId =>
    ownerHostels.find(hostel => String(hostel.id) === String(hostelId))?.name || 'Unknown hostel'
  const getRoomNumber = roomId =>
    rooms.find(room => String(room.id) === String(roomId))?.roomNumber || roomId || 'Not assigned'

  const handleSave = async event => {
    event.preventDefault()
    if (!editingResident) return

    const duplicateEmail = users.some(user =>
      String(user.id) !== String(editingResident.id) &&
      user.email?.toLowerCase() === editingResident.email?.trim().toLowerCase()
    )
    if (duplicateEmail) {
      toast.error('That email address is already used by another account.')
      return
    }

    try {
      setSaving(true)
      await dispatch(updateUser({
        id: editingResident.id,
        userData: {
          ...editingResident,
          name: editingResident.name.trim(),
          email: editingResident.email.trim()
        }
      })).unwrap()
      toast.success('Resident details updated.')
      setEditingResident(null)
    } catch {
      toast.error('Could not update the resident details.')
    } finally {
      setSaving(false)
    }
  }

  const handleVacate = async () => {
    const resident = vacatingResident
    if (!resident) return
    const vacatedBookings = []
    let residentWasUpdated = false

    try {
      setVacating(true)
      const latestBookings = await dispatch(fetchBookings()).unwrap()
      const residentBookings = latestBookings.filter(booking =>
        String(booking.userId) === String(resident.id) &&
        String(booking.hostelId) === String(resident.hostelId) &&
        String(booking.roomId) === String(resident.roomId) &&
        booking.status === 'approved'
      )

      await dispatch(updateUser({
        id: resident.id,
        userData: {
          ...resident,
          status: vacateAccountStatus,
          hostelId: '',
          roomId: ''
        }
      })).unwrap()
      residentWasUpdated = true

      for (const booking of residentBookings) {
        await dispatch(updateBooking({
          id: booking.id,
          bookingData: { ...booking, status: 'vacated' }
        })).unwrap()
        vacatedBookings.push(booking)
      }

      toast.success(
        vacateAccountStatus === 'active'
          ? 'Resident vacated. They can now request another hostel.'
          : 'Resident vacated and account set to inactive.'
      )
      setVacatingResident(null)
    } catch {
      for (const booking of vacatedBookings) {
        try {
          await dispatch(updateBooking({ id: booking.id, bookingData: booking })).unwrap()
        } catch {
          toast.error('A booking record could not be restored. Please review this resident’s booking history.')
        }
      }
      if (residentWasUpdated) {
        try {
          await dispatch(updateUser({
            id: resident.id,
            userData: resident
          })).unwrap()
        } catch {
          toast.error('The resident assignment could not be restored. Check the resident record before continuing.')
        }
      }
      toast.error('Could not vacate this resident.')
    } finally {
      setVacating(false)
    }
  }

  const handleDelete = async resident => {
    if (resident.hostelId || resident.roomId) {
      toast.error('Vacate this resident before permanently deleting the account.')
      return
    }

    if (!hasVacatedOwnerBooking(resident)) {
      toast.error('A resident must be vacated from your hostel before deletion.')
      return
    }

    const confirmed = window.confirm(
      'This resident has been vacated. Permanently delete ' + resident.name + '’s account? This cannot be undone. ' +
      'Existing bookings and complaints will remain in their records.'
    )
    if (!confirmed) return

    const vacatedBookings = []
    try {
      const latestBookings = await dispatch(fetchBookings()).unwrap()
      const latestUsers = await dispatch(fetchUsers()).unwrap()
      const latestResident = latestUsers.find(user => String(user.id) === String(resident.id))
      if (!latestResident || latestResident.hostelId || latestResident.roomId) {
        toast.error('The resident has a current assignment. Vacate them before deleting the account.')
        return
      }
      if (!hasVacatedOwnerBooking(latestResident, latestBookings)) {
        toast.error('A resident must be vacated from your hostel before deletion.')
        return
      }

      const residentBookings = latestBookings.filter(booking =>
        String(booking.userId) === String(resident.id) &&
        ownerHostelIds.includes(String(booking.hostelId)) &&
        booking.status === 'approved'
      )

      for (const booking of residentBookings) {
        await dispatch(updateBooking({
          id: booking.id,
          bookingData: { ...booking, status: 'vacated' }
        })).unwrap()
        vacatedBookings.push(booking)
      }

      await dispatch(deleteUser(resident.id)).unwrap()
      toast.success('Resident account permanently deleted.')
    } catch {
      for (const booking of vacatedBookings) {
        try {
          await dispatch(updateBooking({ id: booking.id, bookingData: booking })).unwrap()
        } catch {
          toast.error('A booking could not be restored. Please review the booking history.')
        }
      }
      toast.error('Could not delete this resident account.')
    }
  }

  const updateEditField = event => {
    const { name, value } = event.target
    setEditingResident(current => ({ ...current, [name]: value }))
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          
          <h1>Residents</h1>
          
        
        </div>
        <div className={styles.totalBadge}>
          <FaUser />
          <span>{ownerResidents.length} residents</span>
        </div>
      </header>

      <section className={styles.stats}>
        <article className={styles.statCard}>
          <span className={styles.statIcon}><FaUser /></span>
          <div><small>Active accounts</small><strong>{activeCount}</strong></div>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statIcon + ' ' + styles.inactiveIcon}><FaUserSlash /></span>
          <div><small>Inactive accounts</small><strong>{inactiveCount}</strong></div>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statIcon + ' ' + styles.hostelIcon}><FaBuilding /></span>
          <div><small>Your hostels</small><strong>{ownerHostels.length}</strong></div>
        </article>
      </section>

      <section className={styles.contentCard}>
        <div className={styles.toolbar}>
          <label className={styles.searchBox}>
            <FaSearch />
            <input
              type="search"
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder="Search resident name"
              aria-label="Search resident name"
            />
          </label>

          <label className={styles.selectLabel}>
            <span>Hostel</span>
            <select value={selectedHostelId} onChange={event => setSelectedHostelId(event.target.value)}>
              <option value="all">All my hostels</option>
              {ownerHostels.map(hostel => (
                <option key={hostel.id} value={hostel.id}>{hostel.name}</option>
              ))}
            </select>
          </label>

          <label className={styles.selectLabel}>
            <span>Account status</span>
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
              <option value="all">All accounts</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

       <br></br>

        {loading ? (
          <div className={styles.emptyState}>Loading residents…</div>
        ) : filteredResidents.length === 0 ? (
          <div className={styles.emptyState}>
            {ownerHostels.length ? 'No residents match these filters.' : 'You do not have any hostels yet.'}
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Hostel</th>
                  <th>Room</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResidents.map(resident => {
                  const residentRecord = getResidentRecord(resident)
                  const isCurrentAssignment =
                    !residentRecord.isFormer &&
                    String(resident.hostelId) === String(residentRecord.hostelId)
                  const hasCurrentAssignment = Boolean(resident.hostelId || resident.roomId)
                  const mayEditResident = canEditResident(resident)
                  const mayDeleteResident = canDeleteResident(resident)

                  return (
                  <tr key={resident.id}>
                    <td>
                      <div className={styles.residentCell}>
                        <span className={styles.avatar}>{resident.name?.charAt(0)?.toUpperCase() || <FaUser />}</span>
                        <span><strong>{resident.name || 'Unnamed resident'}</strong><small>{resident.email}</small></span>
                      </div>
                    </td>
                    <td>{getHostelName(residentRecord.hostelId)}</td>
                    <td><span className={styles.roomLabel}><FaBed /> {residentRecord.isFormer ? 'Former · ' : ''}{getRoomNumber(residentRecord.roomId)}</span></td>
                    <td>{resident.phone || '—'}</td>
                    <td><span className={styles.status + ' ' + (resident.status === 'active' ? styles.active : styles.inactive)}>{resident.status || 'inactive'}</span></td>
                    <td>
                      <div className={styles.actions}>
                        {mayEditResident && (
                          <button type="button" className={styles.editButton} onClick={() => setEditingResident({ ...resident })} title="Edit resident details" aria-label={'Edit ' + resident.name}>
                            <FaEdit /><span>Edit</span>
                          </button>
                        )}
                        {resident.status === 'active' && isCurrentAssignment && (
                          <button type="button" className={styles.vacateButton} onClick={() => {
                            setVacatingResident({ ...resident })
                            setVacateAccountStatus('active')
                          }} title="Vacate resident" aria-label={'Vacate ' + resident.name}>
                            <FaUserSlash /><span>Vacate</span>
                          </button>
                        )}
                        {mayDeleteResident ? (
                          <button type="button" className={styles.deleteButton} onClick={() => handleDelete(resident)} title="Permanently delete account" aria-label={'Permanently delete ' + resident.name}>
                            <FaTrash /><span>Delete</span>
                          </button>
                        ) : hasCurrentAssignment && isCurrentAssignment ? (
                          <button type="button" className={styles.deleteButton} disabled title="Vacate this resident before permanently deleting the account" aria-label={'Vacate ' + resident.name + ' before deletion'}>
                            <FaTrash /><span>Vacate first</span>
                          </button>
                        ) : <span className={styles.historyOnly}>History</span>}
                      </div>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editingResident && (
        <div className={styles.modalOverlay} onMouseDown={event => event.target === event.currentTarget && setEditingResident(null)}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="edit-resident-title">
            <div className={styles.modalHeader}>
              <div><span className={styles.eyebrow}>RESIDENT RECORD</span><h2 id="edit-resident-title">Edit details</h2></div>
              <button type="button" className={styles.closeButton} onClick={() => setEditingResident(null)} aria-label="Close">×</button>
            </div>
            <form onSubmit={handleSave}>
              <label className={styles.formField}>Full name<input name="name" value={editingResident.name || ''} onChange={updateEditField} required /></label>
              <label className={styles.formField}>Email address<input type="email" name="email" value={editingResident.email || ''} onChange={updateEditField} required /></label>
              <label className={styles.formField}>Phone number<input name="phone" value={editingResident.phone || ''} onChange={updateEditField} /></label>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setEditingResident(null)}>Cancel</button>
                <button type="submit" className={styles.saveButton} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {vacatingResident && (
        <div className={styles.modalOverlay} onMouseDown={event => event.target === event.currentTarget && !vacating && setVacatingResident(null)}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="vacate-resident-title">
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.eyebrow}>VACATE HOSTEL</span>
                <h2 id="vacate-resident-title">{vacatingResident.name}</h2>
              </div>
              <button type="button" className={styles.closeButton} onClick={() => setVacatingResident(null)} disabled={vacating} aria-label="Close">×</button>
            </div>

            <label className={styles.formField}>
              Account status after vacating
              <select value={vacateAccountStatus} onChange={event => setVacateAccountStatus(event.target.value)} disabled={vacating}>
                <option value="active">Active </option>
                <option value="inactive">Inactive </option>
              </select>
            </label>
            <div className={styles.modalActions}>
              <button type="button" className={styles.cancelButton} onClick={() => setVacatingResident(null)} disabled={vacating}>Cancel</button>
              <button type="button" className={styles.saveButton} onClick={handleVacate} disabled={vacating}>
                {vacating ? 'Updating…' : 'Confirm vacate'}
              </button>
            </div>
          </section>
        </div>
      )}

    </div>
  )
}

export default OwnerResidents
