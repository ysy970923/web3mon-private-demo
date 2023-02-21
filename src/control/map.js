import { Sprite } from '../object/Sprite'
import { ws } from '../network/websocket'
import { characters } from '../js/index'
import { movePlayerToPosition } from './move'
import { player, users } from '../user/user'
import { setMovables, setRenderables } from '../js/renderables'

const mainBackgroundImage = new Image()
mainBackgroundImage.src = '../img/Island.png'

const foregroundImage = new Image()
foregroundImage.src = '../img/Island.png'

const MAP = {
  MAIN: 'MAIN',
  TEST: 'TEST',
}

export let background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
})
background.setImage(mainBackgroundImage)

export let foreground = new Sprite({
  position: {
    x: 0,
    y: 0,
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
    newBackgroundImage.src = '../img/waitMap/1.png'

    background.setImage(newBackgroundImage)

    background.position.x = player.position.x - 1720
    background.position.y = player.position.y - 850

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
    newBackgroundImage.src = '../img/Island.png'

    background.setImage(newBackgroundImage)

    background.position.x = player.position.x - 1500
    background.position.y = player.position.y - 350

    const body = {
      MapTransfer: {
        from: 'TEST',
        to: 'MAIN',
      },
    }

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
