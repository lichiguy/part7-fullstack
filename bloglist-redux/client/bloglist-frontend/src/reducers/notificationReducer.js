import { createSlice } from '@reduxjs/toolkit'

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: null,
  reducers: {
    setNotificationMessage(state, action) {
      return action.payload
    },
  },
})

export const { setNotificationMessage } = notificationSlice.actions
export default notificationSlice.reducer

export const setNotification = (notification) => {
  return (dispatch) => {
    dispatch(setNotificationMessage(notification))
    setTimeout(() => {
      dispatch(setNotificationMessage(null))
    }, 5000)
  }
}
