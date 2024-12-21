// src/scripts/SideBySide.js

document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('sbs-video')
  const playButton = document.querySelector('.play-button')

  if (!video || !playButton) {
    console.warn('Video or Play Button element not found.')
    return
  }

  // Hide controls initially
  video.controls = false

  // Play video on button click
  playButton.addEventListener('click', () => {
    if (video.paused) {
      video.play()
      playButton.style.opacity = '0'
      video.controls = true
    }
  })

  // Reset play button when video ends
  video.addEventListener('ended', () => {
    playButton.style.opacity = '1'
    video.controls = false
  })
})
