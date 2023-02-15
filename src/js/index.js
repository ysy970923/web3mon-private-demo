import { collisions } from '../data/collisions'
import { battleZonesData } from '../data/battleZones'
import { charactersMapData } from '../data/characters'
import { Boundary } from '../object/Boundary'
import { Sprite } from '../object/Sprite'
import { background, foreground } from '../data/map'
import { clickEvent } from '../battle/battleStart'
import { setNFTInfo, setPlayerUrl, collection, setClothId } from '../user/logIn'
import { battle } from '../battle/battleClient'
import { users, myID } from '../user/user'
import { connect } from '../network/websocket'

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
  let key = event.code
  let keyCode = event.keyCode
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

export const collisionsMap = []
for (let i = 0; i < collisions.length; i += 70) {
  collisionsMap.push(collisions.slice(i, 70 + i))
}

export const battleZonesMap = []
for (let i = 0; i < battleZonesData.length; i += 70) {
  battleZonesMap.push(battleZonesData.slice(i, 70 + i))
}

export const charactersMap = []
for (let i = 0; i < charactersMapData.length; i += 70) {
  charactersMap.push(charactersMapData.slice(i, 70 + i))
}

export let boundaries = []
export const setBoundaries = (bound) => {
  boundaries = bound
}
export const mainMapBoundaries = []
export const battleMapBoundaries = []

export const offset = {
  x: window.innerWidth / 2 - 3360 / 2,
  y: window.innerHeight / 2 - 1920 / 2,
}

collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025)
      mainMapBoundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
          type: 'collision',
        })
      )
  })
})

export const battleZones = []

// battleZonesMap.forEach((row, i) => {
//   row.forEach((symbol, j) => {
//     if (symbol === 1025)
//       battleZones.push(
//         new Boundary({
//           position: {
//             x: j * Boundary.width + offset.x,
//             y: i * Boundary.height + offset.y,
//           },
//           type: 'battle',
//         })
//       )
//   })
// })

export const characters = []

const villagerImg = new Image()
villagerImg.src = './../img/villager/Idle.png'

const oldManImg = new Image()
oldManImg.src = './../img/oldMan/Idle.png'

const kobugi = new Image()
kobugi.src = './../img/oldMan/kobugi.png'

charactersMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    // 1026 === villager
    if (symbol === 1026) {
      characters.push(
        new Sprite({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
          image: kobugi,
          frames: {
            max: 4,
            hold: 60,
          },
          scale: 3,
          animate: true,
        })
      )
    }
    // 1031 === oldMan
    else if (symbol === 1031) {
      characters.push(
        new Sprite({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
          image: kobugi,
          frames: {
            max: 4,
            hold: 60,
          },
          scale: 3,
        })
      )
    }

    if (symbol !== 0) {
      mainMapBoundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
        })
      )
    }
  })
})

setBoundaries(mainMapBoundaries)

export let movables = [
  background,
  ...boundaries,
  foreground,
  ...battleZones,
  ...characters,
]

export let renderables = [
  background,
  ...boundaries,
  ...battleZones,
  ...characters,
  foreground,
]

export const setMovables = (mova) => {
  movables = mova
}
export const setRenderables = (rend) => {
  renderables = rend
}

export function global_position() {
  return {
    x: users[myID].position.x - background.position.x,
    y: users[myID].position.y - background.position.y,
  }
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
    battle.resume(resume_data.battle_data)
    document.getElementById('resumePopUp').style = 'none'
  })
  document.getElementById('notResumeButton').addEventListener('click', (e) => {
    sessionStorage.removeItem('resume-data')
    document.getElementById('resumePopUp').style = 'none'
  })
}
