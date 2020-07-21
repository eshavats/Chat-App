const socket = io();

socket.on("message", (message) => {
  console.log(message);
});

document.getElementById("msg-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const inputMessage = document.getElementById("data").value;

  socket.emit("sendMessage", inputMessage, (message) => {
    console.log(`Server says: ${message}`);
  });
});

document.getElementById("send-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const location = {
      lat: position.coords.latitude,
      long: position.coords.longitude,
    };
    socket.emit("sendLocation", location, () => {
      console.log("Location shared!");
    });
  });
});
