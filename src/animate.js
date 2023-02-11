import { joyToKey } from './control/move'
import { player, renderables, global_position, stopAllPlay } from './js/index'
import { others } from './network/websocket'
import { keys, lastKey } from './control/move'
import { moveUser, stopUser } from './control/move'
import { moveToXDirection } from './control/move'
import { battle } from './battle/battleClient'

export const npcId = '250'

const npcTalk = (animationId) => {
  // if (animationId % 600 < 200) others['250'].sprite.chat = 'Come in'
  // else if (animationId % 600 < 400) others['250'].sprite.chat = 'Battle Zone'
  // else others['250'].sprite.chat = 'Click Me!'
}
const canvas = document.querySelector('canvas')

export const animate = () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const animationId = window.requestAnimationFrame(animate)

  renderables.forEach((renderable) => {
    renderable.draw()
  })
  // NPC가 말하는거
  npcTalk(animationId)

  for (const key in others) {
    if (others[key].draw === true) others[key].sprite.draw()
  }

  joyToKey()

  let moving = true
  player.animate = false

  if (battle.started) return

  // 만약 채팅 중이라면 움직이지 않는다.
  if (document.getElementById('chatForm').style.display !== 'none') return

  // 아래부터는 나의 이동
  if (stopAllPlay) return
  if (keys.w.pressed && lastKey === 'w') {
    player.direction = 1
    moveToXDirection(moving, 'w', 1)
  } else if (keys.a.pressed && lastKey === 'a') {
    player.direction = 2
    moveToXDirection(moving, 'a', 1)
  } else if (keys.s.pressed && lastKey === 's') {
    player.direction = 3
    moveToXDirection(moving, 's', 1)
  } else if (keys.d.pressed && lastKey === 'd') {
    player.direction = 0
    moveToXDirection(moving, 'd', 1)
  }
}
// animate()
var previousAnimate = false

setInterval(() => {
  if (player.animate === true) {
    moveUser(global_position(), player.direction)
    previousAnimate = player.animate
  } else if (previousAnimate === true) {
    stopUser(global_position())
    previousAnimate = false
  }
}, 50)
