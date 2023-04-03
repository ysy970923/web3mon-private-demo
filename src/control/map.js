import { Sprite } from '../object/Sprite'
import { ws } from '../network/websocket'
import { characters, local_position } from '../js/index'
import { movePlayerToPosition } from './move'
import { background, fixedObjects, player, users } from '../js/global'
import { wallet } from '../wallet/multi-wallet'
import { endLoadingScreen, startLoadingScreen } from '../web/loading'
import { BetAmount } from '../data/betAmount'

const mainBackgroundImage = new Image()
mainBackgroundImage.src = '../img/Island.png'

const foregroundImage = new Image()
foregroundImage.src = '../img/Island.png'

const portalImage = new Image()
portalImage.src = '../img/portal.png'

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

  for (var key in fixedObjects) {
    fixedObjects[key].position.x += deltaX
    fixedObjects[key].position.y += deltaY
  }
}

function makePortal() {
  var portal = new Sprite({ position: local_position({ x: 1550, y: 600 }), frames: { max: 6, fps: 10 } })
  portal.setImage(portalImage)
  portal.animate = true
  portal.setScale(1.5)
  fixedObjects['portal'] = portal
}

export function transferMapTo(toMap, endLoadingInstantly = true) {
  // map 이동의 효과 : 뭐가 있을까?
  // map UI 자체 변경 -> renderables, movables 가 바뀌는 것
  // map에 존재하는 유저들 변경

  var newBackgroundImage = new Image()
  startLoadingScreen()

  switch (toMap) {
    case MAP.MAIN:
      document.getElementById('map_identifier').innerText =
        'MAIN map : you cannot fight here!'

      document.getElementById('readyButtonContainer').style.display = 'none'

      newBackgroundImage.src = '../img/Island.png'

      delete fixedObjects['portal']
      player.setPosition({ x: 1500, y: 350 }, true)
      break

    case MAP.BATTLE0:
      newBackgroundImage.src = '../img/waitMap/1.png'
      document.getElementById('map_identifier').innerText =
        `Game Size: ${BetAmount[MAP.BATTLE0]}$`

      document.getElementById('readyButtonContainer').style.display = 'block'
      makePortal()
      player.setPosition({ x: 1720, y: 850 }, true)
      break

    case MAP.BATTLE1:
      newBackgroundImage.src = '../img/waitMap/2.png'
      document.getElementById('map_identifier').innerText =
        `Game Size: ${BetAmount[MAP.BATTLE1]}$`

      document.getElementById('readyButtonContainer').style.display = 'block'
      makePortal()
      player.setPosition({ x: 1720, y: 850 }, true)

      break

    case MAP.BATTLE2:
      newBackgroundImage.src = '../img/waitMap/3.png'
      document.getElementById('map_identifier').innerText =
        `Game Size: ${BetAmount[MAP.BATTLE2]}$`

      document.getElementById('readyButtonContainer').style.display = 'block'
      makePortal()
      player.setPosition({ x: 1720, y: 850 }, true)

      break

    case MAP.BATTLE3:
      newBackgroundImage.src = '../img/waitMap/4.png'
      document.getElementById('map_identifier').innerText =
        `Game Size: ${BetAmount[MAP.BATTLE3]}$`

      document.getElementById('readyButtonContainer').style.display = 'block'
      makePortal()
      player.setPosition({ x: 1720, y: 850 }, true)

      break

    case MAP.BATTLE4:
      newBackgroundImage.src = '../img/waitMap/1.png'

      document.getElementById('map_identifier').innerText =
        `Game Size: ${BetAmount[MAP.BATTLE4]}$`

      document.getElementById('readyButtonContainer').style.display = 'block'
      makePortal()
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

  const msg = JSON.stringify(body)
  ws.send(msg)
  player.map = toMap

  if (endLoadingInstantly) {
    endLoadingScreen()
  }
}