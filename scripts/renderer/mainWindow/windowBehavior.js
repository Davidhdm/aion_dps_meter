const closeBtn = document.querySelector(".close-btn");
closeBtn.addEventListener("click", () => {
  window.bridge.send("close-all");
});

const minimizeBtn = document.querySelector(".minimize-btn");
minimizeBtn.addEventListener("click", () => {
  window.bridge.send("minimize-all");
});
minimizeBtn.addEventListener("auxclick", () => {
  window.bridge.send("minimize", "main");
});
