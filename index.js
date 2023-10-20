const { ApolloServer } = require("apollo-server");
const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");
const db = require("./db");
const PORT = process.env.PORT || 4000;
const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || "http://examples.devmastery.pl/assets/images/"


const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: {
    imageBaseUrl: IMAGE_BASE_URL,
    db
  },
  introspection: true,
  playground: true
});

server.listen({ port: PORT }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
