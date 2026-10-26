import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../Slices/userSlice'
import hostelReducer from '../Slices/hostelSlice'
import roomReducer from '../Slices/roomSlice'
import bookingReducer from '../Slices/bookingSlice'
import complaintReducer from '../Slices/complaintSlice'

const store = configureStore({
    reducer: {
        users: userReducer,
        hostels: hostelReducer,
        rooms: roomReducer,
        bookings: bookingReducer,
        complaints: complaintReducer
    }
})

export default store