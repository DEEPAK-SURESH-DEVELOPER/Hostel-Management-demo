import { NavLink, useNavigate } from 'react-router-dom'
import {
  FaTachometerAlt,
  FaUsers,
  FaUserTie,
  FaBuilding,
  FaClipboardList,
  FaExclamationCircle,
  FaUserCircle,
  FaSignOutAlt,
  FaShieldAlt
} from 'react-icons/fa'
import styles from './AdminSidebar.module.css'

const AdminSidebar = () => {
  const navigate = useNavigate()

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: <FaTachometerAlt />
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: <FaUsers />
    },
    {
      name: 'Owners',
      path: '/admin/owners',
      icon: <FaUserTie />
    },
    {
      name: 'Owner Requests',
      path: '/admin/owner-requests',
      icon: <FaUserTie />
    },
    {
      name: 'Hostels',
      path: '/admin/hostels',
      icon: <FaBuilding />
    },
    {
      name: 'Bookings',
      path: '/admin/bookings',
      icon: <FaClipboardList />
    },
    {
      name: 'Complaints',
      path: '/admin/complaints',
      icon: <FaExclamationCircle />
    },
    {
      name: 'Profile',
      path: '/admin/profile',
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
        <div className={styles.brandMark}><FaShieldAlt /></div>
        <div>
          <h2>Hostel<span>Hub</span></h2>
          <p>Admin Panel</p>
        </div>
      </div>

      <nav className={styles.navigation}>
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/admin'}
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

export default AdminSidebar
