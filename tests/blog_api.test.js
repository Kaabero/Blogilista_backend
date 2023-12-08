const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')
const User = require('../models/user')


describe('returning blogs', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
      const response = await api.get('/api/blogs')
  
      expect(response.body).toHaveLength(helper.initialBlogs.length)
  })
})
  
describe('id field', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
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
})

describe('adding blog', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
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
  
    
    const blogsAtEnd = await helper.blogsInDb()
  
    const titles = blogsAtEnd.map(r => r.title)
  
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    expect(titles).toContainEqual(
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
  
   
    const blogsAtEnd = await helper.blogsInDb()

    const likes = blogsAtEnd.map(({ title, likes }) => ({title: title, likes: likes}))
    
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
  
    
    const blogsAtEnd = await helper.blogsInDb()
  
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
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
  
    
    const blogsAtEnd = await helper.blogsInDb()
  
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe('deleting and editing blog', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  })


  test('a blog can be edited', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToEdit = blogsAtStart[0]
    console.log('start', blogToEdit)

    const editedBlog = {
      title: 'Type wars',
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html"
    }
    console.log('edited', editedBlog)

    await api
      .put(`/api/blogs/${blogToEdit.id}`)
      .send(editedBlog)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()

    console.log('editedlist', blogsAtEnd)

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).toContain(editedBlog.title)
    expect(titles).not.toContain(blogToEdit.title)
  })
})


describe('creating new user', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'kaabero',
      name: 'Katri',
      password: 'salasana',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'testuser',
      password: 'salasana',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('expected `username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if username is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'ro',
      name: 'testuser',
      password: 'salasana',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('User validation failed: username: Path `username` (`'+`${newUser.username}`+'`) is shorter than the minimum allowed length (3).')
    
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if username is missing', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      name: 'testuser',
      password: 'salasana',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('User validation failed: username: Path `username` is required.')
    
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if password is missing', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: "test",
      name: 'testuser'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

      console.log('result', result.body)
      expect(result.body).toContain('password is required')
    
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if password is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: "test",
      name: 'testuser',
      password: '12'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

      console.log('result', result.body)
      expect(result.body).toContain('password is shorter than the minimum allowed length (3)')
    
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

})

afterAll(async () => {
  await mongoose.connection.close()
})
