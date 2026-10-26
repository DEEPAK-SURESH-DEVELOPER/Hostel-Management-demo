import React from 'react'
import { Outlet } from 'react-router-dom'
import UserHeader from '../UserHeader/UserHeader'
import UserSidebar from '../UserSidebar/UserSidebar'
import styles from './UserLayout.module.css'

const UserLayout = () => {
    return (
        <div className={styles.userLayout}>
            <UserSidebar />

            <div className={styles.mainSection}>
                <UserHeader />

                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default UserLayout