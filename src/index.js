const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const Filter = require("bad-words");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New Websocket Connection!");
  socket.emit("message", "Welcome!");

  socket.broadcast.emit("message", "A new user has joined!");

  socket.on("sendMessage", (clientMessage, callback) => {
    const filter = new Filter();
    if (filter.isProfane(clientMessage)) {
      return callback("Profanity is not allowed!");
    }
    io.emit("message", clientMessage);
    callback("Message received!");
  });

  socket.on("sendLocation", (location, callback) => {
    socket.broadcast.emit(
      "message",
      `https://google.com/maps?q=${location.lat},${location.long}`
    );
    callback();
  });

  socket.on("disconnect", () => {
    io.emit("message", "A user has left!");
  });
});

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
