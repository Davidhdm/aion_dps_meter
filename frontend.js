let processedData = [];

window.bridge.receive("sendData", (data) => {

  data.forEach(skillData => {
    processedData.push(skillData)
  });
  console.log(processedData)
});

document.getElementById("header").innerHTML =
  logProcessor.processedSkillData[0].skillName;
