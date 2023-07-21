const { app, BrowserWindow, ipcMain } = require("electron");
const nodePath = require("path");
require("./scripts/main/monitorChatLog.js");
require('electron-reload')(__dirname);

let window
function createWindow() {
  const win = new BrowserWindow({
    icon: "images/pollo-facherito.jpg",
    frame: false,
    width: 350,
    height: 600,
    resizable: false,
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
  /* window.setMenu(null) */
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

ipcMain.on("minimize", () => {
  BrowserWindow.getAllWindows().forEach(window => window.minimize());
});

