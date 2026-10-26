import React from 'react'
import { Routes, Route } from 'react-router-dom'
import OwnerLayout from '../Components/OwnerComponents/OwnerLayout/OwnerLayout'
import OwnerDashboard from '../Pages/OwnerPages/OwnerDashboard/OwnerDashboard'
import OwnerHostels from '../Pages/OwnerPages/OwnerHostels/OwnerHostels'
import OwnerRooms from '../Pages/OwnerPages/OwnerRooms/OwnerRooms'
import OwnerBookings from '../Pages/OwnerPages/OwnerBookings/OwnerBookings'
import OwnerComplaints from '../Pages/OwnerPages/OwnerComplaints/OwnerComplaints'
import OwnerProfile from '../Pages/OwnerPages/OwnerProfile/OwnerProfile'
import OwnerResidents from '../Pages/OwnerPages/OwnerResidents/OwnerResidents'

const OwnerRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<OwnerLayout />}>
      <Route index element={<OwnerDashboard/>} />
      <Route path="hostels" element={<OwnerHostels/>} />
      <Route path="rooms" element={<OwnerRooms/>} />
      <Route path="bookings" element={<OwnerBookings/>} />
      <Route path="residents" element={<OwnerResidents/>} />
      <Route path="complaints" element={<OwnerComplaints/>} />
      <Route path="profile" element={<OwnerProfile/>} />
    </Route>
    </Routes>
  )
}

export default OwnerRouter
