if (process.env.NODE_ENV !== "production") require("dotenv").config();

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const httpServer = require("http").createServer(app);

global.io = require("socket.io")(httpServer, {
  cors: { origin: process.env.FRONT_END },
});

global.broadcasts = new Map();
global.users = new Map();
global.usersSocketToId = new Map();

global._getBroadcast = (key) => global.broadcasts.get(key);
global._getUser = (key) => global.users.get(key);
global._getUserId = (key) => global.usersSocketToId.get(key);

const { socketController } = require("./controllers/_socket");

const port = process.env.PORT || 4000;
httpServer.listen(port, async () => {
  console.log(`Server up and running @:${port}`);

  const dbURI =
    process.env.NODE_ENV === "production"
      ? process.env.DB_URI
      : process.env.LOCAL_DB_URI;

  // db connection
  await mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });

  console.log("Connected to db");

  mongoose.connection.dropDatabase();
  console.log("Db dropped");

  global.io.on("connection", socketController);
});

// static files
app.use(express.static("public"));

// middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// controllers
const bcastRoutes = require("./routes/bcastRoutes");

// routes
app.get("/", (req, res) => res.send("Backend connected!"));

app.use("/broadcasts", bcastRoutes);
