import { background, foreground } from '../control/map'
import { clickEvent } from '../battle/battleStart'
import { setNFTInfo, setPlayerUrl, collection, setClothId } from '../user/logIn'
import { battle } from '../battle/battleClient'
import { connect } from '../network/websocket'
import { selectedSkill } from '../battle/initialSetting'

// 최초로 지갑 연결
// connectWallets(nearAPI)

export let stopAllPlay = false
export const setStopAllPlay = (bol) => {
  stopAllPlay = bol
}

export const canvas = document.querySelector('canvas')
clickEvent()

const body = document.querySelector('body')

body.addEventListener('keydown', (event) => {
  if (document.getElementById('chatForm').style.display !== 'none') {
    return
  }
//   let key = event.code
//   let keyCode = event.keyCode
  //   if (key === 'Space' || keyCode === 32) {
  //     moveToXDirection(true, lastKey, 4)
  //     moveToXDirection(true, lastKey, 4)
  //     const time = setTimeout(() => {
  //       moveToXDirection(true, lastKey, 4)
  //       moveToXDirection(true, lastKey, 4)
  //       clearTimeout(time)
  //     }, 100)
  //     event.preventDefault()
  //   }
})

export const canva = canvas.getContext('2d')
canva.textAlign = 'center'

export const offset = {
  x: window.innerWidth / 2 - 3360 / 2,
  y: window.innerHeight / 2 - 1920 / 2,
}

export function local_position(position) {
  return {
    x: position.x + background.position.x,
    y: position.y + background.position.y,
  }
}

initalSetting()

function initalSetting() {
  document.getElementById('map_identifier').innerText =
    'MAIN map : you cannot fight here!'
}

// make other charaters or objects.
var resume_data = sessionStorage.getItem('resume-data')
if (resume_data !== null) {
  document.getElementById('resumePopUp').style.display = 'block'
  document.getElementById('resumeButton').addEventListener('click', (e) => {
    resume_data = JSON.parse(resume_data)
    setNFTInfo(resume_data.collection, resume_data.tokenId)
    setPlayerUrl(resume_data.playerUrl)
    setClothId(resume_data.clothId)
    connect()
    document.getElementById('resumePopUp').style = 'none'
  })
  document.getElementById('notResumeButton').addEventListener('click', (e) => {
    sessionStorage.removeItem('resume-data')
    document.getElementById('resumePopUp').style = 'none'
  })
}
