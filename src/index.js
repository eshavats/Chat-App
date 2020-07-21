const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New Websocket Connection!");

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    socket.emit("message", generateMessage("Welcome!"));

    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage(`${user.username} has joined`));
  });

  socket.on("sendMessage", (clientMessage, callback) => {
    const filter = new Filter();
    if (filter.isProfane(clientMessage)) {
      return callback("Profanity is not allowed!");
    }
    io.emit("message", generateMessage(clientMessage));
    callback("Message received!");
  });

  socket.on("sendLocation", (location, callback) => {
    socket.emit(
      "locationMessage",
      generateLocationMessage(
        `https://google.com/maps?q=${location.lat},${location.long}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(`${user.username} has left!`)
      );
    }
  });
});

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
