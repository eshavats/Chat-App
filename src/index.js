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

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New Websocket Connection!");

  socket.on("join", ({ username, room }) => {
    socket.join(room);
    socket.emit("message", generateMessage("Welcome!"));

    socket.broadcast.to(room).emit("message", generateMessage(`${username} has joined`));
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
    io.emit("message", generateMessage("A user has left!"));
  });
});

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
