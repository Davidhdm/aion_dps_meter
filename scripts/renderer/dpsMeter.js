import { groupBy, addAutoScroll } from "./helpers.js";
import allSkills from "./allSkills.js";
import "./windowBehavior.js";

let processedData = {};
let listedPlayers = [];
let playerId = 0;
const dpsMeterContainer = document.querySelector(".dpsmeter-container");

window.bridge.receive("sendData", (data) => {
  try {
    let groupedByPlayer = groupBy(data, "player");
    mergeGroupedData(processedData, groupedByPlayer);

    for (const key in groupedByPlayer) {
      let playerIndex = findPlayerIndex(key);
      // If player is NOT yet in the list
      if (playerIndex === -1) {
        addPlayerToList(key);
      }
      playerIndex = findPlayerIndex(key);
      const skillList = groupedByPlayer[key];

      if (listedPlayers[playerIndex].class === "unknown_class") {
        definePlayerClass(playerIndex, skillList);
      }
      addDamageToPlayer(playerIndex, skillList);
      updateDpsList();
    }
  } catch (error) {
    console.error(error);
  }
});

function mergeGroupedData(grouped1, grouped2) {
  const grp2keys = Object.keys(grouped2);
  for (const key of grp2keys) {
    if (!Object.hasOwn(grouped1, key)) {
      grouped1[key] = grouped2[key];
    } else {
      grouped1[key] = grouped1[key].concat(grouped2[key]);
    }
  }
}

function addPlayerToList(key) {
  playerId++;
  listedPlayers.push({
    id: playerId,
    name: key.toString(),
    currentDamage: 0,
    class: "unknown_class",
  });
}

function addDamageToPlayer(playerIndex, skillList) {
  const newDamage = skillList.reduce(
    (acc, curr) => acc + Number(curr.value),
    0
  );
  listedPlayers[playerIndex].currentDamage += newDamage;
}

function findPlayerIndex(key) {
  return listedPlayers.findIndex((player) => player.name === key.toString());
}

function updateDpsList() {
  dpsMeterContainer.innerHTML = "";
  listedPlayers.sort((a, b) => b.currentDamage - a.currentDamage);
  for (const player of listedPlayers) {
    createPlayerElement(player);
  }
}

function definePlayerClass(playerIndex, skillList) {
  for (const skill of skillList) {
    switch (skill.type) {
      case "auto_attack":
        break;
      case "dmg_unknown":
        listedPlayers[playerIndex].class = "unknown";
        break;
      case "dmg_skill":
        const skillExists = allSkills.hasOwnProperty(skill.name);
        if (!skillExists) {
          break;
        }
        listedPlayers[playerIndex].class = allSkills[skill.name];
        break;
    }
  }
}

function createPlayerElement(player) {
  const playerElement = document.createElement("div");
  const playerClass = document.createElement("div");
  const playerName = document.createElement("div");
  const playerNameSpan = document.createElement("span");
  const playerDamage = document.createElement("div");

  playerElement.className = "player-element overflow-autoscroll-parent";
  playerElement.id = `player-id-${player.id}`;
  playerClass.className = `player-class ${player.class}`;
  playerClass.innerHTML = `<img src="images/${player.class}.png">`;
  playerName.className = "player-name";
  playerNameSpan.className = "overflow-autoscroll";
  playerNameSpan.innerText = player.name;
  playerName.append(playerNameSpan);
  playerDamage.className = "player-damage";
  playerDamage.innerText = player.currentDamage.toLocaleString("en-US");

  playerElement.append(playerClass, playerName, playerDamage);
  dpsMeterContainer.append(playerElement);

  const playerNameIsOverflowing =
    playerElement.offsetWidth !== playerNameSpan.offsetWidth;

  if (playerNameIsOverflowing) {
    addAutoScroll(playerElement, playerNameSpan);
  }
}

const resetDpsBtn = document.querySelector(".reset-button");
resetDpsBtn.addEventListener("click", () => {
  processedData = [];
  listedPlayers = [];
  playerId = 0;
  dpsMeterContainer.innerHTML = "";
});
