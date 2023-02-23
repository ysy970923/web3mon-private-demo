import { joyToKey } from './control/move'
import { stopAllPlay } from './js/index'
import { keys, lastKey } from './control/move'
import { sendPosition } from './control/move'
import { moveToXDirection } from './control/move'
import { battle } from './battle/battleClient'
import { player, users } from './user/user'
import { background, foreground } from './control/map'
import { setRenderables, setMovables, renderables } from './js/renderables'

export const npcId = '250'

let previousTime

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

  background.draw()

  for (var key in users) {
    users[key].draw()
  }
  //   foreground.draw()

  // NPC가 말하는거
  npcTalk(animationId)

  joyToKey()

  if (battle.started) return

  // 만약 채팅 중이라면 움직이지 않는다.
  if (document.getElementById('chatForm').style.display !== 'none') return

  // 아래부터는 나의 이동
  var newTime = performance.now()
  var passedTime = newTime - previousTime
  previousTime = newTime

  for (var key in users) {
    users[key].draw(passedTime)
  }
  if (stopAllPlay) return

  player.setMoving(false)
  
  if (keys.w.pressed && lastKey === 'w') {
    moveToXDirection('up', 1, passedTime)
  } else if (keys.a.pressed && lastKey === 'a') {
    moveToXDirection('left', 1, passedTime)
  } else if (keys.s.pressed && lastKey === 's') {
    moveToXDirection('down', 1, passedTime)
  } else if (keys.d.pressed && lastKey === 'd') {
    moveToXDirection('right', 1, passedTime)
  }
  sendPosition(player.getGlobalPosition())
}
