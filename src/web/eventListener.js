import { canva, renderables } from '../js/index'
import { users, player } from '../user/user'

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
  for (const key in users) {
    users[key].setPosition({
      x: users[key].position.x + delta_x,
      y: users[key].position.y + delta_y,
    })
  }
}
