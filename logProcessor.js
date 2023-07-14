const { BrowserWindow } = require('electron')

function sendDataToRenderer(data) {
  const mainWindow = BrowserWindow.getAllWindows()[0]; // Get the reference to the main window
  console.log(data)
  mainWindow.webContents.send('sendData', data);
};

function processLogContent(logContent) {
  let processedSkillData = []
  let splittedLogs = getSplittedLogs(logContent)

  splittedLogs.forEach(log => {
    if (getSkillType(log) === 'auto_attack' || getSkillType(log) === 'dmg_skill') {
      processedSkillData.push(buildSkillData(log))
    }
  })
  sendDataToRenderer(processedSkillData)
}

function getSplittedLogs(logContent) {
  // Split logs by timestamp and trim them
  let splittedLogs = logContent.split(/(?=\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}:\d{2} : )/)
  splittedLogs = splittedLogs.map(log => log.trim())
  return splittedLogs
};

function getTimeStamp(log) {
  return log.substring(0, 19)
}

function getPlayerName(log) {
  return log.match(/(?<=: ).*(?= inflicted| recovered)/)[0]
}

function getTargetName(log) {
  return log.match(/(?<=damage on ).*?(?=\.| by using)/)[0]
}

function getSkillValue(log) {
  return log.match(/(?<=inflicted |recovered )[\d,]*/)[0]
}

function getSkillName(log) {
  const match = log.match(/(?<=by using ).*?(?=\.)/)
  if (match) return match[0]
  return "Auto Attack"
}

function getSkillType(log) {
  switch (true) {
    case /inflicted (\d|,)* damage on(?!.*by using)/.test(log):
      return "auto_attack"
    case /inflicted (\d|,)* damage on(?=.*by using)/.test(log):
      return "dmg_skill"
    case /recovered (\d|,)* HP/.test(log):
      return "heal"
    case /recovered (\d|,)* MP/.test(log):
      return "heal_mp"
    default:
      return "other"
  }
}

function isCriticalHit(log) {
  return log.includes("Critical Hit!")
}

function buildSkillData(log) {
  return {
    timestamp: getTimeStamp(log),
    skillName: getSkillName(log),
    skillType: getSkillType(log),
    skillValue: getSkillValue(log),
    isCriticalHit: isCriticalHit(log),
    player: getPlayerName(log),
    target: getTargetName(log)
  }
}

module.exports = {
  processLogContent
}