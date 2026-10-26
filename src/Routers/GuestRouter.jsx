import { Routes, Route } from 'react-router-dom'
import Login from '../Pages/AuthPages/Login/Login'
import Register from '../Pages/AuthPages/Register/Register'
import OwnerRegister from '../Pages/AuthPages/OwnerRegister/OwnerRegister'
import GuestHome from '../Pages/GuestPages/GuestHome/GuestHome'
import HostelBrowse from '../Pages/GuestPages/HostelBrowse/HostelBrowse'

const GuestRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<GuestHome />} />
            <Route path="/hostels" element={<HostelBrowse />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/owner-register" element={<OwnerRegister />} />
        </Routes>
    )
}

export default GuestRouter
