const closeAppBtn = document.querySelector('.close-app-button')
closeAppBtn.addEventListener('click', () => {
  window.close()
})

const minimizeAppBtn = document.querySelector('.minimize-app-button')
minimizeAppBtn.addEventListener('click', () => {
  window.bridge.send("minimize", true)
})
