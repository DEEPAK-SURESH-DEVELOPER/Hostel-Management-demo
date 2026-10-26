import { Routes, Route } from 'react-router-dom'
import AdminLayout from '../Components/AdminComponents/AdminLayout/AdminLayout'
import AdminDashboard from '../Pages/AdminPages/AdminDashboard/AdminDashboard'
import AdminUsers from '../Pages/AdminPages/AdminUsers/AdminUsers'
import AdminOwners from '../Pages/AdminPages/AdminOwners/AdminOwners'
import AdminOwnerRequests from '../Pages/AdminPages/AdminOwnerRequests/AdminOwnerRequests'
import AdminHostels from '../Pages/AdminPages/AdminHostels/AdminHostels'
import AdminBookings from '../Pages/AdminPages/AdminBookings/AdminBookings'
import AdminComplaints from '../Pages/AdminPages/AdminComplaints/AdminComplaints'
import AdminProfile from '../Pages/AdminPages/AdminProfile/AdminProfile'

const AdminRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="owners" element={<AdminOwners />} />
        <Route path="owner-requests" element={<AdminOwnerRequests />} />
        <Route path="hostels" element={<AdminHostels />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="complaints" element={<AdminComplaints />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>
    </Routes>
  )
}

export default AdminRouter
