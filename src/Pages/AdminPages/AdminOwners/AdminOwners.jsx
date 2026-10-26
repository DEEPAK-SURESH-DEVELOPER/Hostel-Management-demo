import React, { useEffect, useMemo, useState } from 'react'
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaCheckCircle,
  FaTimes,
  FaKey,
  FaUser
} from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  fetchUsers,
  updateUser,
  deleteUser
} from '../../../Redux/Slices/userSlice'
import styles from './AdminOwners.module.css'

const AdminOwners = () => {
  const dispatch = useDispatch()
  const { users, loading } = useSelector(state => state.users)

  const [search, setSearch] = useState('')
  const [selectedOwner, setSelectedOwner] = useState(null)
  const [showEdit, setShowEdit] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  const owners = useMemo(() => {
    return users.filter(user => user.role === 'owner')
  }, [users])

  const filteredOwners = useMemo(() => {
    return owners.filter(owner =>
      owner.name.toLowerCase().includes(search.toLowerCase()) ||
      owner.email.toLowerCase().includes(search.toLowerCase())
    )
  }, [owners, search])

  const handleEdit = owner => {
    setSelectedOwner({ ...owner })
    setNewPassword('')
    setShowEdit(true)
  }

  const handleClose = () => {
    setShowEdit(false)
    setSelectedOwner(null)
    setNewPassword('')
  }

  const handleUpdate = async e => {
    e.preventDefault()

    if (!selectedOwner.name.trim()) {
      toast.error('Name is required')
      return
    }

    if (!selectedOwner.email.trim()) {
      toast.error('Email is required')
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(selectedOwner.email)) {
      toast.error('Enter a valid email address')
      return
    }

    if (
      selectedOwner.phone &&
      !/^\d{10}$/.test(selectedOwner.phone)
    ) {
      toast.error('Phone number must contain 10 digits')
      return
    }

    if (
      newPassword &&
      newPassword.length < 6
    ) {
      toast.error('Password must contain at least 6 characters')
      return
    }

    try {
      const updatedOwner = {
        ...selectedOwner,
        name: selectedOwner.name.trim(),
        email: selectedOwner.email.trim(),
        phone: selectedOwner.phone?.trim() || ''
      }

      if (newPassword.trim()) {
        updatedOwner.password = newPassword.trim()
      }

      await dispatch(
        updateUser({
          id: selectedOwner.id,
          userData: updatedOwner
        })
      ).unwrap()

      toast.success('Owner account updated successfully')

      handleClose()
    } catch (error) {
      toast.error('Failed to update owner account')
    }
  }

  const handleDelete = async id => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this owner?'
    )

    if (!confirmDelete) return

    try {
      await dispatch(deleteUser(id)).unwrap()
      toast.success('Owner deleted successfully')
    } catch (error) {
      toast.error('Failed to delete owner')
    }
  }

  return (
    <div className={styles.ownersPage}>

      <div className={styles.pageHeader}>

        <div className={styles.headerContent}>
          <span className={styles.eyebrow}>
            OWNER MANAGEMENT
          </span>

          <h1>
            Hostel Owners
          </h1>

          <p>
            Manage owner accounts, login credentials and
            account access.
          </p>
        </div>

        <div className={styles.totalOwners}>
          <div className={styles.totalIcon}>
            <FaUserTie />
          </div>

          <div>
            <strong>{owners.length}</strong>
            <span>Total Owners</span>
          </div>
        </div>

      </div>

      <div className={styles.toolbar}>

        <div className={styles.searchBox}>
          <FaSearch />

          <input
            type="text"
            placeholder="Search by owner name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.resultCount}>
          {filteredOwners.length} owner
          {filteredOwners.length !== 1 ? 's' : ''} found
        </div>

      </div>

      <div className={styles.tableCard}>

        <div className={styles.tableTop}>
          <div>
            <h2>Registered Owners</h2>
            <p>
              Review and manage hostel owner accounts.
            </p>
          </div>

          <div className={styles.secureBadge}>
            <FaKey />
            Account Management
          </div>
        </div>

        {loading ? (

          <div className={styles.message}>
            <div className={styles.loadingIcon}>
              <FaUserTie />
            </div>

            <h3>Loading owners...</h3>
            <p>Please wait while owner accounts are loaded.</p>
          </div>

        ) : filteredOwners.length === 0 ? (

          <div className={styles.message}>
            <div className={styles.emptyIcon}>
              <FaUserTie />
            </div>

            <h3>No owners found</h3>
            <p>
              Try changing your search keyword.
            </p>
          </div>

        ) : (

          <div className={styles.tableWrapper}>

            <table>

              <thead>
                <tr>
                  <th>Owner</th>
                  <th>Login Email</th>
                  <th>Phone</th>
                  <th>Account Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredOwners.map(owner => (

                  <tr key={owner.id}>

                    <td>

                      <div className={styles.ownerInfo}>

                        <div className={styles.avatar}>
                          {owner.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {owner.name}
                          </strong>

                          <span>
                            Owner ID #{owner.id}
                          </span>
                        </div>

                      </div>

                    </td>

                    <td>

                      <div className={styles.emailCell}>
                        <FaEnvelope />
                        <span>{owner.email}</span>
                      </div>

                    </td>

                    <td>

                      <div className={styles.phoneCell}>
                        <FaPhone />
                        <span>
                          {owner.phone || 'Not available'}
                        </span>
                      </div>

                    </td>

                    <td>

                      <span
                        className={`${styles.status} ${
                          owner.status === 'active'
                            ? styles.active
                            : styles.inactive
                        }`}
                      >
                        <i></i>
                        {owner.status}
                      </span>

                    </td>

                    <td>

                      <div className={styles.actions}>

                        <button
                          className={styles.editButton}
                          onClick={() => handleEdit(owner)}
                          title="Edit owner"
                        >
                          <FaEdit />
                        </button>

                        <button
                          className={styles.deleteButton}
                          onClick={() =>
                            handleDelete(owner.id)
                          }
                          title="Delete owner"
                        >
                          <FaTrash />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {showEdit && selectedOwner && (

        <div
          className={styles.modalOverlay}
          onClick={handleClose}
        >

          <div
            className={styles.modal}
            onClick={e => e.stopPropagation()}
          >

            <div className={styles.modalHeader}>

              <div className={styles.modalTitle}>

                <div className={styles.modalIcon}>
                  <FaUserTie />
                </div>

                <div>
                  <span>
                    OWNER ACCOUNT
                  </span>

                  <h2>
                    Edit Owner
                  </h2>

                  <p>
                    Update profile and login credentials
                  </p>
                </div>

              </div>

              <button
                className={styles.closeButton}
                onClick={handleClose}
              >
                <FaTimes />
              </button>

            </div>

            <form
              className={styles.form}
              onSubmit={handleUpdate}
            >

              <div className={styles.formSection}>

                <div className={styles.sectionTitle}>
                  <FaUser />
                  <div>
                    <h3>Personal Information</h3>
                    <p>
                      Update the owner's basic information.
                    </p>
                  </div>
                </div>

                <div className={styles.formGrid}>

                  <div className={styles.formGroup}>

                    <label>
                      Full Name
                    </label>

                    <div className={styles.inputWrapper}>
                      <FaUser />

                      <input
                        type="text"
                        value={selectedOwner.name}
                        onChange={e =>
                          setSelectedOwner({
                            ...selectedOwner,
                            name: e.target.value
                          })
                        }
                        placeholder="Owner name"
                      />
                    </div>

                  </div>

                  <div className={styles.formGroup}>

                    <label>
                      Phone Number
                    </label>

                    <div className={styles.inputWrapper}>
                      <FaPhone />

                      <input
                        type="text"
                        value={selectedOwner.phone || ''}
                        onChange={e =>
                          setSelectedOwner({
                            ...selectedOwner,
                            phone: e.target.value
                          })
                        }
                        placeholder="10 digit phone number"
                        maxLength="10"
                      />
                    </div>

                  </div>

                </div>

              </div>

              <div className={styles.formSection}>

                <div className={styles.sectionTitle}>
                  <FaLock />

                  <div>
                    <h3>Login Credentials</h3>

                    <p>
                      Change the email or password used
                      by this owner to log in.
                    </p>
                  </div>
                </div>

                <div className={styles.formGrid}>

                  <div className={styles.formGroup}>

                    <label>
                      Login Email
                    </label>

                    <div className={styles.inputWrapper}>
                      <FaEnvelope />

                      <input
                        type="email"
                        value={selectedOwner.email}
                        onChange={e =>
                          setSelectedOwner({
                            ...selectedOwner,
                            email: e.target.value
                          })
                        }
                        placeholder="Owner login email"
                      />
                    </div>

                    <small>
                      This email will be used during login.
                    </small>

                  </div>

                  <div className={styles.formGroup}>

                    <label>
                      New Password
                    </label>

                    <div className={styles.inputWrapper}>
                      <FaLock />

                      <input
                        type="password"
                        value={newPassword}
                        onChange={e =>
                          setNewPassword(e.target.value)
                        }
                        placeholder="Enter new password"
                      />
                    </div>

                    <small>
                      Leave empty to keep the current password.
                    </small>

                  </div>

                </div>

                <div className={styles.passwordNotice}>
                  <FaKey />

                  <div>
                    <strong>
                      Password update
                    </strong>

                    <p>
                      The new password will immediately become
                      the owner's login password.
                    </p>
                  </div>
                </div>

              </div>

              <div className={styles.formSection}>

                <div className={styles.sectionTitle}>
                  <FaCheckCircle />

                  <div>
                    <h3>Account Access</h3>

                    <p>
                      Control whether this owner can access
                      the owner dashboard.
                    </p>
                  </div>
                </div>

                <div className={styles.statusSelector}>

                  <button
                    type="button"
                    className={
                      selectedOwner.status === 'active'
                        ? styles.selectedStatus
                        : ''
                    }
                    onClick={() =>
                      setSelectedOwner({
                        ...selectedOwner,
                        status: 'active'
                      })
                    }
                  >
                    <FaCheckCircle />

                    <div>
                      <strong>Active</strong>
                      <span>
                        Owner can log in and manage hostels.
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={
                      selectedOwner.status === 'inactive'
                        ? styles.selectedInactiveStatus
                        : ''
                    }
                    onClick={() =>
                      setSelectedOwner({
                        ...selectedOwner,
                        status: 'inactive'
                      })
                    }
                  >
                    <FaTimes />

                    <div>
                      <strong>Inactive</strong>
                      <span>
                        Owner account access is disabled.
                      </span>
                    </div>
                  </button>

                </div>

              </div>

              <div className={styles.modalActions}>

                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleClose}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={styles.saveButton}
                >
                  <FaCheckCircle />
                  Save Owner Changes
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default AdminOwners