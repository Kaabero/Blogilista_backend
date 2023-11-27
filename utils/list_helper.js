var _ = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const likes = blogs.map(blog => blog.likes)
    console.log('likes', likes)
    const totalLikes = likes.reduce(
        (accumulator, currentValue) => accumulator + currentValue, 0
    )
    console.log('total', totalLikes)
    return totalLikes
}

const favoriteBlog = (blogs) => {
    const likes = blogs.map(blog => blog.likes)
    const isMostLiked = (element) => element == Math.max(...likes)
    const winner = blogs[likes.findIndex(isMostLiked)]
    console.log('winner', winner)
    return winner
}

const mostBlogs = (blogs) => {
    const authors = blogs.map(blog => blog.author)

    const blogsPerAuthor = _.values(_.groupBy(authors)).map(d => ({author: d[0], blogs: d.length}))
    console.log('blogsPerAuthor', blogsPerAuthor)

    const mostBlogs = _.maxBy(blogsPerAuthor, 'blogs')

    console.log('mostBlogs', mostBlogs)

    return mostBlogs
}
  
module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs
}