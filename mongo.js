const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://katrilaamala:${password}@cluster0.8xpybwa.mongodb.net/BlogApp?retryWrites=true&w=majority`


mongoose.set('strictQuery', false)
mongoose.connect(url)


const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})


const Blog = mongoose.model('Blog', blogSchema)

const blog = new Blog({
  title: String,
  author: String,
  url: String,
  likes: Number
})



blog.save().then(() => {
  console.log('blog saved')
  mongoose.connection.close()
})
