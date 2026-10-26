import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getAllUsersAPI, getUserByIdAPI, updateUserAPI, deleteUserAPI } from '../../Services/allAPI'

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await getAllUsersAPI()
  return response.data
})

export const fetchUserById = createAsyncThunk('users/fetchUserById', async (id) => {
  const response = await getUserByIdAPI(id)
  return response.data
})

export const updateUser = createAsyncThunk('users/updateUser', async ({ id, userData }) => {
  const response = await updateUserAPI(id, userData)
  return response.data
})

export const deleteUser = createAsyncThunk('users/deleteUser', async (id) => {
  await deleteUserAPI(id)
  return id
})

const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    selectedUser: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
        state.error = null
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })

      .addCase(fetchUserById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedUser = action.payload
        state.error = null
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })

      .addCase(updateUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false
        state.error = null

        const index = state.users.findIndex(
          user => user.id === action.payload.id
        )

        if (index !== -1) {
          state.users[index] = action.payload
        }

        state.selectedUser = action.payload
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })

      .addCase(deleteUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false
        state.error = null

        state.users = state.users.filter(
          user => user.id !== action.payload
        )

        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  }
})

export default userSlice.reducer