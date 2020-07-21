const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

const message = "Welcome!";
io.on("connection", (socket) => {
  console.log("New Websocket Connection!");

  socket.emit("message", message);
  socket.on("sendMessage", (clientMessage) => {
    io.emit("message", clientMessage);
  });
});

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
