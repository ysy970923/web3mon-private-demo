import { JoyStick } from './joystick'
import { ws } from '../network/websocket'
import { global_position } from '../js/index'
import { transferMapTo } from '../data/map'
import {
  checkForCharacterCollision,
  rectangularCollision,
} from '../utils/checkCollision'
import { boundaries, movables, characters } from '../js/index'
import { users, myID } from '../user/user'

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
  if (
    users[myID].map === 'MAIN' &&
    global_position().x < 2200 &&
    global_position().x > 2150 &&
    global_position().y > 650 &&
    global_position().y < 700
  ) {
    console.log('테스트 맵으로 이동합니다.')
    transferMapTo('TEST')
  } else if (
    users[myID].map === 'TEST' &&
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

export function moveToXDirection(moving, direction, num = 1, passedTime) {
  const plusOrNot = (direction === 'up') | (direction === 'left') ? 1 : -1
  const isX = (direction === 'left') | (direction === 'right') ? 1 : 0
  const isY = (direction === 'up') | (direction === 'down') ? 1 : 0

  const speed = num * passedTime / 5

  users[myID].setMoving(true)
  switch (direction) {
    case 'w':
      break

    default:
      break
  }

  users[myID].setDirection(direction)

  checkForCharacterCollision({
    characters,
    player: users[myID],
    characterOffset: {
      x: speed * plusOrNot * isX,
      y: speed * plusOrNot * isY,
    },
  })

  for (let i = 0; i < boundaries.length; i++) {
    const boundary = boundaries[i]
    if (
      rectangularCollision({
        rectangle1: users[myID],
        rectangle2: {
          ...boundary,
          position: {
            x: boundary.position.x + speed * plusOrNot * isX,
            y: boundary.position.y + speed * plusOrNot * isY,
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
      movable.position.x += speed * plusOrNot * isX
      movable.position.y += speed * plusOrNot * isY
    })
  if (moving)
    for (const key in users) {
      if (key !== myID)
        users[key].setPosition({
          x: users[key].position.x + speed * plusOrNot * isX,
          y: users[key].position.y + speed * plusOrNot * isY,
        })
    }
}

export function moveToPosition(x, y) {
  movables.forEach((movable) => {
    movable.position.x += 3 * x
    movable.position.y += 3 * y
  })
  for (const key in users) {
    if (key !== myID)
      users[key].setPosition({
        x: users[key].position.x + 3 * x,
        y: users[key].position.y + 3 * y,
      })
  }
}
var previousAnimate = false
export function startMoveSender() {
  setInterval(() => {
    if (users[myID].moving === true) {
      moveUser(global_position())
      previousAnimate = users[myID].moving
    } else if (previousAnimate === true) {
      stopUser(global_position())
      previousAnimate = false
    }
  }, 50)
}
