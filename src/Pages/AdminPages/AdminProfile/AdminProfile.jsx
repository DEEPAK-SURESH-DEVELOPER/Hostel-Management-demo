import React, { useEffect, useState } from 'react'
import { FaUserShield, FaEnvelope, FaPhone, FaShieldAlt, FaEdit, FaSave, FaTimes, FaKey, FaLock } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { fetchUsers, updateUser } from '../../../Redux/Slices/userSlice'
import styles from './AdminProfile.module.css'

const AdminProfile = () => {
  const dispatch = useDispatch()
  const { users, loading } = useSelector(state => state.users)

  const [admin, setAdmin] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [passwordMode, setPasswordMode] = useState(false)
  const [formData, setFormData] = useState({})
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  useEffect(() => {
    const adminUser = users.find(user => user.role === 'admin')

    if (adminUser) {
      setAdmin(adminUser)
      setFormData(adminUser)
    }
  }, [users])

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePasswordChange = e => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordSave = async e => {
    e.preventDefault()

    if (!passwordData.currentPassword) {
      toast.error('Enter your current password')
      return
    }

    if (passwordData.currentPassword !== admin.password) {
      toast.error('Current password is incorrect')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must contain at least 6 characters')
      return
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      toast.error('New password must be different from current password')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      const updatedAdmin = await dispatch(
        updateUser({
          id: admin.id,
          userData: {
            ...admin,
            password: passwordData.newPassword
          }
        })
      ).unwrap()

      setAdmin(updatedAdmin)
      localStorage.setItem('hostelHubUser', JSON.stringify(updatedAdmin))
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setPasswordMode(false)
      toast.success('Password changed successfully')
    } catch (error) {
      toast.error('Failed to change password')
    }
  }

  const handleCancelPassword = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setPasswordMode(false)
  }

  const handleEdit = () => {
    setFormData(admin)
    setEditMode(true)
  }

  const handleCancel = () => {
    setFormData(admin)
    setEditMode(false)
  }

  const handleSave = async e => {
    e.preventDefault()

    try {
      await dispatch(
        updateUser({
          id: admin.id,
          userData: {
            ...admin,
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          }
        })
      ).unwrap()

      setAdmin({
        ...admin,
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      })

      setEditMode(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  if (loading && !admin) {
    return <div className={styles.loading}>Loading profile...</div>
  }

  if (!admin) {
    return (
      <div className={styles.empty}>
        <FaUserShield />
        <h3>Admin profile not found</h3>
        <p>Unable to load administrator information.</p>
      </div>
    )
  }

  return (
    <div className={styles.profilePage}>

      <div className={styles.profileHero}>

        <div className={styles.heroPattern}></div>

        <div className={styles.avatarSection}>
          <div className={styles.avatar}>{admin.name?.charAt(0).toUpperCase()}</div>
          <div className={styles.onlineDot}></div>
        </div>

        <div className={styles.identity}>
          <span className={styles.heroLabel}>HOSTELHUB ADMINISTRATION</span>
          <h1>{admin.name}</h1>
          <p>System Administrator</p>
          <span className={styles.activeBadge}>● Active Account</span>
        </div>

        {!editMode && (
          <button className={styles.editButton} onClick={handleEdit}>
            <FaEdit /> Edit Profile
          </button>
        )}

      </div>

      {editMode ? (
        <form className={styles.editArea} onSubmit={handleSave}>

          <div className={styles.sectionHeader}>
            <div>
              <span>PERSONAL DETAILS</span>
              <h2>Edit your profile</h2>
            </div>
            <FaUserShield />
          </div>

          <div className={styles.formGrid}>

            <div className={styles.field}>
              <label>Full Name</label>
              <div className={styles.inputBox}>
                <FaUserShield />
                <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required />
              </div>
            </div>

            <div className={styles.field}>
              <label>Email Address</label>
              <div className={styles.inputBox}>
                <FaEnvelope />
                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required />
              </div>
            </div>

            <div className={styles.field}>
              <label>Phone Number</label>
              <div className={styles.inputBox}>
                <FaPhone />
                <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} />
              </div>
            </div>

            <div className={styles.field}>
              <label>Role</label>
              <div className={`${styles.inputBox} ${styles.disabledInput}`}>
                <FaShieldAlt />
                <input type="text" value="Administrator" disabled />
              </div>
            </div>

          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton} onClick={handleCancel}>
              <FaTimes /> Cancel
            </button>

            <button type="submit" className={styles.saveButton}>
              <FaSave /> Save Changes
            </button>
          </div>

        </form>
      ) : (
        <div className={styles.profileContent}>

          <div className={styles.detailsSection}>

            <div className={styles.sectionHeader}>
              <div>
                <span>PERSONAL DETAILS</span>
                <h2>Account Information</h2>
              </div>
              <FaUserShield />
            </div>

            <div className={styles.detailsGrid}>

              <div className={styles.detail}>
                <div className={styles.detailIcon}><FaUserShield /></div>
                <div>
                  <span>Full Name</span>
                  <strong>{admin.name}</strong>
                </div>
              </div>

              <div className={styles.detail}>
                <div className={styles.detailIcon}><FaEnvelope /></div>
                <div>
                  <span>Email Address</span>
                  <strong>{admin.email}</strong>
                </div>
              </div>

              <div className={styles.detail}>
                <div className={styles.detailIcon}><FaPhone /></div>
                <div>
                  <span>Phone Number</span>
                  <strong>{admin.phone || 'Not available'}</strong>
                </div>
              </div>

              <div className={styles.detail}>
                <div className={styles.detailIcon}><FaShieldAlt /></div>
                <div>
                  <span>Account Role</span>
                  <strong>Administrator</strong>
                </div>
              </div>

            </div>

          </div>

          <div className={styles.securitySection}>

            <div className={styles.securityTop}>
              <div className={styles.securityIcon}><FaShieldAlt /></div>

              <div>
                <span>SECURITY</span>
                <h2>Account Security</h2>
              </div>
            </div>

            <div className={styles.securityRow}>
              <div className={styles.keyIcon}><FaKey /></div>

              <div className={styles.securityInfo}>
                <strong>Password</strong>
                <span>Use your current password to set a new one.</span>
              </div>
            </div>

            {!passwordMode ? (
                <button className={styles.securityButton} onClick={() => setPasswordMode(true)}>
                  Change Password
                </button>
              ) : (
                <form className={styles.passwordForm} onSubmit={handlePasswordSave}>
                  <div className={styles.passwordField}>
                    <label htmlFor="admin-current-password">Current Password</label>
                    <div className={styles.passwordInput}>
                      <FaLock />
                      <input id="admin-current-password" type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder="Enter current password" required />
                    </div>
                  </div>

                  <div className={styles.passwordField}>
                    <label htmlFor="admin-new-password">New Password</label>
                    <div className={styles.passwordInput}>
                      <FaLock />
                      <input id="admin-new-password" type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="Minimum 6 characters" minLength={6} required />
                    </div>
                  </div>

                  <div className={styles.passwordField}>
                    <label htmlFor="admin-confirm-password">Confirm New Password</label>
                    <div className={styles.passwordInput}>
                      <FaLock />
                      <input id="admin-confirm-password" type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} placeholder="Confirm new password" required />
                    </div>
                  </div>

                  <div className={styles.passwordActions}>
                    <button type="button" className={styles.passwordCancel} onClick={handleCancelPassword}>
                      <FaTimes /> Cancel
                    </button>
                    <button type="submit" className={styles.passwordSave} disabled={loading}>
                      <FaSave /> {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
            )}

          </div>

          <div className={styles.accountFooter}>
            <div>
              <span>ACCOUNT ID</span>
              <strong>{admin.id}</strong>
            </div>

            <div>
              <span>ACCOUNT STATUS</span>
              <strong className={styles.accountStatus}>● {admin.status}</strong>
            </div>

            <div>
              <span>ACCESS LEVEL</span>
              <strong>Full Administration</strong>
            </div>
          </div>

        </div>
      )}

    </div>
  )
}

export default AdminProfile
