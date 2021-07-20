import express from "express"
import { ApolloServer } from "apollo-server-express"
import { makeExecutableSchema, mergeResolvers, mergeTypeDefs } from "graphql-tools"
import mongoose from "mongoose"
import http from "http"
import { GraphQLSchema } from 'graphql'
require("dotenv").config();

// https://mongoosejs.com/docs/deprecations.html#findandmodify
mongoose.set("useFindAndModify", false);

// Import TypeDefs and Resolvers
import { userSchema, typeDefs } from "./schema/"

import { userResolver } from "./resolvers/"

const schema: GraphQLSchema = makeExecutableSchema({
  typeDefs: mergeTypeDefs([userSchema, typeDefs]),
  resolvers: mergeResolvers([userResolver]),
});

const app = express();
const server = new ApolloServer({
  schema,
  context: async ({ req }) => {
    const token = req.headers.authorization || "";
    return { token };
  },
});

// Create GraphQL server
server.applyMiddleware({ app, path: '/graphql' })

// Create GraphQL Subscription server
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

const port = process.env.PORT || 5000;

// Connect to MongoDB
const URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_ADDRESS}/${process.env.DB_NAME_DEV}?retryWrites=true&w=majority`;
mongoose
  .connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    httpServer.listen(port, () => {
      console.log(`Server ready at: http://localhost:${port}${server.graphqlPath}`);
      console.log(`Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
