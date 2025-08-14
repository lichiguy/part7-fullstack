import { createSlice } from '@reduxjs/toolkit'
import usersServie from '../services/users'

const usersSlice = createSlice({
  name: 'users',
  initialState: [],
  reducers: {
    setUsers(state, action) {
      return action.payload
    },
  },
})

export const { setUsers } = usersSlice.actions
export default usersSlice.reducer

export const initializeUsers = () => {
  return async dispatch => {
    const users = await usersServie.getAll()
    dispatch(setUsers(users))
  }
}