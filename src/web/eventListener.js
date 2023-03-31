import { adjustMapPosition } from '../control/map'
import { player } from '../js/global'

window.addEventListener('resize', onResizeEvent, true)

/**
 * When resize the Window, charaters should be moved
 */
function onResizeEvent() {
  if (player === undefined) return
  adjustMapPosition()
}
