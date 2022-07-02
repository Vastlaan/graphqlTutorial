require("dotenv").config();

const { ApolloServer } = require("apollo-server");
const schema = require("./schema");
const resolvers = require("./resolvers");
const { createStore } = require("./utils");

const UserApi = require("./datasources/user");
const LaunchApi = require("./datasources/launch");

const store = createStore();

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  dataSources: () => ({
    userApi: new UserApi({ store }),
    launchApi: new LaunchApi(),
  }),
});

server.listen().then(() => {
  console.log(`
    Server is running!
    Listening on port 4000
    Explore at https://studio.apollographql.com/sandbox
  `);
});
