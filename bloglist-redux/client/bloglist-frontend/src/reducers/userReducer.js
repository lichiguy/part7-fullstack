import { createSlice } from '@reduxjs/toolkit'
import loginService from '../services/login'

const userSlice = createSlice({
  name: 'user',
  initialState: null,
  reducers: {
    setUsername(state, action) {
      return action.payload
    }
  }
})

export const { setUsername } = userSlice.actions
export default userSlice.reducer

export const setUser = (credentials) => {
  return dispatch => {
    console.log(credentials)
    dispatch(setUsername(credentials))
  }
}