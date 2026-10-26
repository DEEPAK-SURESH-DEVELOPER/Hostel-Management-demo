import React from 'react'
import { Outlet } from 'react-router-dom'
import OwnerHeader from '../OwnerHeader/OwnerHeader'
import OwnerSidebar from '../OwnerSidebar/OwnerSidebar'
import styles from './OwnerLayout.module.css'

const OwnerLayout = () => {
  return (
    <div className={styles.ownerLayout}>
      <OwnerSidebar />

      <div className={styles.mainSection}>
        <OwnerHeader />

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default OwnerLayout