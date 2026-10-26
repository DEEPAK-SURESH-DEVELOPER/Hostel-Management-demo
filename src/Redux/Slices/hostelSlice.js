import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  getAllHostelsAPI,
  getHostelByIdAPI,
  getOwnerHostelsAPI,
  addHostelAPI,
  updateHostelAPI,
  deleteHostelAPI
} from '../../Services/allAPI'

// hostel functions
export const fetchHostels = createAsyncThunk('hostels/fetchHostels', async () => {
  const response = await getAllHostelsAPI()
  return response.data
})

export const fetchHostelById = createAsyncThunk('hostels/fetchHostelById', async (id) => {
  const response = await getHostelByIdAPI(id)
  return response.data
})

export const fetchOwnerHostels = createAsyncThunk('hostels/fetchOwnerHostels', async (ownerId) => {
  const response = await getOwnerHostelsAPI(ownerId)
  return response.data
})

export const addHostel = createAsyncThunk('hostels/addHostel', async (hostelData) => {
  const response = await addHostelAPI(hostelData)
  return response.data
})

export const updateHostel = createAsyncThunk('hostels/updateHostel', async ({ id, hostelData }) => {
  const response = await updateHostelAPI(id, hostelData)
  return response.data
})

export const deleteHostel = createAsyncThunk('hostels/deleteHostel', async (id) => {
  await deleteHostelAPI(id)
  return id
})

const hostelSlice = createSlice({
  name: 'hostels',
  initialState: {
    hostels: [],
    selectedHostel: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHostels.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchHostels.fulfilled, (state, action) => {
        state.loading = false
        state.hostels = action.payload
      })
      .addCase(fetchHostels.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchHostelById.fulfilled, (state, action) => {
        state.selectedHostel = action.payload
      })
      .addCase(fetchOwnerHostels.fulfilled, (state, action) => {
        state.hostels = action.payload
      })
      .addCase(addHostel.fulfilled, (state, action) => {
        state.hostels.push(action.payload)
      })
      .addCase(updateHostel.fulfilled, (state, action) => {
        const index = state.hostels.findIndex(hostel => hostel.id === action.payload.id)

        if (index !== -1) {
          state.hostels[index] = action.payload
        }

        state.selectedHostel = action.payload
      })
      .addCase(deleteHostel.fulfilled, (state, action) => {
        state.hostels = state.hostels.filter(hostel => hostel.id !== action.payload)
      })
  }
})

export default hostelSlice.reducer