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

  playerElement.className = `player-element player-${player.class} overflow-autoscroll-parent`;
  playerElement.id = `player-id-${player.id}`;
  playerClass.className = "player-class";
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

  if (activeClassFilter !== "none" && activeClassFilter !== player.class) {
    playerElement.classList.add("hidden");
  }
}

const resetDpsBtn = document.querySelector(".reset-button");
resetDpsBtn.addEventListener("click", () => {
  processedData = [];
  listedPlayers = [];
  playerId = 0;
  dpsMeterContainer.innerHTML = "";
});

let filterMenuIsOpen = false;
let activeClassFilter = "none";

const filterClassBtn = document.querySelector(".filter-label");
const filterClassOptions = document.querySelector(".filter-class-options");
const filterClassLabelImg = document.querySelector(
  ".filter-label > .filter-class-img"
);
const filterClassChildImg = filterClassLabelImg.children[0];
const filterClassName = document.querySelector(
  ".filter-label > .filter-class-name"
);
const filterClassRemoveBtn = document.querySelector(".filter-class-remove");

function openFilterClassMenu() {
  filterClassOptions.classList.add("open");
  filterMenuIsOpen = true;
  hideOnClickOutside(filterClassOptions);
}

function closeFilterClassMenu() {
  filterClassOptions.classList.remove("open");
  filterMenuIsOpen = false;
  controller.abort();
}

filterClassBtn.addEventListener("click", () => {
  /* console.log("%c##########################################", "color: red");
  console.log(
    "IsOpen before handling: " + `%c${filterMenuIsOpen}`,
    `color: ${filterMenuIsOpen ? "lime" : "#dd01dd"}`
  ); */
  if (filterMenuIsOpen) {
    closeFilterClassMenu();
  } else {
    openFilterClassMenu();
  }
  /* console.log(
    "IsOpen after handling: " + `%c${filterMenuIsOpen}`,
    `color: ${filterMenuIsOpen ? "lime" : "#dd01dd"}`
  ); */
});

document.querySelectorAll(".filter-class-option").forEach((option) => {
  option.addEventListener("click", () => {
    closeFilterClassMenu();
    filterDpsByClass(option.classList[1], option.innerText);
  });
});

function filterDpsByClass(playerClass, classText) {
  document.querySelectorAll(".player-element").forEach((playerElement) => {
    if (playerElement.classList.contains(`player-${playerClass}`)) {
      playerElement.classList.remove("hidden");
    } else {
      playerElement.classList.add("hidden");
    }
  });
  activeClassFilter = playerClass;
  filterClassLabelImg.classList.remove("none");
  filterClassChildImg.attributes.src.value = `images/${playerClass}.png`;
  filterClassName.innerText = classText.trim();
  filterClassRemoveBtn.style.display = "flex";
}

filterClassRemoveBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  if (filterMenuIsOpen) {
    closeFilterClassMenu();
  }
  removeClassFilter();
});

function removeClassFilter() {
  closeFilterClassMenu();
  activeClassFilter = "none";
  filterClassRemoveBtn.style.display = "none";
  filterClassName.innerText = "Filter by class";
  filterClassChildImg.attributes.src.value = "svgs/filter.svg";
  filterClassLabelImg.classList.add("none");

  document.querySelectorAll(".player-element").forEach((playerElement) => {
    playerElement.classList.remove("hidden");
  });
}

/* let outsideClickListener; */
let controller;

function hideOnClickOutside(element) {
  /* console.log("hi!"); */
  const outsideClickListener = (event) => {
    if (
      event.target.contains(filterClassName) ||
      event.target.contains(filterClassLabelImg) ||
      event.target.contains(filterClassRemoveBtn)
    ) {
      event.stopPropagation();
      /* console.log("clicked on label"); */
    }

    if (!element.contains(event.target)) {
      closeFilterClassMenu();
      /* console.log("clicked outside!"); */
    }
  };

  controller = new AbortController();
  document.addEventListener("click", outsideClickListener, {
    capture: true,
    signal: controller.signal,
  });
}

// MENU CLOSED
// No filter applied, click label -> open menu
// Filter applied, click label -> open menu
// Filter applied, click X -> remove filter

// MENU OPENED
// No filter applied, click label -> close menu
// Filter applied, click label -> close menu and keep the filter
// Filter applied, click X -> remove filter, close menu, show ALL player elements
// Filter applied or not, click option ->  apply filter, close menu, show selected class' player elements and hide others
