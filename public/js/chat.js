const socket = io();

//Elements
const $messageForm = document.getElementById("msg-form");
const $messageFormInput = document.getElementById("data");
const $messageFormBtn = document.getElementById("send-msg");
const $locationBtn = document.getElementById("send-location");
const $messages = document.getElementById("messages");

//Templates
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-message-template").innerHTML;

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a")
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", (locationMessage) => {
  console.log(locationMessage);
  const html = Mustache.render(locationTemplate, {
    url: locationMessage.url,
    createdAt: moment(locationMessage.createdAt).format("h:mm a")
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //disable send message button till the message is successfully delivered
  $messageFormBtn.setAttribute("disabled", "disabled");
  const inputMessage = $messageFormInput.value;

  socket.emit("sendMessage", inputMessage, (message) => {
    //enable send message button when the message is successfully delivered
    $messageFormBtn.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    console.log(`Server says: ${message}`);
  });
});

$locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  $locationBtn.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    const location = {
      lat: position.coords.latitude,
      long: position.coords.longitude,
    };
    socket.emit("sendLocation", location, () => {
      $locationBtn.removeAttribute("disabled");
      console.log("Location shared!");
    });
  });
});
