import { joyToKey } from './control/move'
import { stopAllPlay } from './js/index'
import { sendPosition } from './control/move'
import { movePlayer } from './control/move'
import { battle } from './battle/battleClient'
import { fixedObjects, player, users } from './js/global'
import { background } from './js/global'

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

  var ctx = canvas.getContext("2d");
  ctx.fillStyle = 'rgb(41,46,104)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  background.draw()

  //   foreground.draw()

  // NPC가 말하는거
  npcTalk(animationId)

  joyToKey()

  if (battle.playing) return

  // 아래부터는 나의 이동
  var newTime = performance.now()
  var passedTime = newTime - previousTime
  previousTime = newTime

  for (var key in fixedObjects) {
    fixedObjects[key].draw(passedTime)
  }

  for (var key in users) {
    users[key].draw(passedTime)
  }

  // 만약 채팅 중이라면 움직이지 않는다.
  if (document.getElementById('chatForm').style.display !== 'none') return

  if (stopAllPlay) return

  player.setMoving(false)
  movePlayer(1, passedTime)

  sendPosition(player.position)
}
