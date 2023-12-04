const blogsRouter = require('express').Router()
const Blog = require('../models/blog')


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)

})


blogsRouter.post('/', async (request, response, next) => {
  const body = request.body
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
    likes: likes 
    
  })
  try {
    const savedBlog = await blog.save()
    response.status(201).json(savedBlog)

  } catch(exception) {
    next(exception)
  }
})

module.exports = blogsRouter