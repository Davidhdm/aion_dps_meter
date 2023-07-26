const fs = require("fs");
const { ipcMain, BrowserWindow } = require("electron");

function createSettingsFile() {
  let settingsExist = fs.existsSync("settings.json");
  if (!settingsExist) {
    fs.writeFileSync(
      "settings.json",
      JSON.stringify({ chatlog_location: "" }),
      (error) => {
        if (error) {
          console.error(error);
          throw error;
        }
      }
    );
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
    ipcMain.emit("valid-chatlog-location", arg)
  } else {
    BrowserWindow.getAllWindows()[0].webContents.send("file-doesnt-exist");
  }
});

ipcMain.on("get-chatlog-location", (event) => {
  const chatlogLocation = readSettings().chatlog_location;
  console.log(chatlogLocation);
  BrowserWindow.getAllWindows()[0].webContents.send(
    "send-chatlog-location",
    chatlogLocation
  );
});

module.exports = {
  readSettings,
  createSettingsFile,
};
