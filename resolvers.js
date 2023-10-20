const resolvers = {
    Book: {
        author: (book, args, {db}) => db.getAuthorById(book.authorId),
        cover: (book) => ({
            path: book.coverPath
        })
    },
    Author: {
        books: (author, args, {db}) => author.bookIds.map(db.getBookById),
        photo: (author) => ({
            path: author.photoPath
        })
    },
    Image: {
        url: (image, args, context) => context.imageBaseUrl + image.path
    },
    Query: {
        books: (rootValue, args, {db}) => db.getAllBooks(),
        authors: (rootValue, args, {db}) => db.getAllAuthors(),
        users: (rootValue, args, {db}) => db.getAllUsers()
    }
};

module.exports = resolvers;