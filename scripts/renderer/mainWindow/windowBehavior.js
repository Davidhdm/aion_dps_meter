const closeAppBtn = document.querySelector('.close-app-button')
closeAppBtn.addEventListener('click', () => {
  window.bridge.send("close-all")
})

const minimizeAppBtn = document.querySelector('.minimize-app-button')
minimizeAppBtn.addEventListener('click', () => {
  window.bridge.send("minimize-all")
})
minimizeAppBtn.addEventListener('auxclick', () => {
  window.bridge.send("minimize", "main")
})
