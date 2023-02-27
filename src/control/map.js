import { Sprite } from '../object/Sprite'
import { ws } from '../network/websocket'
import { characters, local_position } from '../js/index'
import { movePlayerToPosition } from './move'
import { player, users } from '../user/user'
import { setMovables, setRenderables } from '../js/renderables'

const mainBackgroundImage = new Image()
mainBackgroundImage.src = '../img/Island.png'

const foregroundImage = new Image()
foregroundImage.src = '../img/Island.png'

const MAP = {
  MAIN: 'MAIN',
  BATTLE0: 'BATTLE0',
  BATTLE1: 'BATTLE1',
  BATTLE2: 'BATTLE2',
  BATTLE3: 'BATTLE3',
  BATTLE4: 'BATTLE4',
  BATTLE5: 'BATTLE5',
  BATTLE6: 'BATTLE6',
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

export function adjustMapPosition() {
  var playerLocalPosition = local_position(player.position)
  var deltaX = window.innerWidth / 2 - playerLocalPosition.x
  var deltaY = window.innerHeight / 2 - playerLocalPosition.y
  background.position.x += deltaX
  background.position.y += deltaY
}

export function transferMapTo(toMap) {
  // map 이동의 효과 : 뭐가 있을까?
  // map UI 자체 변경 -> renderables, movables 가 바뀌는 것
  // map에 존재하는 유저들 변경

  showLoadingScreen()
  var newBackgroundImage = new Image()

  switch (toMap) {
    case MAP.MAIN:
      document.getElementById('map_identifier').innerText =
        'MAIN map : you cannot fight here!'

      document.getElementById('readyButtonContainer').style.display = 'none'

      newBackgroundImage.src = '../img/Island.png'

      player.setPosition({ x: 1500, y: 350 }, true)
      break

    case MAP.BATTLE0:
      newBackgroundImage.src = '../img/waitMap/1.png'

    case MAP.BATTLE1:
      newBackgroundImage.src = '../img/waitMap/2.png'

    case MAP.BATTLE2:
      newBackgroundImage.src = '../img/waitMap/3.png'

    case MAP.BATTLE3:
      newBackgroundImage.src = '../img/waitMap/4.png'

    case MAP.BATTLE4:
      newBackgroundImage.src = '../img/waitMap/1.png'

      document.getElementById('map_identifier').innerText =
        'BATTLE map : you can fight here!'

      document.getElementById('readyButtonContainer').style.display = 'block'

      player.setPosition({ x: 1720, y: 850 }, true)
      break
  }
  background.setImage(newBackgroundImage)
  adjustMapPosition()

  const body = {
    MapTransfer: {
      from: player.map,
      to: toMap,
    },
  }

  // moveToPosition(200, -100)

  console.log(player.map)
  const msg = JSON.stringify(body)
  ws.send(msg)
  player.map = toMap
}

export const showLoadingScreen = async () => {
  document.querySelector('#loading_screen').style.display = 'block'
  document.querySelector('#loading_screen_gif').style.display = 'block'
  setTimeout(() => {
    document.querySelector('#loading_screen').style.display = 'none'
    document.querySelector('#loading_screen_gif').style.display = 'none'
  }, 3000)
}
