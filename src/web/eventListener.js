import { adjustMapPosition } from '../control/map'
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
  adjustMapPosition()
}
