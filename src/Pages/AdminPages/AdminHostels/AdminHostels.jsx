import React, { useEffect, useState } from 'react'
import { FaEdit, FaTrash, FaSearch, FaBuilding, FaCheck, FaTimes } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { fetchHostels, updateHostel, deleteHostel } from '../../../Redux/Slices/hostelSlice'
import { fetchUsers } from '../../../Redux/Slices/userSlice'
import styles from './AdminHostels.module.css'

const AdminHostels = () => {
  const dispatch = useDispatch()
  const { hostels, loading } = useSelector(state => state.hostels)
  const { users } = useSelector(state => state.users)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedHostel, setSelectedHostel] = useState(null)
  const [showEdit, setShowEdit] = useState(false)

  useEffect(() => {
    dispatch(fetchHostels())
    dispatch(fetchUsers())
  }, [dispatch])

  const getOwnerName = ownerId => {
    const owner = users.find(user => user.id === ownerId)
    return owner ? owner.name : 'Unknown Owner'
  }

  const filteredHostels = hostels.filter(hostel => {
    const matchesSearch =
      hostel.name.toLowerCase().includes(search.toLowerCase()) ||
      hostel.location.toLowerCase().includes(search.toLowerCase()) ||
      getOwnerName(hostel.ownerId).toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || hostel.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleEdit = hostel => {
    setSelectedHostel({
      ...hostel,
      facilities: hostel.facilities ? hostel.facilities.join(', ') : ''
    })
    setShowEdit(true)
  }

  const handleUpdate = async e => {
    e.preventDefault()

    try {
      const hostelData = {
        ...selectedHostel,
        facilities: selectedHostel.facilities.split(',').map(item => item.trim()).filter(item => item)
      }

      await dispatch(updateHostel({ id: selectedHostel.id, hostelData })).unwrap()

      toast.success('Hostel updated successfully')
      setShowEdit(false)
      setSelectedHostel(null)
      dispatch(fetchHostels())
    } catch (error) {
      toast.error('Failed to update hostel')
    }
  }

  const handleStatusChange = async (hostel, status) => {
    try {
      await dispatch(
        updateHostel({
          id: hostel.id,
          hostelData: { ...hostel, status }
        })
      ).unwrap()

      toast.success(`Hostel ${status} successfully`)
      dispatch(fetchHostels())
    } catch (error) {
      toast.error(`Failed to ${status} hostel`)
    }
  }

  const handleDelete = async id => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this hostel?'
    )

    if (!confirmDelete) return

    try {
      await dispatch(deleteHostel(id)).unwrap()
      toast.success('Hostel deleted successfully')
    } catch (error) {
      toast.error('Failed to delete hostel')
    }
  }

  return (
    <div className={styles.hostelsPage}>

      <div className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>Management</span>
          <h1>Hostels</h1>
          <p>Manage and approve hostels registered on HostelHub.</p>
        </div>

        <div className={styles.totalHostels}><FaBuilding /><span>{hostels.length} Hostels</span></div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}><FaSearch /><input type="text" placeholder="Search hostels..." value={search} onChange={e => setSearch(e.target.value)} /></div>

        <select className={styles.filter} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.message}>Loading hostels...</div>
        ) : filteredHostels.length === 0 ? (
          <div className={styles.message}>No hostels found.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr><th>Hostel</th><th>Owner</th><th>Location</th><th>Status</th><th>Actions</th></tr>
              </thead>

              <tbody>
                {filteredHostels.map(hostel => (
                  <tr key={hostel.id}>
                    <td>
                      <div className={styles.hostelInfo}>
                        <div className={styles.avatar}><FaBuilding /></div>
                        <div><strong>{hostel.name}</strong><span>ID: {hostel.id}</span></div>
                      </div>
                    </td>

                    <td>{getOwnerName(hostel.ownerId)}</td>
                    <td>{hostel.location}</td>

                    <td><span className={`${styles.status} ${styles[hostel.status]}`}>{hostel.status}</span></td>

                    <td>
                      <div className={styles.actions}>
                        {hostel.status === 'pending' && (
                          <>
                            <button className={styles.approveButton} title="Approve" onClick={() => handleStatusChange(hostel, 'approved')}><FaCheck /></button>
                            <button className={styles.rejectButton} title="Reject" onClick={() => handleStatusChange(hostel, 'rejected')}><FaTimes /></button>
                          </>
                        )}

                        <button className={styles.editButton} title="Edit" onClick={() => handleEdit(hostel)}><FaEdit /></button>
                        <button className={styles.deleteButton} title="Delete" onClick={() => handleDelete(hostel.id)}><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showEdit && selectedHostel && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>

            <div className={styles.modalHeader}>
              <div><span className={styles.eyebrow}>Hostel Management</span><h2>Edit Hostel</h2></div>
              <button className={styles.closeButton} onClick={() => { setShowEdit(false); setSelectedHostel(null) }}>×</button>
            </div>

            <form onSubmit={handleUpdate}>

              <div className={styles.formGroup}><label>Hostel Name</label><input type="text" value={selectedHostel.name} onChange={e => setSelectedHostel({ ...selectedHostel, name: e.target.value })} /></div>

              <div className={styles.formGroup}><label>Location</label><input type="text" value={selectedHostel.location} onChange={e => setSelectedHostel({ ...selectedHostel, location: e.target.value })} /></div>

              <div className={styles.formGroup}><label>Address</label><input type="text" value={selectedHostel.address} onChange={e => setSelectedHostel({ ...selectedHostel, address: e.target.value })} /></div>

              <div className={styles.formGroup}><label>Description</label><textarea value={selectedHostel.description} onChange={e => setSelectedHostel({ ...selectedHostel, description: e.target.value })} /></div>

              <div className={styles.formGroup}><label>Facilities</label><input type="text" value={selectedHostel.facilities} onChange={e => setSelectedHostel({ ...selectedHostel, facilities: e.target.value })} /><small>Separate facilities with commas</small></div>

              <div className={styles.formGroup}>
                <label>Status</label>
                <select value={selectedHostel.status} onChange={e => setSelectedHostel({ ...selectedHostel, status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className={styles.modalActions}><button type="button" onClick={() => { setShowEdit(false); setSelectedHostel(null) }}>Cancel</button><button type="submit">Save Changes</button></div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default AdminHostels