import { canva, player, renderables } from '../js/index'
import { others } from '../network/websocket'

window.addEventListener('resize', onResizeEvent, true)

/**
 * When resize the Window, charaters should be moved
 */
function onResizeEvent() {
  canva.width = window.innerWidth
  canva.height = window.innerHeight
  var delta_x = canva.width / 2 - 192 / 4 / 2 - player.position.x
  var delta_y = canva.height / 2 - 68 / 2 - player.position.y
  renderables.forEach((renderable) => {
    renderable.position.x = renderable.position.x + delta_x
    renderable.position.y = renderable.position.y + delta_y
  })
  for (const key in others) {
    others[key].sprite.position.x = others[key].sprite.position.x + delta_x
    others[key].sprite.position.y = others[key].sprite.position.y + delta_y
  }
}
