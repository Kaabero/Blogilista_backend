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
    console.log('authors', authors)

    const grouped = _.groupBy(authors)
    console.log('grouped', grouped)

    const blogsPerAuthor = _.values(_.groupBy(authors)).map(d => ({author: d[0], blogs: d.length}))

    console.log('blogsPerAuthor', blogsPerAuthor)

    const mostBlogs = _.maxBy(blogsPerAuthor, 'blogs')

    console.log('mostBlogs', mostBlogs)

    return mostBlogs
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) {
        return undefined
    }
    const likes = blogs.map(({ author, likes }) => ({author: author, likes: likes}))
    console.log('likes', likes)

    const likesPerAuthor = {}

    likes.forEach(blog => {
        const { author, likes } = blog
        if (likesPerAuthor[author]) {
            likesPerAuthor[author] += likes
        } else {
        likesPerAuthor[author] = likes
        }
    })

    console.log('likesPerAuthor', likesPerAuthor)


    const authorWithMostLikes = Object.keys(likesPerAuthor).reduce((a, b) => likesPerAuthor[a] > likesPerAuthor[b] ? a : b)

    const mostLikes = Math.max(...Object.values(likesPerAuthor))

    console.log(`author: ${authorWithMostLikes}, likes: ${mostLikes}`)

    const result =  { author: authorWithMostLikes, likes: mostLikes } 

    console.log('result', result)

    return result
}
  
module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}