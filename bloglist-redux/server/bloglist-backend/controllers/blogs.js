const jwt = require('jsonwebtoken')
const router = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const userExtractor = require('../utils/middleware').userExtractor

router.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })

  response.json(blogs)
})

router.post('/', userExtractor, async (request, response) => {
  const blog = new Blog(request.body)

  const user = request.user

  if (!user) {
    return response.status(403).json({ error: 'user missing' })
  }

  if (!blog.title || !blog.url) {
    return response.status(400).json({ error: 'title or url missing' })
  }

  blog.likes = blog.likes | 0
  blog.user = user
  user.blogs = user.blogs.concat(blog._id)

  await user.save()

  const savedBlog = await blog.save()

  response.status(201).json(savedBlog)
})

router.post('/:id/comments', async (request, response) => {
  console.log(request.body)
  const { comment } = request.body

  if (!comment) {
    return response.status(400).json({ error: 'Comment content is required' })
  }

  try {
    const blog = await Blog.findById(request.params.id).populate('user', {
      username: 1,
      name: 1,
    })

    if (!blog) {
      return response.status(404).json({ error: 'Blog not found' })
    }

    // Asegurar que comments sea un array
    if (!Array.isArray(blog.comments)) {
      blog.comments = []
    }

    blog.comments.push(comment)

    const updatedBlog = await blog.save()
    response.json(updatedBlog)
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
  /*
  const newComment = request.body
  const blog = await Blog.findById(request.params.id)
  console.log(blog, newComment)

  const newBlog = {
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes,
    comments: [...blog.comments, newComment.content]
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, newBlog, { new: true }).populate('user', { username: 1, name: 1 })
  response.json(updatedBlog)*/
})

router.delete('/:id', userExtractor, async (request, response) => {
  const user = request.user

  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(204).end()
  }

  if (blog.user && user.id.toString() !== blog.user.toString()) {
    return response.status(403).json({ error: 'user not authorized' })
  }

  await blog.deleteOne()

  user.blogs = user.blogs.filter(
    (b) => b._id.toString() !== blog._id.toString()
  )

  await user.save()

  response.status(204).end()
})

router.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
  }).populate('user', { username: 1, name: 1 })
  response.json(updatedBlog)
})

module.exports = router
