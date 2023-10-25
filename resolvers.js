const decodeBase64 = base64String =>
  Buffer.from(base64String, "base64").toString();
const encodeBase64 = rawString => Buffer.from(rawString).toString("base64");

const toExternalId = (dbId, type) => encodeBase64(`${type}-${dbId}`);
const toTypeAndDbId = externalId => decodeBase64(externalId).split("-", 2);
const toDbId = externalId => toTypeAndDbId(externalId)[1];

const getAnythingByExternalId = (externalId, db) => {
  const [type, dbId] = toTypeAndDbId(externalId);
  switch (type) {   
    case "Book": {
      return db.getBookById(dbId);
    }
    case "BookCopy": {
      return db.getBookCopyById(dbId);
    }
    case "Author": {
      return db.getAuthorById(dbId);
    }
    case "User": {
      return db.getUserById(dbId);
    }
    default:
      return null;
  }
};

const getResourceByExternalId = (externalId, db) => {
  const [type, dbId] = toTypeAndDbId(externalId);
  return db.getResourceByIdAndType(dbId, type);
}

const id = resource => toExternalId(resource.id, resource.resourceType)

const resolvers = {
  Query: {
    books: (rootValue, { searchQuery }, { db, search }) =>
      searchQuery.length > 0 ? search.findBooks(searchQuery) : db.getAllBooks(),
    authors: (rootValue, { searchQuery }, { db, search }) =>
      searchQuery ? search.findAuthors(searchQuery) : db.getAllAuthors(),
    users: (rootValue, { searchQuery }, { db, search }) =>
      searchQuery ? search.findUsers(searchQuery) : db.getAllUsers(),
    book: (rootValue, { id }, { db }) => db.getBookById(toDbId(id)),
    author: (rootValue, { id }, { db }) => db.getAuthorById(toDbId(id)),
    user: (rootValue, { id }, { db }) => db.getUserById(toDbId(id)),
    anything: (rootValue, { id }, { db }) => getAnythingByExternalId(id, db),
    everything: (rootValue, args, { db }) => [
    ...db.getAllBookCopies(),
    ...db.getAllAuthors(),
    ...db.getAllUsers(),
    ...db.getAllBooks()
    ],
    resources: (rootValue, args, { db }) => [
    ...db.getAllBookCopies(),
    ...db.getAllAuthors(),
    ...db.getAllUsers(),
    ...db.getAllBooks()
    ],
    resource: (rootValue, { id }, { db }) => getResourceByExternalId(id, db)
  },
  Mutation: {
    borrowBookCopy: (rootValue, { id }, { db, currentUserDbId }) => {
      db.borrowBookCopy(toDbId(id), currentUserDbId);
      return db.getBookCopyById(toDbId(id));
    },
    returnBookCopy: (rootValue, { id }, { db, currentUserDbId }) => {
      db.returnBookCopy(toDbId(id), currentUserDbId);
      return db.getBookCopyById(toDbId(id));
    }
  },
  Book: {
    id,
    author: (book, args, { db }) => db.getAuthorById(book.authorId),
    cover: book => ({
      path: book.coverPath
    }),
    copies: (book, args, { db }) =>
      db.getBookCopiesByBookId(book.id)
  },
  Author: {
    id,
    books: (author, args, { db }) => db.getBooksByAuthorId(author.id),
    photo: author => ({
      path: author.photoPath
    })
  },
  Avatar: {
    image: avatar => ({
      path: avatar.imagePath
    })
  },
  BookCopy: {
    id,
    book: (bookCopy, args, { db }) => db.getBookById(bookCopy.bookId),
    borrower: (bookCopy, args, { db }) => bookCopy.borrowerId && db.getUserById(bookCopy.borrowerId),
    owner: (bookCopy, args, { db }) => db.getUserById(bookCopy.ownerId),
  },
  Image: {
    url: (image, args, { baseAssetsUrl }) => baseAssetsUrl + image.path
  },
  User: {
    id,
    ownedBookCopies: (user, args, { db }) => db.getBookCopiesByOwnerId(user.id),
    borrowedBookCopies: (user, args, { db }) => db.getBookCopiesByBorrowerId(user.id),
  },
  Anything: {
    __resolveType: anything => {
      if (anything.ownerId) {
        return "BookCopy";
      }
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
  Resource: {
    __resolveType: resource => resource.resourceType
  }
};

module.exports = resolvers;
