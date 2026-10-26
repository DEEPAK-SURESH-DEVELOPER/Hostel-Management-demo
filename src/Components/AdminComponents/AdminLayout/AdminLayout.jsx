import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminHeader from '../AdminHeader/AdminHeader'
import AdminSidebar from '../AdminSidebar/AdminSidebar'
import styles from './AdminLayout.module.css'

const AdminLayout = () => {
  return (
    <div className={styles.adminLayout}>

      <AdminSidebar />

      <div className={styles.mainSection}>

        <AdminHeader />

        <main className={styles.content}>
          <Outlet />
        </main>

      </div>

    </div>
  )
}

export default AdminLayout