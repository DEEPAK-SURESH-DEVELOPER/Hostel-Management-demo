import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  getAllComplaintsAPI,
  getComplaintByIdAPI,
  addComplaintAPI,
  updateComplaintAPI,
  deleteComplaintAPI,
  getUserComplaintsAPI
} from '../../Services/allAPI'

// complaint functions
export const fetchComplaints = createAsyncThunk('complaints/fetchComplaints', async () => {
  const response = await getAllComplaintsAPI()
  return response.data
})

export const fetchComplaintById = createAsyncThunk('complaints/fetchComplaintById', async (id) => {
  const response = await getComplaintByIdAPI(id)
  return response.data
})

export const fetchUserComplaints = createAsyncThunk('complaints/fetchUserComplaints', async (userId) => {
  const response = await getUserComplaintsAPI(userId)
  return response.data
})

export const addComplaint = createAsyncThunk('complaints/addComplaint', async (complaintData) => {
  const response = await addComplaintAPI(complaintData)
  return response.data
})

export const updateComplaint = createAsyncThunk('complaints/updateComplaint', async ({ id, complaintData }) => {
  const response = await updateComplaintAPI(id, complaintData)
  return response.data
})

export const deleteComplaint = createAsyncThunk('complaints/deleteComplaint', async (id) => {
  await deleteComplaintAPI(id)
  return id
})

const complaintSlice = createSlice({
  name: 'complaints',
  initialState: {
    complaints: [],
    selectedComplaint: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false
        state.complaints = action.payload
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchComplaintById.fulfilled, (state, action) => {
        state.selectedComplaint = action.payload
      })
      .addCase(fetchUserComplaints.fulfilled, (state, action) => {
        state.complaints = action.payload
      })
      .addCase(addComplaint.fulfilled, (state, action) => {
        state.complaints.push(action.payload)
      })
      .addCase(updateComplaint.fulfilled, (state, action) => {
        const index = state.complaints.findIndex(complaint => complaint.id === action.payload.id)

        if (index !== -1) {
          state.complaints[index] = action.payload
        }

        state.selectedComplaint = action.payload
      })
      .addCase(deleteComplaint.fulfilled, (state, action) => {
        state.complaints = state.complaints.filter(complaint => complaint.id !== action.payload)
      })
  }
})

export default complaintSlice.reducer