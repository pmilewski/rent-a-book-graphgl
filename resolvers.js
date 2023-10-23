const decodeBase64 = base64string => Buffer.from(base64string, "base64").toString();
const encodeBase64 = rawString => Buffer.from(rawString).toString("base64");

const toExternalId = (dbId, type) => encodeBase64(`${type}:${dbId}`);
const toTypeAndDbId = externalId => decodeBase64(externalId).split(":", 2);
const todBId = externalId => toTypeAndDbId(externalId)[1];

const getAnythingByExternalId = (externalId, db) => {
    const [type, dbId] = toTypeAndDbId(externalId);

    switch (type) {
        case "Book":
            return db.getBookById(dbId);
        case "Author":
            return db.getAuthorById(dbId);
        case "User":
            return db.getUserById(dbId);
        default:
            return null;
    }
};

const resolvers = {
    Anything: {
        __resolveType: (anything) => {
            if (anything.title) {
                return "Book";
            }
            if (anything.bio) {
                return "Author";
            }
            if (anything.info) {
                return "User";
            }
            return null;
        }
    },
    Book: {
        id: book => toExternalId(book.id, "Book"),
        author: (book, args, {db}) => db.getAuthorById(book.authorId),
        cover: (book) => ({
            path: book.coverPath
        })
    },
    Author: {
        id: author => toExternalId(author.id, "Author"),
        books: (author, args, {db}) => author.bookIds.map(db.getBookById),
        photo: (author) => ({
            path: author.photoPath
        })
    },
    User: {
        id: user => toExternalId(user.id, "User")
    },
    Image: {
        url: (image, args, context) => context.imageBaseUrl + image.path
    },
    Query: {
        books: (rootValue, { searchQuery }, { db, search }) =>
            searchQuery.length > 0
                ? search.findBooks(searchQuery)
                : db.getAllBooks(),
        
        authors: (rootValue, { searchQuery }, { db, search }) =>
            searchQuery.length > 0
                ? search.findAuthors(searchQuery)
                : db.getAllAuthors(),
        
        users: (rootValue, { searchQuery }, { db, search }) =>
            searchQuery.length > 0
                ? search.findUsers(searchQuery)
                : db.getAllUsers(),
        
        book: (rootValue, { id }, { db }) => db.getBookById(todBId(id)),
        author: (rootValue, { id }, { db }) => db.getAuthorById(todBId(id)),
        user: (rootValue, { id }, { db }) => db.getUserById(todBId(id)),
        anything: (rootValue, { id }, { db }) => getAnythingByExternalId(id, db)
    }
};

module.exports = resolvers;