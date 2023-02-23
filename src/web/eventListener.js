import { movePlayerToPosition } from '../control/move'
import { canva } from '../js/index'
import { renderables } from '../js/renderables'
import { users, player, myID } from '../user/user'

window.addEventListener('resize', onResizeEvent, true)

/**
 * When resize the Window, charaters should be moved
 */
function onResizeEvent() {
  if (player === undefined) return
  canva.width = window.innerWidth
  canva.height = window.innerHeight
  var delta_x = canva.width / 2 - 192 / 4 / 2 - player.position.x
  var delta_y = canva.height / 2 - 68 / 2 - player.position.y
  player.setPosition({
    x: player.position.x + delta_x,
    y: player.position.y + delta_y,
  }, true)
  movePlayerToPosition(delta_x, delta_y)
}
