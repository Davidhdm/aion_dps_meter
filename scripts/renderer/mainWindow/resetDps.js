const resetDpsBtn = document.querySelector(".reset-button");
resetDpsBtn.addEventListener("click", () => {
  globalThis.processedData = [];
  globalThis.listedPlayers = [];
  globalThis.playerId = 0;
  document.querySelector(".dpsmeter-container").innerHTML = "";
});
