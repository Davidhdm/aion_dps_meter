const { BrowserWindow } = require('electron')

function processLogContent(logContent) {
  let processedSkillData = []
  let splittedLogs = getSplittedLogs(logContent)
  try {
    splittedLogs.forEach(log => {
      logType = getLogType(log)

      if (['auto_attack', 'dmg_skill', 'dmg_unknown'].includes(logType)) {
        const builtSkillData = buildSkillData(log, logType)
        processedSkillData.push(builtSkillData)
      }
    })
    if (processedSkillData.length > 0) sendDataToRenderer(processedSkillData)
  } catch (error) {
    console.error(error)
  }
}

function sendDataToRenderer(data) {
  const mainWindow = BrowserWindow.getAllWindows()[0]; // Get the reference to the main window
  mainWindow.webContents.send('send-data', data);
};

function getSplittedLogs(logContent) {
  // Split logs by timestamp and trim them
  let splittedLogs = logContent.split(/(?=\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}:\d{2} : )/)
  splittedLogs = splittedLogs.map(log => log.trim())
  return splittedLogs
};

function getTimeStamp(log) {
  return log.substring(0, 19)
}

function getPlayerName(log, skillType) {
  switch (skillType) {
    case 'auto_attack':
    case 'dmg_skill':
      return log.match(/(?<=: |Critical Hit! ?)[\w ]*(?= inflicted)/)[0].trim()
    case 'dmg_unknown':
      return "-Unknown-"
  }
}

function getTargetName(log, skillType) {
  switch (skillType) {
    case 'auto_attack':
    case 'dmg_skill':
      return log.match(/(?<=damage on ).*?(?=\.| by using)/)[0]
    case 'dmg_unknown':
      return log.match(/(?<=: )[\w ]*(?= received)/)[0]
  }
}

function getSkillValue(log, skillType) {
  let value
  switch (skillType) {
    case 'auto_attack':
    case 'dmg_skill':
      value = log.match(/(?<=inflicted )[\d.,]*/)[0]
      break
    case 'dmg_unknown':
      value = log.match(/(?<=received )[\d.,]*(?= damage due to the effect)/)[0]
      break
  }
  value = value.replaceAll(/[.,]/g, '')
  return value
}

function getSkillName(log, skillType) {
  switch (skillType) {
    case 'auto_attack':
      return "Auto Attack"
    case 'dmg_skill':
      return log.match(/(?<=damage on.*by using ).*(?=\.)/)[0]
    case 'dmg_unknown':
      return log.match(/(?<=damage due to the effect of )[\w ]*/)[0]
  }
}

const isAutoAttack = /inflicted (\d|.)* damage on(?!.*by using)/
const dmgSkill = /inflicted (\d|.)* damage on.*by using/
/* const heal = /recovered (\d|.)* HP/
const healMp = /recovered (\d|.)* MP/ */
const dmgUnknown = /\w* received [\d,.]* damage due to/

function getLogType(log) {
  switch (true) {
    case isAutoAttack.test(log):
      return "auto_attack"
    case dmgSkill.test(log):
      return "dmg_skill"
    case dmgUnknown.test(log):
      return "dmg_unknown"
    /* case heal.test(log):
      return "heal"
    case healMp.test(log):
      return "heal_mp" */
    case log.includes('successfully socketed a manastone'):
      return "manastone_success"
    case log.includes('failed in the manastone socketing'):
      return "manastone_failure"
    default:
      return "other"
  }
}

function isCriticalHit(log) {
  return log.includes("Critical Hit!")
}

function buildSkillData(log, skillType) {
  return {
    timestamp: getTimeStamp(log),
    name: getSkillName(log, skillType),
    type: skillType,
    value: getSkillValue(log, skillType),
    isCriticalHit: isCriticalHit(log),
    player: getPlayerName(log, skillType),
    target: getTargetName(log, skillType)
  }
}

module.exports = { processLogContent }