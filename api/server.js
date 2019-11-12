const express = require("express");
const helmet = require("helmet");
const cors = require("cors"); // research -- 'credentials: true' and 'withCredentials' when connecting from your React application
const session = require("express-session");
const KnexSessionStorage = require("connect-session-knex")(session); // for storing sessions in db

const authRouter = require("../auth/auth-router.js");
const usersRouter = require("../users/users-router.js");
const knexConnection = require("../database/dbConfig");

const server = express();

const sessionConfiguration = {
  name: "booger", // default name is sid, using different name to hide library
  secret: process.env.COOKIE_SECRET || "is it secret? is it safe?",
  cookie: {
    maxAge: 1000 * 60 * 60, // valid for 1 hour in milliseconds
    secure: process.env.NODE_ENV === "development" ? false : true, // do we send cookie over https only? should be true for production
    httpOnly: true // prevent client javascript code from acesssing the cookie
  },
  resave: false, // save sessions even when they have not changed
  saveUnitialized: true, // read about it on the docs to respect GDPR, should default to false in production
  store: new KnexSessionStorage({
    knex: knexConnection,
    clearInterval: 1000 * 60 * 10, // delete expired sessions every 10 minutes
    tablename: "user_sessions",
    sidfieldname: "id",
    createtable: true
  })
};

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfiguration));

server.use("/api/auth", authRouter);
server.use("/api/users", usersRouter);

server.get("/", (req, res) => {
  res.json({ api: "up", session: req.session });
});

module.exports = server;
