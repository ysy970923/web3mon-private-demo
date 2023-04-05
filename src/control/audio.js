// music control
export function playMusic(id) {
    pauseMusic()
    var music = document.getElementById(id)
    music.play()   
}

// pause all music
function pauseMusic() {
    var music = document.getElementById('villageAudio')
    music.pause()
    var music = document.getElementById('battleAudio')
    music.pause()
    var music = document.getElementById('battleMapAudio')
    music.pause()
}