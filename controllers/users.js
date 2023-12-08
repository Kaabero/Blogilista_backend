const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if (!password) {
    response.status(400).json('password is required')
    return
  }

  if (password.length < 3) {
    response.status(400).json('password is shorter than the minimum allowed length (3)')
    return

  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

usersRouter.get('/', async (request, response) => {
    const users = await User
    .find({}).populate('blogs', { author: 1, title: 1, url: 1, likes: 1, })
    response.json(users)
})

module.exports = usersRouter