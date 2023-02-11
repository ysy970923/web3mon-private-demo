import { JoyStick } from './joystick'
import { ws } from '../network/websocket'
import { player, global_position } from '../js/index'
import { transferMapTo } from '../data/map'
import {
  checkForCharacterCollision,
  rectangularCollision,
} from '../utils/checkCollision'
import { boundaries, movables, characters } from '../js/index'
import { others } from '../network/websocket'

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

export function moveUser(position, direction) {
  if (
    player.map === 'MAIN' &&
    global_position().x < 2200 &&
    global_position().x > 2150 &&
    global_position().y > 650 &&
    global_position().y < 700
  ) {
    console.log('테스트 맵으로 이동합니다.')
    transferMapTo('TEST')
  } else if (
    player.map === 'TEST' &&
    global_position().x > 1870 &&
    global_position().x < 1900 &&
    global_position().y < 730 &&
    global_position().y > 700
  ) {
    console.log('메인 맵으로 이동합니다.')
    transferMapTo('MAIN')
  } else {
    const body = {
      Move: {
        coordinate: [position.x, position.y],
      },
    }

    const msg = JSON.stringify(body)

    ws.send(msg)
  }
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

export function moveToXDirection(moving, direction, num = 1) {
  const plusOrNot = (direction === 'w') | (direction === 'a') ? 1 : -1
  const isX = (direction === 'a') | (direction === 'd') ? 1 : 0
  const isY = (direction === 'w') | (direction === 's') ? 1 : 0

  player.animate = true
  player.image =
    direction === 'w'
      ? player.sprites.up
      : direction === 'a'
      ? player.sprites.left
      : direction === 'd'
      ? player.sprites.right
      : player.sprites.down

  player.direction =
    direction === 'w' ? 0 : direction === 'a' ? 1 : direction === 'd' ? 3 : 2

  checkForCharacterCollision({
    characters,
    player,
    characterOffset: {
      x: 3 * num * plusOrNot * isX,
      y: 3 * num * plusOrNot * isY,
    },
  })

  for (let i = 0; i < boundaries.length; i++) {
    const boundary = boundaries[i]
    if (
      rectangularCollision({
        rectangle1: player,
        rectangle2: {
          ...boundary,
          position: {
            x: boundary.position.x + 3 * num * plusOrNot * isX,
            y: boundary.position.y + 3 * num * plusOrNot * isY,
          },
        },
      })
    ) {
      moving = false
      break
    }
  }

  if (moving)
    movables.forEach((movable) => {
      movable.position.x += 3 * num * plusOrNot * isX
      movable.position.y += 3 * num * plusOrNot * isY
    })
  if (moving)
    for (const key in others) {
      others[key].sprite.position.x += 3 * num * plusOrNot * isX
      others[key].sprite.position.y += 3 * num * plusOrNot * isY
    }
}

export function moveToPosition(x, y) {
  movables.forEach((movable) => {
    movable.position.x += 3 * x
    movable.position.y += 3 * y
  })
  for (const key in others) {
    others[key].sprite.position.x += 3 * x
    others[key].sprite.position.y += 3 * y
  }
}
