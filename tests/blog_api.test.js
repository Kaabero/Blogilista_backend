const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

const initialBlogs = [
    {
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7,
    },
    {
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
    }
]

beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
  
    expect(response.body).toHaveLength(initialBlogs.length)
})
  
test('there is an identification field', async () => {
    const response = await api.get('/api/blogs')
    console.log('id', response.body[0].id)
  
    expect(response.body[0].id).toBeDefined()
})

test('the identification field is named as id', async () => {
    const response = await api.get('/api/blogs')
    console.log('body', response.body[0])
    console.log('type', typeof(response.body)[0])
    console.log('keys', Object.keys(response.body[0]))
    console.log('id_key', Object.keys(response.body[0])[4])
    console.log('type', typeof(Object.keys(response.body[0])[4]))
    const id_key = Object.keys(response.body[0])[4]
  
    expect(id_key).toBe('id')
})

test('a valid blog can be added ', async () => {
    const newBlog = {
      title: 'TDD harms architecture',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
      likes: 0
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const response = await api.get('/api/blogs')
  
    const titles = response.body.map(r => r.title)
  
    expect(response.body).toHaveLength(initialBlogs.length + 1)
    expect(titles).toContain(
      'TDD harms architecture'
    )
})

test('adding blog without likes is set with zero likes', async () => {
    const newBlog = {
        title: 'TDD harms architecture',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html'
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const response = await api.get('/api/blogs')

    const likes = response.body.map(({ title, likes }) => ({title: title, likes: likes}))
    
    console.log('likes', likes)

    const tddLikes = likes.find(blog => blog.title === 'TDD harms architecture')
  
    expect(tddLikes.likes).toBe(0)
})

test('blog without title is not added', async () => {
    const newBlog = {
        author: "Robert C. Martin",
        url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
        likes: 1
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  
    const response = await api.get('/api/blogs')
  
    expect(response.body).toHaveLength(initialBlogs.length)
})

test('blog without url is not added', async () => {
    const newBlog = {
        title: 'Type wars',
        author: "Robert C. Martin",
        likes: 1
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  
    const response = await api.get('/api/blogs')
  
    expect(response.body).toHaveLength(initialBlogs.length)
})

afterAll(async () => {
  await mongoose.connection.close()
})