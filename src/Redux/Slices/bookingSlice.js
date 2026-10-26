import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  getAllBookingsAPI,
  getBookingByIdAPI,
  addBookingAPI,
  updateBookingAPI,
  deleteBookingAPI,
  getUserBookingsAPI,
  getHostelBookingsAPI
} from '../../Services/allAPI'

// booking functions
export const fetchBookings = createAsyncThunk('bookings/fetchBookings', async () => {
  const response = await getAllBookingsAPI()
  return response.data
})

export const fetchBookingById = createAsyncThunk('bookings/fetchBookingById', async (id) => {
  const response = await getBookingByIdAPI(id)
  return response.data
})

export const fetchUserBookings = createAsyncThunk('bookings/fetchUserBookings', async (userId) => {
  const response = await getUserBookingsAPI(userId)
  return response.data
})

export const fetchHostelBookings = createAsyncThunk('bookings/fetchHostelBookings', async (hostelId) => {
  const response = await getHostelBookingsAPI(hostelId)
  return response.data
})

export const addBooking = createAsyncThunk('bookings/addBooking', async (bookingData) => {
  const response = await addBookingAPI(bookingData)
  return response.data
})

export const updateBooking = createAsyncThunk('bookings/updateBooking', async ({ id, bookingData }) => {
  const response = await updateBookingAPI(id, bookingData)
  return response.data
})

export const deleteBooking = createAsyncThunk('bookings/deleteBooking', async (id) => {
  await deleteBookingAPI(id)
  return id
})

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    bookings: [],
    selectedBooking: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false
        state.bookings = action.payload
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.selectedBooking = action.payload
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.bookings = action.payload
      })
      .addCase(fetchHostelBookings.fulfilled, (state, action) => {
        state.bookings = action.payload
      })
      .addCase(addBooking.fulfilled, (state, action) => {
        state.bookings.push(action.payload)
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(booking => booking.id === action.payload.id)

        if (index !== -1) {
          state.bookings[index] = action.payload
        }

        state.selectedBooking = action.payload
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.bookings = state.bookings.filter(booking => booking.id !== action.payload)
      })
  }
})

export default bookingSlice.reducer