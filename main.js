const { app, BrowserWindow, ipcMain } = require("electron");
const nodePath = require("path");
// const AutoLaunch = require("auto-launch");
// const { readSettings } = require("./scripts/main/manageSettings.js");

require("./scripts/main/index.js");
require("electron-reload")(__dirname);

let windows = {};
function createMainWindow() {
  const win = new BrowserWindow({
    title: "NuMeter",
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

  win.loadFile("views/mainWindow.html").then(() => win.show());
  return win;
}

app.whenReady().then(() => {
  windows.main = createMainWindow();
  /* window.setMenu(null) */
});

// Auto-launch not working apparently
/* let settings;
try {
  settings = readSettings();
} catch (error) {
  console.error("Error trying to read settings:");
  console.error(error);
}

if (settings && settings.run_on_startup) {
  let autoLaunch = new AutoLaunch({
    name: "numeter"
  });
  autoLaunch.isEnabled().then((isEnabled) => {
    if (!isEnabled) autoLaunch.enable();
  });
} */

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

ipcMain.on("close-all", () => {
  app.quit();
});

ipcMain.on("close", (event, windowName) => {
  windows[windowName].close();
  delete windows[windowName];
});

ipcMain.on("minimize-all", () => {
  BrowserWindow.getAllWindows().forEach((window) => window.minimize());
});

ipcMain.on("minimize", (event, windowName) => {
  windows[windowName].minimize();
});

function createSettingsWindow() {
  const allWindows = BrowserWindow.getAllWindows();
  const adjacentWindow = allWindows[allWindows.length - 1];
  const adjacentWindowBounds = adjacentWindow.getBounds();

  const settingsWinWidth = 360;
  const settingsWinHeight = 165;
  const separation = 8;

  let newWinPosX =
    adjacentWindowBounds.x + adjacentWindowBounds.width + separation;
  let outOfScreenRight = newWinPosX + settingsWinWidth > 0;
  // If window is out of screen by right side
  if (outOfScreenRight) {
    // Place on left side
    newWinPosX = adjacentWindowBounds.x - settingsWinWidth - separation;
  }
  let newWinPosY = adjacentWindowBounds.y;

  const win = new BrowserWindow({
    title: "Settings",
    icon: "images/pollo-settings.jpg",
    x: newWinPosX,
    y: newWinPosY,
    frame: false,
    width: settingsWinWidth,
    height: settingsWinHeight,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      preload: nodePath.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("views/settingsWindow.html").then(() => win.show());
  return win;
}

ipcMain.on("open-settings", () => {
  if (!windows.settings) {
    windows.settings = createSettingsWindow();
  }
});
