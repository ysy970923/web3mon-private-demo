import { Sprite } from '../object/Sprite'
import {
  battleMapBoundaries,
  canvas,
  mainMapBoundaries,
  setBoundaries,
} from '../js/index'
import {
  mainBackgroundImage,
  foregroundImage,
} from '../js/load'
import { ws } from '../network/websocket'
import {
  boundaries,
  battleZones,
  characters,
  setMovables,
  setRenderables,
} from '../js/index'
import { moveToPosition, moveToXDirection } from '../control/move'
import { users, myID } from '../user/user'

const offset = {
  x: window.innerWidth / 2 - 3360 / 2,
  y: window.innerHeight / 2 - 1920 / 2,
}

const MAP = {
  MAIN: 'MAIN',
  TEST: 'TEST',
}

export let background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
})
background.setImage(mainBackgroundImage)

export let foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
})
foreground.setImage(foregroundImage)

export function transferMapTo(toMap) {
  // map 이동의 효과 : 뭐가 있을까?
  // map UI 자체 변경 -> renderables, movables, boundaries 가 바뀌는 것
  // map에 존재하는 유저들 변경
  users[myID].map = toMap

  showMapLoading()

  if (toMap === MAP.TEST) {
    document.getElementById('map_identifier').innerText =
      'BATTLE map : you can fight here!'

    showMapLoading()

    background.image.src = '../.././../img/battleMap.png'

    setBoundaries(battleMapBoundaries)

    setRenderables([
      background,
      ...boundaries,
      ...battleZones,
      ...characters,
      player,
      // foreground,
    ])

    setMovables([
      background,
      ...boundaries,
      ...battleZones,
      ...characters,
      foreground,
    ])

    moveToXDirection(true, 'up', 20)

    const body = {
      MapTransfer: {
        from: 'MAIN',
        to: 'TEST',
      },
    }
    moveToPosition(340, -240)

    const msg = JSON.stringify(body)
    ws.send(msg)
  } else if (toMap === MAP.MAIN) {
    document.getElementById('map_identifier').innerText =
      'MAIN map : you cannot fight here!'
    background.image.src = '../.././../img/Pellet Town.png'
    showMapLoading()

    const body = {
      MapTransfer: {
        from: 'TEST',
        to: 'MAIN',
      },
    }

    setBoundaries(mainMapBoundaries)

    setRenderables([
      background,
      ...boundaries,
      ...battleZones,
      ...characters,
      player,
      foreground,
    ])

    setMovables([
      ...boundaries,
      background,
      ...battleZones,
      ...characters,
      foreground,
    ])

    moveToPosition(200, -100)

    const msg = JSON.stringify(body)
    ws.send(msg)
  }
}

const showMapLoading = async () => {
  document.querySelector('#loading_screen').style.display = 'block'
  document.querySelector('#loading_screen_gif').style.display = 'block'
  setTimeout(() => {
    document.querySelector('#loading_screen').style.display = 'none'
    document.querySelector('#loading_screen_gif').style.display = 'none'
  }, 1000)
}
