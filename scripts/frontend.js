import { groupBy } from './helpers.js'

let processedData = [];
let listedPlayers = []
let playerId = 0;

window.bridge.receive("sendData", (data) => {
  data.forEach(skillData => {
    processedData.push(skillData)
  });

  let groupedByPlayer = groupBy(processedData, 'player')
  console.log(groupedByPlayer)
  for (const key in groupedByPlayer) {
    // If player is NOT yet in the list
    const player = listedPlayers.filter(player => player.name === key.toString())

    if (player.length === 0) {
      addPlayerToList(key)
    }
    const currentPlayerId = player[0]?.id ?? playerId
    const currentDamage = document.querySelector(`#player-id-${currentPlayerId} .player-damage`)
    const addedDamage = groupedByPlayer[key].reduce((acc, curr) => acc + Number(curr.value), 0)
    currentDamage.innerText = addedDamage.toLocaleString('en-US')
  }
});

function addPlayerToList(key) {
  playerId++
  listedPlayers.push(
    {
      id: playerId,
      name: key.toString()
    }
  )
  createPlayerElement(key, playerId)
}

function createPlayerElement(key, playerId) {
  const dpsMeterContainer = document.querySelector('.dpsmeter-container')
  const playerElement = document.createElement('div');
  const playerClass = document.createElement('div')
  const playerName = document.createElement('div')
  const playerDamage = document.createElement('div')
  playerElement.className = 'player-element'
  playerElement.id = `player-id-${playerId}`
  playerClass.className = 'player-class'
  playerName.className = 'player-name'
  playerName.innerText = key
  playerDamage.className = 'player-damage'

  playerElement.append(playerClass, playerName, playerDamage)

  dpsMeterContainer.append(playerElement)
}



