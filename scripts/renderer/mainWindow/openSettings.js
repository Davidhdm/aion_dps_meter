document.querySelector(".settings-button").addEventListener("click", () => {
  window.bridge.send("open-settings", "settings")
})
