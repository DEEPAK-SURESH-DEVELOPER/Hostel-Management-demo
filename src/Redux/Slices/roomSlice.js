import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  getAllRoomsAPI,
  getRoomByIdAPI,
  getHostelRoomsAPI,
  addRoomAPI,
  updateRoomAPI,
  deleteRoomAPI
} from '../../Services/allAPI'

// room functions
export const fetchRooms = createAsyncThunk('rooms/fetchRooms', async () => {
  const response = await getAllRoomsAPI()
  return response.data
})

export const fetchRoomById = createAsyncThunk('rooms/fetchRoomById', async (id) => {
  const response = await getRoomByIdAPI(id)
  return response.data
})

export const fetchHostelRooms = createAsyncThunk('rooms/fetchHostelRooms', async (hostelId) => {
  const response = await getHostelRoomsAPI(hostelId)
  return response.data
})

export const addRoom = createAsyncThunk('rooms/addRoom', async (roomData) => {
  const response = await addRoomAPI(roomData)
  return response.data
})

export const updateRoom = createAsyncThunk('rooms/updateRoom', async ({ id, roomData }) => {
  const response = await updateRoomAPI(id, roomData)
  return response.data
})

export const deleteRoom = createAsyncThunk('rooms/deleteRoom', async (id) => {
  await deleteRoomAPI(id)
  return id
})

const roomSlice = createSlice({
  name: 'rooms',
  initialState: {
    rooms: [],
    selectedRoom: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false
        state.rooms = action.payload
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchRoomById.fulfilled, (state, action) => {
        state.selectedRoom = action.payload
      })
      .addCase(fetchHostelRooms.fulfilled, (state, action) => {
        state.rooms = action.payload
      })
      .addCase(addRoom.fulfilled, (state, action) => {
        state.rooms.push(action.payload)
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        const index = state.rooms.findIndex(room => room.id === action.payload.id)

        if (index !== -1) {
          state.rooms[index] = action.payload
        }

        state.selectedRoom = action.payload
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.rooms = state.rooms.filter(room => room.id !== action.payload)
      })
  }
})

export default roomSlice.reducer