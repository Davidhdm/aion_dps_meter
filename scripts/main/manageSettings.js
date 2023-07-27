const fs = require("fs");
const { ipcMain, BrowserWindow } = require("electron");

const defaultSettings = JSON.stringify({
  chatlog_location: "",
  // run_on_startup: false,
});

function createSettingsFile() {
  let settingsExist = fs.existsSync("settings.json");
  if (!settingsExist) {
    fs.writeFileSync("settings.json", defaultSettings, (error) => {
      if (error) {
        console.error(error);
        throw error;
      }
    });
  }
}

function readSettings() {
  try {
    const settings = JSON.parse(fs.readFileSync("settings.json"));
    return settings;
  } catch (error) {
    console.error(error);
  }
}

function updateSettings(newSettings) {
  const currentSettings = readSettings();
  let updatedSettings = {...currentSettings, ...newSettings}

  fs.writeFileSync("settings.json", JSON.stringify(updatedSettings));
}

ipcMain.on("update-chatlog-location", (event, arg) => {
  const logExists = fs.existsSync(arg);
  if (logExists) {
    const data = { chatlog_location: arg };
    fs.writeFileSync("settings.json", JSON.stringify(data), (error) => {
      if (error) {
        console.error(error);
        throw error;
      }
    });
    ipcMain.emit("valid-chatlog-location", arg);
  } else {
    BrowserWindow.getAllWindows()[0].webContents.send("file-doesnt-exist");
  }
});

ipcMain.on("get-settings", (event) => {
  settings = readSettings();
  BrowserWindow.getAllWindows()[0].webContents.send(
    "send-settings",
    settings
  );
});

ipcMain.on("update-settings", (event, newSettings) => {
  updateSettings(newSettings);
})

module.exports = {
  readSettings,
  createSettingsFile,
};
