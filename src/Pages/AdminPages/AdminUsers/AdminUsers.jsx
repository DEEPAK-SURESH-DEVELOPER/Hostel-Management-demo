
import React, { useEffect, useState } from 'react'
import { FaEdit, FaTrash, FaSearch, FaUser } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  fetchUsers,
  updateUser,
  deleteUser
} from '../../../Redux/Slices/userSlice'
import styles from './AdminUsers.module.css'

const AdminUsers = () => {
  const dispatch = useDispatch()

  const { users, loading } = useSelector(state => state.users)

  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showEdit, setShowEdit] = useState(false)

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  const normalUsers = users.filter(user => user.role === 'user')

  const filteredUsers = normalUsers.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleEdit = user => {
    setSelectedUser(user)
    setShowEdit(true)
  }

  const handleUpdate = async e => {
    e.preventDefault()

    try {
      await dispatch(
        updateUser({
          id: selectedUser.id,
          userData: selectedUser
        })
      ).unwrap()

      toast.success('User updated successfully')
      setShowEdit(false)
      setSelectedUser(null)
    } catch (error) {
      toast.error('Failed to update user')
    }
  }

  const handleDelete = async id => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this user?'
    )

    if (!confirmDelete) return

    try {
      await dispatch(deleteUser(id)).unwrap()
      toast.success('User deleted successfully')
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  return (
    <div className={styles.usersPage}>

      <div className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>Management</span>
          <h1>Users</h1>
          <p>Manage registered users of HostelHub.</p>
        </div>

        <div className={styles.totalUsers}>
          <FaUser />
          <span>{normalUsers.length} Users</span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <FaSearch />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableCard}>

        {loading ? (
          <div className={styles.loading}>
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className={styles.empty}>
            No users found.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table>

              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>

                    <td>
                      <div className={styles.userInfo}>
                        <div className={styles.avatar}>
                          <FaUser />
                        </div>

                        <div>
                          <strong>{user.name}</strong>
                          <span>ID: {user.id}</span>
                        </div>
                      </div>
                    </td>

                    <td>{user.email}</td>

                    <td>{user.phone || 'Not available'}</td>

                    <td>
                      <span
                        className={`${styles.status} ${
                          user.status === 'active'
                            ? styles.active
                            : styles.inactive
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td>
                      <div className={styles.actions}>

                        <button
                          className={styles.editButton}
                          onClick={() => handleEdit(user)}
                        >
                          <FaEdit />
                        </button>

                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(user.id)}
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

      {showEdit && selectedUser && (
        <div className={styles.modalOverlay}>

          <div className={styles.modal}>

            <div className={styles.modalHeader}>
              <div>
                <span className={styles.eyebrow}>User Management</span>
                <h2>Edit User</h2>
              </div>

              <button
                className={styles.closeButton}
                onClick={() => {
                  setShowEdit(false)
                  setSelectedUser(null)
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdate}>

              <div className={styles.formGroup}>
                <label>Name</label>
                <input
                  type="text"
                  value={selectedUser.name}
                  onChange={e =>
                    setSelectedUser({
                      ...selectedUser,
                      name: e.target.value
                    })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={e =>
                    setSelectedUser({
                      ...selectedUser,
                      email: e.target.value
                    })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label>Phone</label>
                <input
                  type="text"
                  value={selectedUser.phone || ''}
                  onChange={e =>
                    setSelectedUser({
                      ...selectedUser,
                      phone: e.target.value
                    })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label>Status</label>

                <select
                  value={selectedUser.status}
                  onChange={e =>
                    setSelectedUser({
                      ...selectedUser,
                      status: e.target.value
                    })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className={styles.modalActions}>

                <button
                  type="button"
                  onClick={() => {
                    setShowEdit(false)
                    setSelectedUser(null)
                  }}
                >
                  Cancel
                </button>

                <button type="submit">
                  Save Changes
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  )
}

export default AdminUsers