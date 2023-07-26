const closeBtn = document.querySelector('.close-btn')
closeBtn.addEventListener('click', () => {
  window.bridge.send("close", "settings")
})

const minimizeBtn = document.querySelector('.minimize-btn')
minimizeBtn.addEventListener('click', () => {
  window.bridge.send("minimize", "settings")
})
