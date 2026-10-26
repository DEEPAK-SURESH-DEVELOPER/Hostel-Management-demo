
import apiServices from '../API/apiServices'

// user APIs
export const getAllUsersAPI = async () => {
    return await apiServices('GET', '/users')
}

export const getUserByIdAPI = async (id) => {
    return await apiServices('GET', `/users/${id}`)
}

export const registerUserAPI = async (userData) => {
    return await apiServices('POST', '/users', userData)
}

export const updateUserAPI = async (id, userData) => {
    return await apiServices('PUT', `/users/${id}`, userData)
}

export const deleteUserAPI = async (id) => {
    return await apiServices('DELETE', `/users/${id}`)
}


// hostel APIs
export const getAllHostelsAPI = async () => {
    return await apiServices('GET', '/hostels')
}

export const getHostelByIdAPI = async (id) => {
    return await apiServices('GET', `/hostels/${id}`)
}

export const getOwnerHostelsAPI = async (ownerId) => {
    return await apiServices('GET', `/hostels?ownerId=${ownerId}`)
}

export const addHostelAPI = async (hostelData) => {
    return await apiServices('POST', '/hostels', hostelData)
}

export const updateHostelAPI = async (id, hostelData) => {
    return await apiServices('PUT', `/hostels/${id}`, hostelData)
}

export const deleteHostelAPI = async (id) => {
    return await apiServices('DELETE', `/hostels/${id}`)
}


// room APIs
export const getAllRoomsAPI = async () => {
    return await apiServices('GET', '/rooms')
}

export const getRoomByIdAPI = async (id) => {
    return await apiServices('GET', `/rooms/${id}`)
}

export const getHostelRoomsAPI = async (hostelId) => {
    return await apiServices('GET', `/rooms?hostelId=${hostelId}`)
}

export const addRoomAPI = async (roomData) => {
    return await apiServices('POST', '/rooms', roomData)
}

export const updateRoomAPI = async (id, roomData) => {
    return await apiServices('PUT', `/rooms/${id}`, roomData)
}

export const deleteRoomAPI = async (id) => {
    return await apiServices('DELETE', `/rooms/${id}`)
}


// booking APIs
export const getAllBookingsAPI = async () => {
    return await apiServices('GET', '/bookings')
}

export const getBookingByIdAPI = async (id) => {
    return await apiServices('GET', `/bookings/${id}`)
}

export const addBookingAPI = async (bookingData) => {
    return await apiServices('POST', '/bookings', bookingData)
}

export const updateBookingAPI = async (id, bookingData) => {
    return await apiServices('PUT', `/bookings/${id}`, bookingData)
}

export const deleteBookingAPI = async (id) => {
    return await apiServices('DELETE', `/bookings/${id}`)
}

export const getUserBookingsAPI = async (userId) => {
    return await apiServices('GET', `/bookings?userId=${userId}`)
}

export const getHostelBookingsAPI = async (hostelId) => {
    return await apiServices('GET', `/bookings?hostelId=${hostelId}`)
}


// complaint APIs
export const getAllComplaintsAPI = async () => {
    return await apiServices('GET', '/complaints')
}

export const getComplaintByIdAPI = async (id) => {
    return await apiServices('GET', `/complaints/${id}`)
}

export const addComplaintAPI = async (complaintData) => {
    return await apiServices('POST', '/complaints', complaintData)
}

export const updateComplaintAPI = async (id, complaintData) => {
    return await apiServices('PUT', `/complaints/${id}`, complaintData)
}

export const deleteComplaintAPI = async (id) => {
    return await apiServices('DELETE', `/complaints/${id}`)
}

export const getUserComplaintsAPI = async (userId) => {
    return await apiServices('GET', `/complaints?userId=${userId}`)
}
