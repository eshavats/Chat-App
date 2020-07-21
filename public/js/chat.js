const socket = io();

socket.on("message", (message) => {
  console.log(message);
});

document.getElementById("msg-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const inputMessage = document.getElementById("data").value;

  socket.emit("sendMessage", inputMessage);
});
