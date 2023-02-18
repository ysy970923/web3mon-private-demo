import { Sprite } from '../object/Sprite'
import { ws } from '../network/websocket'
import { characters, setMovables, setRenderables } from '../js/index'
import { moveToPosition, moveToXDirection } from './move'
import { player } from '../user/user'

const mainBackgroundImage = new Image()
mainBackgroundImage.src = '../img/battleMap.png'

const foregroundImage = new Image()
foregroundImage.src = '../img/battleMap.png'

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
  // map UI 자체 변경 -> renderables, movables 가 바뀌는 것
  // map에 존재하는 유저들 변경
  player.map = toMap
  console.log(player.map)

  showMapLoading()

  if (toMap === MAP.TEST) {
    document.getElementById('map_identifier').innerText =
      'BATTLE map : you can fight here!'

    document.getElementById('readyButtonContainer').style.display = 'block'

    var newBackgroundImage = new Image()
    newBackgroundImage.src = '../img/Pellet Town.png'

    background.setImage(newBackgroundImage)

    background.position = {
      x: offset.x,
      y: offset.y,
    }

    setRenderables([
      background,
      ...characters,
      player,
      // foreground,
    ])

    setMovables([
      background,
      ...characters,
      //   foreground,
    ])

    // moveToXDirection(true, 'up', 20)

    const body = {
      MapTransfer: {
        from: 'MAIN',
        to: 'TEST',
      },
    }
    // moveToPosition(340, -240)

    const msg = JSON.stringify(body)
    ws.send(msg)
  } else if (toMap === MAP.MAIN) {
    document.getElementById('map_identifier').innerText =
      'MAIN map : you cannot fight here!'
    
    document.getElementById('readyButtonContainer').style.display = 'none'

    var newBackgroundImage = new Image()
    newBackgroundImage.src = '../img/battleMap.png'

    background.setImage(newBackgroundImage)

    background.position = {
      x: offset.x,
      y: offset.y,
    }

    const body = {
      MapTransfer: {
        from: 'TEST',
        to: 'MAIN',
      },
    }

    setRenderables([
      background,
      ...characters,
      player,
      //   foreground,
    ])

    setMovables([
      background,
      ...characters,
      //   foreground,
    ])

    // moveToPosition(200, -100)

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
  }, 3000)
}
