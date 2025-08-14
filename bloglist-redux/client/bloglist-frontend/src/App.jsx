import { useState, useEffect, createRef } from 'react'
import { setNotification } from './reducers/notificationReducer'
import { useDispatch, useSelector } from 'react-redux'
import {
  createBlog,
  deleteBlog,
  initializeBlogs,
  voteBlog,
  commentBlog
} from './reducers/blogsReducer'

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useParams,
  useNavigate,
  useMatch,
} from 'react-router-dom'

//import blogService from './services/blogs'
import loginService from './services/login'
import storage from './services/storage'
import Login from './components/Login'
import Blog from './components/Blog'
import NewBlog from './components/NewBlog'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import { setUser } from './reducers/userReducer'
import { initializeUsers } from './reducers/usersReducer'

import { Table, Nav, Navbar, Button, Alert } from 'react-bootstrap'

const User = ({ user }) => {
  if (!user) {
    return null
  }
  return (
    <div>
      <h2>{user.name}</h2>
      <h3>added blogs</h3>
      <ul>
        {user.blogs.map(blog =>
          <li key={blog.id}>{blog.title}</li>
        )}
      </ul>
    </div>
  )
}

const Users = ({ users }) => {
  return (
    <div>
      <h2>Users</h2>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>blogs created</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user =>
            <tr key={user.id}>
              <td><Link to={`/users/${user.id}`}>{user.name}</Link></td>
              <td>{user.blogs.length}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

const BlogList = ({ blogs, blogFormRef, handleCreate }) => {
  if (!blogs) {
    return null
  }

  const style = {
    padding: 10,
    borderWidth: 1,
    marginBottom: 5,
  }

  return (
    <div>
      <Togglable buttonLabel="Create new blog" ref={blogFormRef}>
        <NewBlog doCreate={handleCreate} />
      </Togglable>
      <Table striped>
        <tbody>
          {blogs.map(blog =>
            <tr key={blog.id}>
              <td>
                <Link to={`blogs/${blog.id}`}>{blog.title} by {blog.author}</Link>
              </td>
            </tr>
          )}
        </tbody>
      </Table>

    </div>
  )
}

const Menu = ({ user, handleLogout }) => {
  const padding = {
    paddingRight: 5,
    textDecoration: 'none'
  }

  const buttonMargin = {
    marginLeft: 10
  }

  return (
    <Navbar collapseOnSelect expand='lg' className="bg-body-tertiary">
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link href='#' as="span">
            <Link style={padding} to='/'>Blogs</Link>
          </Nav.Link>
          <Nav.Link href='#' as="span">
            <Link style={padding} to='/users'>Users</Link>
          </Nav.Link>

        </Nav>
        <Nav className='ms-auto'>
          <Nav.Link href="#" as="span">
            {user.name} logged in
            <Button style={buttonMargin} onClick={handleLogout}>logout</Button>
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar >
  )
}

const App = () => {
  //const [blogs, setBlogs] = useState([])
  //const [notification, setNotification] = useState(null)
  const notification = useSelector(({ notification }) => notification)
  const blogs = useSelector(({ blogs }) => blogs)
  const user = useSelector(({ user }) => user)
  const users = useSelector(({ users }) => users)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(initializeBlogs())
    dispatch(initializeUsers())
  }, [dispatch])

  useEffect(() => {
    const user = storage.loadUser()
    if (user) {
      //setUser(user)
      dispatch(setUser(user))
    }
  }, [dispatch])

  const userMatch = useMatch('/users/:id')
  const userForList = userMatch
    ? users.find(user => user.id === userMatch.
      params.id)
    : null

  const blogMatch = useMatch('/blogs/:id')
  const blog = blogMatch
    ? blogs.find(blog => blog.id === blogMatch.
      params.id)
    : null

  const blogFormRef = createRef()

  const notify = (message, type = 'success') => {
    dispatch(setNotification({ message, type }))
  }

  const handleLogin = async (credentials) => {
    try {
      const user = await loginService.login(credentials)
      //setUser(user)
      dispatch(setUser(user))
      storage.saveUser(user)
      notify(`Welcome back, ${user.name}`)
      navigate('/')
    } catch (error) {
      notify('Wrong credentials', 'error')
    }
  }

  const handleCreate = async (blog) => {
    dispatch(createBlog(blog))
    notify(`Blog created: ${blog.title}, ${blog.author}`)
    blogFormRef.current.toggleVisibility()
  }

  const handleVote = async (blog) => {
    console.log('updating', blog)
    dispatch(voteBlog(blog))
    notify(`You liked ${blog.title} by ${blog.author}`)
  }

  const handleLogout = () => {
    //setUser(null)
    dispatch(setUser(null))
    storage.removeUser()
    notify(`Bye, ${user.name}!`)
    navigate('/login')
  }

  const handleDelete = async (blog) => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}`)) {
      dispatch(deleteBlog(blog))
      notify(`Blog ${blog.title}, by ${blog.author} removed`)
      navigate('/blogs')
    }
  }

  const handleComment = async (blog, comment) => {
    dispatch(commentBlog(blog.id, comment))
  }
  /*
  if (!user) {
    return (
      <div>
        <h2>blogs</h2>
        <Notification notification={notification} />
        <Login doLogin={handleLogin} />
      </div>
    )
  }
*/
  const byLikes = (a, b) => b.likes - a.likes
  const sortedBlogs = [...blogs].sort(byLikes)

  return (
    <div className='container'>
      {(notification &&
        <Alert variant="success">
          {notification.message}
        </Alert>
      )}
      {user &&
        <Menu user={user} handleLogout={handleLogout} />
      }
      <h1>Blog App</h1>

      <Routes>
        <Route path='/login' element={<Login doLogin={handleLogin} />} />
        <Route
          path="/"
          element={<BlogList blogs={sortedBlogs} blogFormRef={blogFormRef} handleCreate={handleCreate} />}
        />
        <Route
          path="/users"
          element={<Users users={users} />}
        />
        <Route path='/users/:id' element={<User user={userForList} />} />
        <Route path='/blogs/:id' element={<Blog blog={blog} handleVote={handleVote} handleDelete={handleDelete} handleComment={handleComment} />} />
      </Routes>
    </div>
  )
}

export default App
