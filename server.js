const fs = require("fs");
const path = require("path");
const { ApolloServer, gql } = require('apollo-server');

const schemaPath = path.join(__dirname, "schema.graphql")

if (!fs.existsSync(schemaPath)) {
  throw new Error("Schema doesn't exist")
}

const schema = fs.readFileSync(schemaPath).toString();

const server = new ApolloServer({
  typeDefs: gql(schema),
  mocks: true,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
