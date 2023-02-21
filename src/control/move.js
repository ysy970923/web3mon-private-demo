import { JoyStick } from './joystick'
import { ws } from '../network/websocket'
import { background, transferMapTo } from './map'
import {
  checkForCharacterCollision,
  userBoundaryCollision,
} from './checkCollision'
import { movables } from '../js/renderables'
import { users, myID, player } from '../user/user'
import { allowedBlocks } from '../data/collisions'
import { portals } from '../data/portals'

export let lastKey = ''

export let keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
}

window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'w':
      keys.w.pressed = true
      lastKey = 'w'
      break
    case 'a':
      keys.a.pressed = true
      lastKey = 'a'
      break

    case 's':
      keys.s.pressed = true
      lastKey = 's'
      break

    case 'd':
      keys.d.pressed = true
      lastKey = 'd'
      break
  }
})

window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'w':
      keys.w.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
    case 's':
      keys.s.pressed = false
      break
    case 'd':
      keys.d.pressed = false
      break
  }
})

var joy = new JoyStick('joyDiv')
var joyStickMoving = false
export function joyToKey() {
  var x = joy.GetX()
  var y = joy.GetY()
  var moving = false
  if (y > 45) {
    keys.w.pressed = true
    lastKey = 'w'
    moving = true
  } else if (y < -45) {
    keys.s.pressed = true
    lastKey = 's'
    moving = true
  } else if (x > 45) {
    keys.d.pressed = true
    lastKey = 'd'
    moving = true
  } else if (x < -45) {
    keys.a.pressed = true
    lastKey = 'a'
    moving = true
  } else if (joyStickMoving) {
    keys.w.pressed = false
    keys.a.pressed = false
    keys.s.pressed = false
    keys.d.pressed = false
    joyStickMoving = false
  }
  joyStickMoving = moving
}

export function moveUser(position) {
  const body = {
    Move: {
      coordinate: [position.x, position.y],
    },
  }

  const msg = JSON.stringify(body)
  ws.send(msg)
}

export function stopUser(position) {
  const body = {
    Move: {
      coordinate: [1, 1],
    },
  }

  const msg = JSON.stringify(body)

  ws.send(msg)
}

export function moveToXDirection(moving, direction, num = 1, passedTime) {
  const plusOrNot = (direction === 'up') | (direction === 'left') ? 1 : -1
  const isX = (direction === 'left') | (direction === 'right') ? 1 : 0
  const isY = (direction === 'up') | (direction === 'down') ? 1 : 0

  const speed = (num * passedTime) / 5

  player.setMoving(true)
  player.setDirection(direction)

  //   checkForCharacterCollision({
  //     characters,
  //     player: player.sprite,
  //     characterOffset: {
  //       x: speed * plusOrNot * isX,
  //       y: speed * plusOrNot * isY,
  //     },
  //   })

  var myBlock = player.getNextBlock({
    x: -1 * speed * plusOrNot * isX,
    y: -1 * speed * plusOrNot * isY,
  })
  if (allowedBlocks[player.map][myBlock[0]][myBlock[1]] === 'X') moving = false
  var portal = portals[player.map][myBlock[0]][myBlock[1]]
  if (portal !== 'X') {
    transferMapTo(portal)
    return
  }

  if (moving)
    movePlayerToPosition(speed * plusOrNot * isX, speed * plusOrNot * isY)
}

export function movePlayerToPosition(deltaX, deltaY) {
  background.position.x += deltaX
  background.position.y += deltaY

  for (var key in users)
    if (key !== myID) {
      var user = users[key]
      user.setPosition({
        x: user.position.x + deltaX,
        y: user.position.y + deltaY,
      })
    }
}

var previousAnimate = false
export function startMoveSender() {
  setInterval(() => {
    if (player.moving === true) {
      moveUser(player.getGlobalPosition())
      previousAnimate = player.moving
    } else if (previousAnimate === true) {
      stopUser(player.getGlobalPosition())
      previousAnimate = false
    }
  }, 15)
}
