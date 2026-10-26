import React, { useEffect, useMemo, useState } from 'react'
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaBuilding,
    FaDoorOpen,
    FaShieldAlt,
    FaEdit,
    FaCheckCircle,
    FaTimes,
    FaIdBadge,
    FaLock
} from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
    fetchUsers,
    updateUser
} from '../../../Redux/Slices/userSlice'
import { fetchHostels } from '../../../Redux/Slices/hostelSlice'
import { fetchRooms } from '../../../Redux/Slices/roomSlice'
import styles from './OwnerProfile.module.css'

const OwnerProfile = () => {
    const dispatch = useDispatch()

    const { users } = useSelector(
        state => state.users
    )

    const { hostels } = useSelector(
        state => state.hostels
    )

    const { rooms } = useSelector(
        state => state.rooms
    )

    const [isEditing, setIsEditing] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    })

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const loggedInUser = JSON.parse(
        localStorage.getItem('hostelHubUser')
    )

    const ownerId = loggedInUser?.id

    useEffect(() => {
        dispatch(fetchUsers())
        dispatch(fetchHostels())
        dispatch(fetchRooms())
    }, [dispatch])

    const owner = useMemo(() => {
        return users.find(
            user =>
                String(user.id) ===
                String(ownerId)
        )
    }, [users, ownerId])

    const ownerHostels = useMemo(() => {
        return hostels.filter(
            hostel =>
                String(hostel.ownerId) ===
                String(ownerId)
        )
    }, [hostels, ownerId])

    const ownerHostelIds = ownerHostels.map(
        hostel => String(hostel.id)
    )

    const ownerRooms = rooms.filter(
        room =>
            ownerHostelIds.includes(
                String(room.hostelId)
            )
    )

    useEffect(() => {
        if (owner) {
            setFormData({
                name: owner.name || '',
                email: owner.email || '',
                phone: owner.phone || ''
            })
        }
    }, [owner])

    const handleChange = e => {
        const { name, value } = e.target

        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handlePasswordChange = e => {
        const { name, value } = e.target

        setPasswordData({
            ...passwordData,
            [name]: value
        })
    }

    const handleEdit = () => {
        setFormData({
            name: owner?.name || '',
            email: owner?.email || '',
            phone: owner?.phone || ''
        })

        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        })

        setIsEditing(true)
    }

    const handleCancel = () => {
        setFormData({
            name: owner?.name || '',
            email: owner?.email || '',
            phone: owner?.phone || ''
        })

        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        })

        setIsEditing(false)
    }

    const handleSubmit = async e => {
        e.preventDefault()

        if (
            !formData.name.trim() ||
            !formData.email.trim() ||
            !formData.phone.trim()
        ) {
            toast.error('Please fill all fields')
            return
        }

        if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            toast.error('Please enter a valid email address')
            return
        }

        if (!/^\d{10}$/.test(formData.phone)) {
            toast.error(
                'Phone number must contain 10 digits'
            )
            return
        }

        const changingPassword =
            passwordData.currentPassword ||
            passwordData.newPassword ||
            passwordData.confirmPassword

        if (changingPassword) {

            if (!passwordData.currentPassword) {
                toast.error(
                    'Please enter your current password'
                )
                return
            }

            if (
                passwordData.currentPassword !==
                owner.password
            ) {
                toast.error(
                    'Current password is incorrect'
                )
                return
            }

            if (!passwordData.newPassword) {
                toast.error(
                    'Please enter a new password'
                )
                return
            }

            if (
                passwordData.newPassword.length < 6
            ) {
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
                toast.error(
                    'New passwords do not match'
                )
                return
            }
        }

        try {
            const updatedUser = {
                ...owner,
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim()
            }

            if (changingPassword) {
                updatedUser.password =
                    passwordData.newPassword
            }

            const result = await dispatch(
                updateUser({
                    id: owner.id,
                    userData: updatedUser
                })
            ).unwrap()

            localStorage.setItem(
                'hostelHubUser',
                JSON.stringify(result)
            )

            if (changingPassword) {
                toast.success(
                    'Profile and password updated successfully'
                )
            } else {
                toast.success(
                    'Profile updated successfully'
                )
            }

            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            })

            setIsEditing(false)

        } catch (error) {
            toast.error(
                'Failed to update profile'
            )
        }
    }

    const getInitial = () => {
        if (!owner?.name) {
            return 'O'
        }

        return owner.name
            .charAt(0)
            .toUpperCase()
    }

    if (!owner) {
        return (
            <div className={styles.loading}>
                Loading profile...
            </div>
        )
    }

    return (
        <div className={styles.page}>

            <div className={styles.hero}>

                <div className={styles.heroPattern}></div>

                <div className={styles.heroContent}>

                    <div className={styles.avatarWrapper}>

                        <div className={styles.avatar}>
                            {getInitial()}
                        </div>

                        <div className={styles.onlineDot}></div>

                    </div>

                    <div className={styles.identity}>

                        <span className={styles.ownerLabel}>
                            HOSTEL OWNER
                        </span>

                        <h1>
                            {owner.name}
                        </h1>

                        

                        <div className={styles.identityMeta}>

                            <span>
                                <FaEnvelope />
                                {owner.email}
                            </span>

                            <span>
                                <FaCheckCircle />
                                {owner.status}
                            </span>

                        </div>

                    </div>

                    <button
                        className={
                            styles.editProfileButton
                        }
                        onClick={handleEdit}
                    >
                        <FaEdit />
                        Edit Profile
                    </button>

                </div>

            </div>

            <div className={styles.contentGrid}>

                <main>

                    <section className={styles.profileCard}>

                        <div className={styles.cardHeader}>

                            <div>

                                <span
                                    className={
                                        styles.cardEyebrow
                                    }
                                >
                                    PERSONAL DETAILS
                                </span>

                                <h2>
                                    Profile Information
                                </h2>

                            </div>

                            {!isEditing && (
                                <button
                                    className={
                                        styles.inlineEdit
                                    }
                                    onClick={handleEdit}
                                >
                                    <FaEdit />
                                    Edit
                                </button>
                            )}

                        </div>

                        {isEditing ? (

                            <form
                                className={styles.form}
                                onSubmit={handleSubmit}
                            >

                                <div
                                    className={
                                        styles.formGrid
                                    }
                                >

                                    <div
                                        className={
                                            styles.formGroup
                                        }
                                    >

                                        <label>
                                            Full Name
                                        </label>

                                        <div
                                            className={
                                                styles.inputWrapper
                                            }
                                        >

                                            <FaUser />

                                            <input
                                                type="text"
                                                name="name"
                                                value={
                                                    formData.name
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Enter your name"
                                            />

                                        </div>

                                    </div>

                                    <div
                                        className={
                                            styles.formGroup
                                        }
                                    >

                                        <label>
                                            Email Address
                                        </label>

                                        <div
                                            className={
                                                styles.inputWrapper
                                            }
                                        >

                                            <FaEnvelope />

                                            <input
                                                type="email"
                                                name="email"
                                                value={
                                                    formData.email
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Enter your email"
                                            />

                                        </div>

                                    </div>

                                    <div
                                        className={
                                            styles.formGroup
                                        }
                                    >

                                        <label>
                                            Phone Number
                                        </label>

                                        <div
                                            className={
                                                styles.inputWrapper
                                            }
                                        >

                                            <FaPhone />

                                            <input
                                                type="text"
                                                name="phone"
                                                value={
                                                    formData.phone
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Enter phone number"
                                                maxLength="10"
                                            />

                                        </div>

                                    </div>

                                </div>

                                <div
                                    className={
                                        styles.passwordSection
                                    }
                                >

                                    <div
                                        className={
                                            styles.passwordHeader
                                        }
                                    >

                                        <div
                                            className={
                                                styles.passwordIcon
                                            }
                                        >
                                            <FaLock />
                                        </div>

                                        <div>

                                            <span>
                                                SECURITY
                                            </span>

                                            <h3>
                                                Change Password
                                            </h3>

                                            <p>
                                                Update the password
                                                used to access your
                                                owner account.
                                            </p>

                                        </div>

                                    </div>

                                    <div
                                        className={
                                            styles.passwordGrid
                                        }
                                    >

                                        <div
                                            className={
                                                styles.formGroup
                                            }
                                        >

                                            <label>
                                                Current Password
                                            </label>

                                            <div
                                                className={
                                                    styles.inputWrapper
                                                }
                                            >

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

                                        <div
                                            className={
                                                styles.formGroup
                                            }
                                        >

                                            <label>
                                                New Password
                                            </label>

                                            <div
                                                className={
                                                    styles.inputWrapper
                                                }
                                            >

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
                                                    placeholder="Enter new password"
                                                />

                                            </div>

                                            <small>
                                                Minimum 6 characters
                                            </small>

                                        </div>

                                        <div
                                            className={
                                                styles.formGroup
                                            }
                                        >

                                            <label>
                                                Confirm New Password
                                            </label>

                                            <div
                                                className={
                                                    styles.inputWrapper
                                                }
                                            >

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

                                    </div>

                                    <div
                                        className={
                                            styles.passwordHint
                                        }
                                    >

                                        <FaShieldAlt />

                                        <span>
                                            Leave all password
                                            fields empty if you
                                            only want to update
                                            your profile information.
                                        </span>

                                    </div>

                                </div>

                                <div
                                    className={
                                        styles.formActions
                                    }
                                >

                                    <button
                                        type="button"
                                        className={
                                            styles.cancelButton
                                        }
                                        onClick={
                                            handleCancel
                                        }
                                    >
                                        <FaTimes />
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className={
                                            styles.saveButton
                                        }
                                    >
                                        <FaCheckCircle />
                                        Save Changes
                                    </button>

                                </div>

                            </form>

                        ) : (

                            <div
                                className={
                                    styles.detailsGrid
                                }
                            >

                                <div
                                    className={
                                        styles.detailBox
                                    }
                                >

                                    <div
                                        className={
                                            styles.detailIcon
                                        }
                                    >
                                        <FaUser />
                                    </div>

                                    <div>

                                        <span>
                                            Full Name
                                        </span>

                                        <strong>
                                            {owner.name}
                                        </strong>

                                    </div>

                                </div>

                                <div
                                    className={
                                        styles.detailBox
                                    }
                                >

                                    <div
                                        className={
                                            styles.detailIcon
                                        }
                                    >
                                        <FaEnvelope />
                                    </div>

                                    <div>

                                        <span>
                                            Email Address
                                        </span>

                                        <strong>
                                            {owner.email}
                                        </strong>

                                    </div>

                                </div>

                                <div
                                    className={
                                        styles.detailBox
                                    }
                                >

                                    <div
                                        className={
                                            styles.detailIcon
                                        }
                                    >
                                        <FaPhone />
                                    </div>

                                    <div>

                                        <span>
                                            Phone Number
                                        </span>

                                        <strong>
                                            {owner.phone ||
                                                'Not added'}
                                        </strong>

                                    </div>

                                </div>

                                <div
                                    className={
                                        styles.detailBox
                                    }
                                >

                                    <div
                                        className={
                                            styles.detailIcon
                                        }
                                    >
                                        <FaIdBadge />
                                    </div>

                                    <div>

                                        <span>
                                            Owner ID
                                        </span>

                                        <strong>
                                            {owner.id}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        )}

                    </section>

                    <section
                        className={
                            styles.businessCard
                        }
                    >

                        <div
                            className={
                                styles.cardHeader
                            }
                        >

                            <div>

                                <span
                                    className={
                                        styles.cardEyebrow
                                    }
                                >
                                    HOSTEL BUSINESS
                                </span>

                                <h2>
                                    Your Overview
                                </h2>

                            </div>

                            <div
                                className={
                                    styles.businessBadge
                                }
                            >
                                <FaShieldAlt />
                                Verified Owner
                            </div>

                        </div>

                        <div
                            className={
                                styles.statsGrid
                            }
                        >

                            <div
                                className={
                                    styles.statItem
                                }
                            >

                                <div
                                    className={`${styles.statIcon} ${styles.hostelIcon}`}
                                >
                                    <FaBuilding />
                                </div>

                                <div>

                                    <strong>
                                        {ownerHostels.length}
                                    </strong>

                                    <span>
                                        My Hostels
                                    </span>

                                </div>

                            </div>

                            <div
                                className={
                                    styles.statItem
                                }
                            >

                                <div
                                    className={`${styles.statIcon} ${styles.roomIcon}`}
                                >
                                    <FaDoorOpen />
                                </div>

                                <div>

                                    <strong>
                                        {ownerRooms.length}
                                    </strong>

                                    <span>
                                        Total Rooms
                                    </span>

                                </div>

                            </div>

                            <div
                                className={
                                    styles.statItem
                                }
                            >

                                <div
                                    className={`${styles.statIcon} ${styles.accountIcon}`}
                                >
                                    <FaCheckCircle />
                                </div>

                                <div>

                                    <strong>
                                        {owner.status}
                                    </strong>

                                    <span>
                                        Account Status
                                    </span>

                                </div>

                            </div>

                        </div>

                    </section>

                </main>

                <aside>

                    <section
                        className={
                            styles.sideCard
                        }
                    >

                        <div
                            className={
                                styles.sideCardTop
                            }
                        >

                            <div
                                className={
                                    styles.sideIcon
                                }
                            >
                                <FaShieldAlt />
                            </div>

                            <div>

                                <span>
                                    ACCOUNT
                                </span>

                                <h3>
                                    Account Details
                                </h3>

                            </div>

                        </div>

                        <div
                            className={
                                styles.accountRows
                            }
                        >

                            <div>

                                <span>
                                    Account Type
                                </span>

                                <strong>
                                    Hostel Owner
                                </strong>

                            </div>

                            <div>

                                <span>
                                    Role
                                </span>

                                <strong>
                                    {owner.role}
                                </strong>

                            </div>

                            <div>

                                <span>
                                    Account Status
                                </span>

                                <strong
                                    className={
                                        styles.activeStatus
                                    }
                                >
                                    <i></i>
                                    {owner.status}
                                </strong>

                            </div>

                            

                        </div>

                    </section>

                    <section
                        className={
                            styles.tipCard
                        }
                    >

                        <div
                            className={
                                styles.tipShape
                            }
                        ></div>

                        <span>
                            OWNER TIP
                        </span>

                        <h3>
                            Keep your profile information updated.
                        </h3>

                        <p>
                            Accurate contact details help
                            Hostel Hub administration reach
                            you when necessary.
                        </p>

                    </section>

                </aside>

            </div>

        </div>
    )
}

export default OwnerProfile