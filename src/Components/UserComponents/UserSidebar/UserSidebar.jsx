import React from 'react'
import {
    FaHome,
    FaBuilding,
    FaDoorOpen,
    FaExclamationCircle,
    FaUser,
    FaSignOutAlt,
    FaHotel,
    FaSearch
} from 'react-icons/fa'
import { NavLink, useNavigate } from 'react-router-dom'
import styles from './UserSidebar.module.css'

const UserSidebar = () => {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem('hostelHubUser')
        navigate('/login')
    }

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoSection}>
                <div className={styles.logoIcon}>
                    <FaHotel />
                </div>

                <div>
                    <h2>Hostel Hub</h2>
                    <span>Resident Portal</span>
                </div>
            </div>

            <nav className={styles.navigation}>
                <p className={styles.menuTitle}>MAIN MENU</p>

                <NavLink
                    to="/user"
                    end
                    className={({ isActive }) =>
                        `${styles.navItem} ${isActive ? styles.active : ''}`
                    }
                >
                    <FaHome />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/user/explore-hostels"
                    className={({ isActive }) =>
                        `${styles.navItem} ${isActive ? styles.active : ''}`
                    }
                >
                    <FaSearch />
                    <span>Explore Hostels</span>
                </NavLink>

                <NavLink
                    to="/user/hostel"
                    className={({ isActive }) =>
                        `${styles.navItem} ${isActive ? styles.active : ''}`
                    }
                >
                    <FaBuilding />
                    <span>My Hostel</span>
                </NavLink>

                <NavLink
                    to="/user/room"
                    className={({ isActive }) =>
                        `${styles.navItem} ${isActive ? styles.active : ''}`
                    }
                >
                    <FaDoorOpen />
                    <span>My Room</span>
                </NavLink>

                <NavLink
                    to="/user/complaints"
                    className={({ isActive }) =>
                        `${styles.navItem} ${isActive ? styles.active : ''}`
                    }
                >
                    <FaExclamationCircle />
                    <span>Complaints</span>
                </NavLink>

                <p className={styles.menuTitle}>ACCOUNT</p>

                <NavLink
                    to="/user/profile"
                    className={({ isActive }) =>
                        `${styles.navItem} ${isActive ? styles.active : ''}`
                    }
                >
                    <FaUser />
                    <span>Profile</span>
                </NavLink>
            </nav>

            <div className={styles.bottomSection}>
                <button
                    className={styles.logoutButton}
                    onClick={handleLogout}
                >
                    <FaSignOutAlt />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    )
}

export default UserSidebar
