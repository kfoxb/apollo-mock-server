const fs = require("fs");
const path = require("path");
const { makeRemoteExecutableSchema, ApolloServer, gql, introspectSchema } = require('apollo-server');
const fetch = require('node-fetch')
const { print } = require('graphql');
const { addMockFunctionsToSchema, makeExecutableSchema, mergeSchemas } = require('graphql-tools')

const fetcher = async ({ query: queryDocument, variables, operationName, context }) => {
  const query = print(queryDocument);
  const fetchResult = await fetch('http://localhost:8075/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query, variables, operationName })
  });
  return fetchResult.json();
};

const createSchema = async () => {
  const schema = makeRemoteExecutableSchema({
    schema: await introspectSchema(fetcher),
    fetcher,
  });
  return schema
}

const start = async () => {
  const schemaPath = path.join(__dirname, "schema.graphql")
  if (!fs.existsSync(schemaPath)) {
    throw new Error("Schema doesn't exist")
  }
  const mockedSchema = makeExecutableSchema({ typeDefs: fs.readFileSync(schemaPath).toString() });
  addMockFunctionsToSchema({ schema: mockedSchema });
  const gatewaySchema = await createSchema()
  const schema = mergeSchemas({
    schemas: [
      gatewaySchema,
      mockedSchema,
    ],
  });
  const server = new ApolloServer({
    schema,
  });
  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`)
  });
}

start()
