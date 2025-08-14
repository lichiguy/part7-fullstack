import { createSlice } from '@reduxjs/toolkit'
import blogService from '../services/blogs'

const blogSlice = createSlice({
  name: 'blogs',
  initialState: [],
  reducers: {
    setBlogs(state, action) {
      return action.payload
    },
    addBlog(state, action) {
      return state.concat(action.payload)
    },
    replaceBlog(state, action) {
      const replaced = action.payload
      return state.map((n) => (n.id === replaced.id ? replaced : n))
    },
    removeBlog(state, action) {
      const deleted = action.payload
      return state.filter((n) => n.id !== deleted.id)
    },
  },
})

export const { setBlogs, addBlog, replaceBlog, removeBlog } = blogSlice.actions
export default blogSlice.reducer

export const initializeBlogs = () => {
  return async (dispatch) => {
    const blogs = await blogService.getAll()
    dispatch(setBlogs(blogs))
  }
}

export const createBlog = (object) => {
  return async (dispatch) => {
    const blog = await blogService.create(object)
    dispatch(addBlog(blog))
  }
}

export const voteBlog = (object) => {
  const toVote = { ...object, likes: object.likes + 1 }
  return async (dispatch) => {
    const blog = await blogService.update(toVote.id, toVote)
    dispatch(replaceBlog(blog))
  }
}

export const deleteBlog = (object) => {
  return async dispatch => {
    await blogService.remove(object.id)
    dispatch(removeBlog(object))
  }
}
