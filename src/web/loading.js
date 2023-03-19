export function startLoadingScreen () {
    document.querySelector('#loading_screen').style.display = 'block'
    document.querySelector('#loading_screen_gif').style.display = 'block'
}

export function endLoadingScreen() {
    setTimeout(() => {
        document.querySelector('#loading_screen').style.display = 'none'
        document.querySelector('#loading_screen_gif').style.display = 'none'
    }, 1000)
}