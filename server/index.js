if (process.env.NODE_ENV !== "production") require("dotenv").config();

const cors = require("cors");
const express = require("express");
const { PeerServer } = require("peer");

const app = express();
const httpServer = require("http").createServer(app);

global.io = require("socket.io")(httpServer);

global.broadcasts = new Map();
global.users = new Map();
global.usersSocketToId = new Map();

global._getBroadcast = (key) => global.broadcasts.get(key);
global._getUser = (key) => global.users.get(key);
global._getUserId = (key) => global.usersSocketToId.get(key);

const { socketController } = require("./controllers/_socket");

const port = process.env.PORT || 4000;
httpServer.listen(port, async () => {
  const peerServer = PeerServer({ port: 9000, path: "/myapp" });

  peerServer.listen();
  console.log(`Server up and running @:${port}`);

  global.io.on("connection", socketController);
});

// middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// routes
app.get("/", (req, res) => res.send("Backend connected!"));
