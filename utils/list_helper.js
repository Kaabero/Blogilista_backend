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
  
module.exports = {
    dummy,
    totalLikes,
}