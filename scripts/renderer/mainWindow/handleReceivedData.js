import { groupBy, addAutoScroll } from "../helpers.js";
import allSkills from "./allSkills.js";

const dpsMeterContainer = document.querySelector(".dpsmeter-container");

window.bridge.receive("send-data", (data) => {
  try {
    let groupedByPlayer = groupBy(data, "player");
    mergeGroupedData(globalThis.processedData, groupedByPlayer);

    for (const key in groupedByPlayer) {
      let playerIndex = findPlayerIndex(key);
      // If player is NOT yet in the list
      if (playerIndex === -1) {
        addPlayerToList(key);
      }
      playerIndex = findPlayerIndex(key);
      const skillList = groupedByPlayer[key];

      if (globalThis.listedPlayers[playerIndex].class === "unknown_class") {
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
  globalThis.playerId++;
  globalThis.listedPlayers.push({
    id: globalThis.playerId,
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
  globalThis.listedPlayers[playerIndex].currentDamage += newDamage;
}

function findPlayerIndex(key) {
  return globalThis.listedPlayers.findIndex((player) => player.name === key.toString());
}

function updateDpsList() {
  dpsMeterContainer.innerHTML = "";
  globalThis.listedPlayers.sort((a, b) => b.currentDamage - a.currentDamage);
  for (const player of globalThis.listedPlayers) {
    createPlayerElement(player);
  }
}

function definePlayerClass(playerIndex, skillList) {
  for (const skill of skillList) {
    switch (skill.type) {
      case "auto_attack":
        break;
      case "dmg_unknown":
        globalThis.listedPlayers[playerIndex].class = "unknown";
        break;
      case "dmg_skill":
        const skillExists = allSkills.hasOwnProperty(skill.name);
        if (!skillExists) {
          break;
        }
        globalThis.listedPlayers[playerIndex].class = allSkills[skill.name];
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

  playerElement.className = `player-element player-${player.class} overflow-autoscroll-parent`;
  playerElement.id = `player-id-${player.id}`;
  playerClass.className = "player-class";
  playerClass.innerHTML = `<img src="../images/${player.class}.png">`;
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

  if (globalThis.activeClassFilter !== "none" && globalThis.activeClassFilter !== player.class) {
    playerElement.classList.add("hidden");
  }
}
