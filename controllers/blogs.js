const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')


/*
const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}
*/


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
  .find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)

})



blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  console.log('blog', blog)
  console.log('bloguser', blog.user)
  //const userid = jwt.verify(request.token, process.env.SECRET)
  const user = request.user
  console.log('user', user.id)

  // console.log('userid', userid.id)
  if ( blog.user.toString() === user.id.toString() ) {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } else {
    response.status(401).json({ error: 'authorization failed' })
  }
})


blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})



blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  //const user = await User.findById(decodedToken.id)
  const user = request.user
  //const user = await User.findById(body.userId)
  //const users = await User.find({})
  console.log('user', user)
  const likes = body.likes !== undefined ? body.likes : 0
  console.log('bodytitle', body.title)
  
  if (!body.title || !body.url) {
    response.status(400).json({})
    return
  }
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: likes,
    user: user._id 
    
  })
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  console.log('backendbody', body)
  console.log('user', body.user)

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: body.user.id
  
  }

  console.log('backendblog', blog)
    
  const blogToReturn = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.status(200).json(blogToReturn)

})


module.exports = blogsRouter