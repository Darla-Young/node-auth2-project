const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const authRouter = require("./auth/auth-router.js");
const usersRouter = require("./users/users-router.js");
const session = require('express-session')

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

server.use(session({
  name: 'weirdAl',
  secret: 'I can see! Its a miracle!',
  cookie: {
    maxAge: 1 * 24 * 60 * 60 * 1000,
    secure: false, // CHANGE BEFORE PRODUCTION!!!
  },
  httpOnly: false, // CHANGE BEFORE PRODUCTION!!!
  resave: false,
  saveUninitialized: false,
}))

server.use("/api/auth", authRouter);
server.use("/api/users", usersRouter);

server.use((err, req, res, next) => { // eslint-disable-line
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  });
});

module.exports = server;
