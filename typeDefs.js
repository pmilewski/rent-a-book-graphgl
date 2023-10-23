const { gql } = require("apollo-server");
const typeDefs = gql`
  schema {
    query: Query
    mutation: Mutation
  }
  type Query {
    authors(searchQuery: String! = ""): [Author!]!
    author(id: ID!): Author
    books(searchQuery: String! = ""): [Book!]!
    book(id: ID!): Book
    users(searchQuery: String! = ""): [User!]!
    user(id: ID!): User
    anything(id: ID!): Anything @deprecated(reason: "Use 'resource' instead")
    everything: [Anything!]! @deprecated(reason: "Use 'resources' instead")
    resources: [Resource!]!
    resource(id: ID!): Resource
  }
  type Mutation {
    borrowBookCopy(id: ID!): BookCopy!
    returnBookCopy(id: ID!): BookCopy!
  }
  union Anything = Book | Author | User | BookCopy
  interface Resource {
    id: ID!
  }
  type Author implements Resource {
    id: ID!
    name: String!
    photo: Image!
    bio: String!
    books: [Book!]!
  }
  type Book implements Resource {
    id: ID!
    title: String!
    cover: Image!
    author: Author!
    description: String!
    copies: [BookCopy!]!
  }
  type User implements Resource {
    id: ID!
    name: String!
    email: String!
    info: String!
    avatar: Avatar!
    ownedBookCopies: [BookCopy!]!
    borrowedBookCopies: [BookCopy!]!
  }
  type Image {
    url: String!
  }
  type Avatar {
    image: Image!
    color: String!
  }
  type BookCopy implements Resource {
    id: ID!
    book: Book!
    owner: User!
    borrower: User
  }
`;

module.exports = typeDefs;
