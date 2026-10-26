import React, { useEffect, useMemo, useState } from 'react'
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaLock,
    FaEdit,
    FaSave,
    FaTimes,
    FaUserCircle
} from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
    fetchUsers,
    updateUser
} from '../../../Redux/Slices/userSlice'
import styles from './UserProfile.module.css'

const UserProfile = () => {
    const dispatch = useDispatch()

    const { users, loading } = useSelector(state => state.users)

    const loggedInUser = JSON.parse(
        localStorage.getItem('hostelHubUser')
    )

    const userId = loggedInUser?.id

    const [editMode, setEditMode] = useState(false)
    const [passwordMode, setPasswordMode] = useState(false)

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: ''
    })

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    useEffect(() => {
        dispatch(fetchUsers())
    }, [dispatch])

    const user = useMemo(() => {
        return users.find(
            item => String(item.id) === String(userId)
        )
    }, [users, userId])

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            })
        }
    }, [user])

    const handleProfileChange = e => {
        const { name, value } = e.target

        setProfileData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handlePasswordChange = e => {
        const { name, value } = e.target

        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleProfileSave = async e => {
        e.preventDefault()

        if (!profileData.name.trim()) {
            toast.error('Name is required')
            return
        }

        if (!profileData.email.trim()) {
            toast.error('Email is required')
            return
        }

        if (!profileData.phone.trim()) {
            toast.error('Phone number is required')
            return
        }

        try {
            const updatedUser = await dispatch(
                updateUser({
                    id: userId,
                    userData: {
                        ...user,
                        name: profileData.name.trim(),
                        email: profileData.email.trim(),
                        phone: profileData.phone.trim()
                    }
                })
            ).unwrap()

            localStorage.setItem(
                'hostelHubUser',
                JSON.stringify(updatedUser)
            )

            toast.success('Profile updated successfully')

            setEditMode(false)
        } catch (error) {
            toast.error('Failed to update profile')
        }
    }

    const handlePasswordSave = async e => {
        e.preventDefault()

        if (!passwordData.currentPassword) {
            toast.error('Enter your current password')
            return
        }

        if (
            passwordData.currentPassword !== user?.password
        ) {
            toast.error('Current password is incorrect')
            return
        }

        if (passwordData.newPassword.length < 6) {
            toast.error(
                'New password must contain at least 6 characters'
            )
            return
        }

        if (
            passwordData.newPassword ===
            passwordData.currentPassword
        ) {
            toast.error(
                'New password must be different from current password'
            )
            return
        }

        if (
            passwordData.newPassword !==
            passwordData.confirmPassword
        ) {
            toast.error('Passwords do not match')
            return
        }

        try {
            const updatedUser = await dispatch(
                updateUser({
                    id: userId,
                    userData: {
                        ...user,
                        password: passwordData.newPassword
                    }
                })
            ).unwrap()

            localStorage.setItem(
                'hostelHubUser',
                JSON.stringify(updatedUser)
            )

            toast.success('Password changed successfully')

            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            })

            setPasswordMode(false)
        } catch (error) {
            toast.error('Failed to change password')
        }
    }

    const handleCancelEdit = () => {
        setProfileData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || ''
        })

        setEditMode(false)
    }

    const handleCancelPassword = () => {
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        })

        setPasswordMode(false)
    }

    if (!user) {
        return (
            <div className={styles.loading}>
                Loading profile...
            </div>
        )
    }

    const userInitial = user.name
        ?.charAt(0)
        .toUpperCase()

    return (
        <div className={styles.page}>

            <div className={styles.topSection}>
                <div>
                    <span className={styles.pageLabel}>
                        ACCOUNT SETTINGS
                    </span>

                    <h1>My Profile</h1>

                    
                </div>
            </div>

            <div className={styles.profileHero}>

                <div className={styles.avatar}>
                    {userInitial}
                </div>

                <div className={styles.heroInfo}>
                    <h2>{user.name}</h2>

                    <p>
                        <FaEnvelope />
                        {user.email}
                    </p>

                    <span className={styles.roleBadge}>
                        Resident
                    </span>
                </div>

            </div>

            <div className={styles.contentGrid}>

                <section className={styles.card}>

                    <div className={styles.cardHeader}>

                        <div>
                            
                            <h3>Profile Details</h3>
                        </div>

                        {!editMode && (
                            <button
                                className={styles.editButton}
                                onClick={() => setEditMode(true)}
                            >
                                <FaEdit />
                                Edit
                            </button>
                        )}

                    </div>

                    <form onSubmit={handleProfileSave}>

                        <div className={styles.formGrid}>

                            <div className={styles.formGroup}>
                                <label>Full Name</label>

                                {editMode ? (
                                    <div className={styles.inputWrapper}>
                                        <FaUser />

                                        <input
                                            type="text"
                                            name="name"
                                            value={profileData.name}
                                            onChange={handleProfileChange}
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.valueBox}>
                                        <FaUser />
                                        <span>{user.name}</span>
                                    </div>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label>Email Address</label>

                                {editMode ? (
                                    <div className={styles.inputWrapper}>
                                        <FaEnvelope />

                                        <input
                                            type="email"
                                            name="email"
                                            value={profileData.email}
                                            onChange={handleProfileChange}
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.valueBox}>
                                        <FaEnvelope />
                                        <span>{user.email}</span>
                                    </div>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label>Phone Number</label>

                                {editMode ? (
                                    <div className={styles.inputWrapper}>
                                        <FaPhone />

                                        <input
                                            type="text"
                                            name="phone"
                                            value={profileData.phone}
                                            onChange={handleProfileChange}
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.valueBox}>
                                        <FaPhone />
                                        <span>
                                            {user.phone ||
                                                'Not provided'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label>Account Role</label>

                                <div className={styles.valueBox}>
                                    <FaUserCircle />

                                    <span className={styles.capitalize}>
                                        {user.role}
                                    </span>
                                </div>
                            </div>

                        </div>

                        {editMode && (
                            <div className={styles.formActions}>

                                <button
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={handleCancelEdit}
                                >
                                    <FaTimes />
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className={styles.saveButton}
                                    disabled={loading}
                                >
                                    <FaSave />
                                    {loading
                                        ? 'Saving...'
                                        : 'Save Changes'}
                                </button>

                            </div>
                        )}

                    </form>

                </section>

                <section className={styles.card}>

                    <div className={styles.cardHeader}>

                        <div>
                            
                            <h3>Password</h3>
                        </div>

                        <div className={styles.lockIcon}>
                            <FaLock />
                        </div>

                    </div>

                    <div className={styles.securityInfo}>

                        <div className={styles.securityIcon}>
                            <FaLock />
                        </div>

                        <div>
                            <strong>Account Password</strong>

                            <p>
                                Keep your password secure and change
                                it regularly.
                            </p>
                        </div>

                    </div>

                    {!passwordMode ? (
                        <button
                            className={styles.passwordButton}
                            onClick={() => setPasswordMode(true)}
                        >
                            <FaLock />
                            Change Password
                        </button>
                    ) : (
                        <form
                            className={styles.passwordForm}
                            onSubmit={handlePasswordSave}
                        >

                            <div className={styles.formGroup}>
                                <label>Current Password</label>

                                <div className={styles.inputWrapper}>
                                    <FaLock />

                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={
                                            passwordData.currentPassword
                                        }
                                        onChange={
                                            handlePasswordChange
                                        }
                                        placeholder="Enter current password"
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>New Password</label>

                                <div className={styles.inputWrapper}>
                                    <FaLock />

                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={
                                            passwordData.newPassword
                                        }
                                        onChange={
                                            handlePasswordChange
                                        }
                                        placeholder="Minimum 6 characters"
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Confirm New Password</label>

                                <div className={styles.inputWrapper}>
                                    <FaLock />

                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={
                                            passwordData.confirmPassword
                                        }
                                        onChange={
                                            handlePasswordChange
                                        }
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>

                            <div className={styles.formActions}>

                                <button
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={handleCancelPassword}
                                >
                                    <FaTimes />
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className={styles.saveButton}
                                    disabled={loading}
                                >
                                    <FaSave />
                                    {loading
                                        ? 'Updating...'
                                        : 'Update Password'}
                                </button>

                            </div>

                        </form>
                    )}

                </section>

            </div>

            <div className={styles.accountInfo}>

                <div className={styles.accountIcon}>
                    <FaUserCircle />
                </div>

                <div>
                    <span>ACCOUNT STATUS</span>
                    <strong>
                        {user.status === 'active'
                            ? 'Active'
                            : user.status}
                    </strong>
                </div>

               

            </div>

        </div>
    )
}

export default UserProfile