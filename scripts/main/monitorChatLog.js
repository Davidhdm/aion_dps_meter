const { processLogContent } = require('./logProcessor.js')
const fs = require('fs')

const logFile = 'D:/AionRepublic/aion/Chat.log'
let logExists = fs.existsSync(logFile);
let fileSize;

const handleFileChange = async () => {
  if (!fs.existsSync(logFile)) return
  try {
    const newFileSize = fs.statSync(logFile).size;
    const bytesToRead = newFileSize - fileSize;

    // if there is new content in the file
    if (bytesToRead > 0) {
      // create new buffer of the same size than the new content to read
      const buffer = Buffer.alloc(bytesToRead);
      const fileDescriptor = fs.openSync(logFile, 'r');

      // read the new content and write it into the buffer
      fs.readSync(fileDescriptor,
        buffer,
        0,
        bytesToRead, // length of content to read
        fileSize // initial read position
      );
      fs.closeSync(fileDescriptor);

      const newContent = buffer.toString('utf8');
      processLogContent(newContent);
    }
    fileSize = newFileSize;
  } catch (error) {
    console.log('Error: ' + error)
  }
}

const debounce = (func, delay) => {
  let timerId;

  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const debouncedHandleFileChange = debounce(handleFileChange, 10);

async function checkLogExistence() {
  while (!logExists) {
    logExists = fs.existsSync(logFile);
    console.log('log exists: ' + logExists)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return Promise.resolve()
}

checkLogExistence().then(() => {
  fileSize = fs.statSync(logFile).size;
  fs.watch(logFile, debouncedHandleFileChange)
})

module.exports