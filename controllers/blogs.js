const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
  .find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)

})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})



blogsRouter.post('/', async (request, response) => {
  const body = request.body
  //const user = await User.findById(body.userId)
  const users = await User.find({})
  console.log('users', users)
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
    user: users[0]._id 
    
  })
  const savedBlog = await blog.save()
  users[0].blogs = users[0].blogs.concat(savedBlog._id)
  await users[0].save()
  response.status(201).json(savedBlog)
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }
    
  await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.status(200).end()

})


module.exports = blogsRouter