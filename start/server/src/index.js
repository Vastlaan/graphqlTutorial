require("dotenv").config();
const isEmail = require("isemail");
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
  context: async ({ req }) => {
    // simple auth check on every request
    const auth = (req.headers && req.headers.authorization) || "";
    const email = Buffer.from(auth, "base64").toString("ascii");

    if (!isEmail.validate(email)) return { user: null };

    // find a user by their email
    const users = await store.users.findOrCreate({ where: { email } });
    const user = (users && users[0]) || null;

    return { user: { ...user.dataValues } };
  },
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
