import React, { useState } from 'react'
import PropTypes from 'prop-types'
import storage from '../services/storage'

import { Table, Form, Button } from 'react-bootstrap'

const Blog = ({ blog, handleVote, handleDelete, handleComment }) => {
  const [comment, setComment] = useState('')

  if (!blog) return null

  const nameOfUser = blog.user ? blog.user.name : 'anonymous'

  const canRemove = blog.user ? blog.user.username === storage.me() : true

  const handleCommentChange = (event) => {
    setComment(event.target.value)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    handleComment(blog, comment)
    setComment('')
  }

  const style = {
    marginTop: 20
  }

  return (
    <div>
      <h2 style={style}>{blog.title} by {blog.author}</h2>

      <h4 style={style}><a href={blog.url}>{blog.url}</a></h4>
      <div style={style}>
        Likes {blog.likes}
        <Button
          style={{ marginLeft: 3 }}
          onClick={() => handleVote(blog)}
        >
          Like
        </Button>
      </div>
      <p style={style}>Added by: {nameOfUser}</p>
      {canRemove && <Button onClick={() => handleDelete(blog)}>
        remove
      </Button>}

      <h3 style={style}>Comments</h3>
      <Table>
        <tbody>
          {blog.comments.map(comment =>
            <tr key={comment}>
              <td>{comment}</td>
            </tr>
          )}
        </tbody>
      </Table>

      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>
            Add a comment...
          </Form.Label>
          <Form.Control
            type="text"
            data-testid='title'
            value={comment}
            onChange={handleCommentChange}
          />
        </Form.Group>
        <Button style={style} variant='primary' type="submit">Comment</Button>
      </Form>

    </div>
  )
}

Blog.propTypes = {
  blog: PropTypes.shape({
    url: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    likes: PropTypes.number.isRequired,
    user: PropTypes.object,
  }).isRequired,
  handleVote: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired
}

export default Blog