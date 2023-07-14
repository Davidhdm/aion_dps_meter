const { app, BrowserWindow } = require("electron");
const nodePath = require("path");
require("./monitorChatLog.js");

let window
function createWindow() {
  const win = new BrowserWindow({
    // icon: "img\\icon.png",
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: nodePath.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("index.html").then(() => win.show());
  return win
}

app.whenReady().then(() => {
  window = createWindow()
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
