import "./windowBehavior.js";
const textInput = document.getElementById("chatlog-text-input");

window.bridge.send("get-chatlog-location")
window.bridge.receive("send-chatlog-location", (chatlogLocation) => {
  textInput.value = chatlogLocation
})

document.getElementById("chatlog-file-input").addEventListener("input", () => {
  try {
    const file = document.forms["chatlog-form"]["chatlog-file-input"].files[0];
    textInput.value = file.path.replaceAll("\\", "/");
    if (file.name == "Chat.log") {
      hideChatlogError();
    } else {
      showChatlogError("isNotChatlog");
    }
  } catch (error) {
    console.warn(error);
  }
});

textInput.addEventListener("input", (event) => {
  if (!isChatlog(textInput.value)) {
    showChatlogError("isNotChatlog");
  } else {
    hideChatlogError();
  }
});

function isChatlog(value) {
  return value.slice(-9, textInput.value.length) === "/Chat.log";
}

const errors = {
  isNotChatlog: "This is not a Chat.log file.",
  fileDoesNotExist: "File doesn't exist",
};
function showChatlogError(error) {
  const chatlogErrorElement = document.querySelector(".chatlog-error");
  chatlogErrorElement.classList.remove("hidden");
  chatlogErrorElement.innerHTML = errors[error];
}

function hideChatlogError() {
  document.querySelector(".chatlog-error").classList.add("hidden");
}

document.forms["chatlog-form"].addEventListener("submit", (event) => {
  event.preventDefault();
  if (!isChatlog(textInput.value)) {
    showChatlogError("isNotChatlog");
  } else {
    window.bridge.send("update-chatlog-location", textInput.value);
  }
});

window.bridge.receive("file-doesnt-exist", () => {
  showChatlogError("fileDoesNotExist");
});
