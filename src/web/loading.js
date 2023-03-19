import { player } from "../js/global"

export function startLoadingScreen() {
    document.querySelector('#loading_screen').style.display = 'block'
    document.querySelector('#loading_screen_gif').style.display = 'block'
}

export function endLoadingScreen() {
    setTimeout(() => {
        document.querySelector('#loading_screen').style.display = 'none'
        document.querySelector('#loading_screen_gif').style.display = 'none'
        player.setDirection('down')
    }, 1000)
}