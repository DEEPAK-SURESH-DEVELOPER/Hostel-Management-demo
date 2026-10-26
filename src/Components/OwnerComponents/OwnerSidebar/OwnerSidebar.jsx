import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  FaTachometerAlt,
  FaBuilding,
  FaBed,
  FaClipboardList,
  FaUsers,
  FaExclamationCircle,
  FaUserCircle,
  FaSignOutAlt
} from 'react-icons/fa'
import styles from './OwnerSidebar.module.css'

const OwnerSidebar = () => {
  const navigate = useNavigate()

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/owner',
      icon: <FaTachometerAlt />
    },
    {
      name: 'My Hostels',
      path: '/owner/hostels',
      icon: <FaBuilding />
    },
    {
      name: 'Rooms',
      path: '/owner/rooms',
      icon: <FaBed />
    },
    {
      name: 'Bookings',
      path: '/owner/bookings',
      icon: <FaClipboardList />
    },
    {
      name: 'Residents',
      path: '/owner/residents',
      icon: <FaUsers />
    },
    {
      name: 'Complaints',
      path: '/owner/complaints',
      icon: <FaExclamationCircle />
    },
    {
      name: 'Profile',
      path: '/owner/profile',
      icon: <FaUserCircle />
    }
  ]

  const handleLogout = () => {
    localStorage.removeItem('hostelHubUser')
    navigate('/login')
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.brandMark}><FaBuilding /></div>
        <div>
          <h2>Hostel<span>Hub</span></h2>
          <p>Owner Panel</p>
        </div>
      </div>

      <nav className={styles.navigation}>
        {menuItems.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/owner'}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.bottomSection}>
        <button className={styles.logoutButton} onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default OwnerSidebar
