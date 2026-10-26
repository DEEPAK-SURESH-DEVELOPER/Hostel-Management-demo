import React from 'react'
import { Routes, Route } from 'react-router-dom'
import UserLayout from '../Components/UserComponents/UserLayout/UserLayout'
import UserDashboard from '../Pages/UserPages/UserDashboard/UserDashboard'
import UserHostel from '../Pages/UserPages/UserHostel/UserHostel'
import UserRoom from '../Pages/UserPages/UserRoom/UserRoom'
import UserComplaints from '../Pages/UserPages/UserComplaints/UserComplaints'
import UserProfile from '../Pages/UserPages/UserProfile/UserProfile'
import UserExploreHostels from '../Pages/UserPages/UserExploreHostels/UserExploreHostels'

const UserRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<UserLayout />}>
                <Route index element={<UserDashboard/>} />
                <Route path="hostel" element={<UserHostel/>} />
                <Route path="explore-hostels" element={<UserExploreHostels/>} />
                <Route path="room" element={<UserRoom/>} />
                <Route path="complaints" element={<UserComplaints/>} />
                <Route path="profile" element={<UserProfile/>} />
            </Route>
        </Routes>
    )
}

export default UserRouter
