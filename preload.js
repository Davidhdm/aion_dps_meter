const { contextBridge, ipcRenderer } = require("electron");
/* const drag = require("electron-drag"); */

contextBridge.exposeInMainWorld("bridge", {
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  receive: (channel, callback) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  }/* ,
  drag: (element) => {
    drag(element);
  }, */
});
