import "./windowBehavior.js";
const chatlogInput = document.getElementById("chatlog-text-input");
// const runOnStartupCB = document.getElementById("run-on-startup");

window.bridge.send("get-settings");
window.bridge.receive("send-settings", (settings) => {
  console.log(settings);
  chatlogInput.value = settings.chatlog_location;
  runOnStartupCB.checked = settings.run_on_startup;
});

document.getElementById("chatlog-file-input").addEventListener("input", () => {
  try {
    const file = document.forms["chatlog-form"]["chatlog-file-input"].files[0];
    chatlogInput.value = file.path.replaceAll("\\", "/");
    if (file.name == "Chat.log") {
      hideChatlogError();
    } else {
      showChatlogError("isNotChatlog");
    }
  } catch (error) {
    console.warn(error);
  }
});

chatlogInput.addEventListener("input", (event) => {
  if (!isChatlog(chatlogInput.value)) {
    showChatlogError("isNotChatlog");
  } else {
    hideChatlogError();
  }
});

function isChatlog(value) {
  return value.slice(-9, chatlogInput.value.length) === "/Chat.log";
}

const errors = {
  isNotChatlog: "This is not a Chat.log file.",
  fileDoesNotExist: "File doesn't exist.",
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
  if (!isChatlog(chatlogInput.value)) {
    showChatlogError("isNotChatlog");
  } else {
    window.bridge.send("update-chatlog-location", chatlogInput.value);
  }
});

window.bridge.receive("file-doesnt-exist", () => {
  showChatlogError("fileDoesNotExist");
});

document.forms["other-settings-form"].addEventListener("submit", (event) => {
  event.preventDefault();
  window.bridge.send("update-settings", {
    run_on_startup: runOnStartupCB.checked,
  })
});
