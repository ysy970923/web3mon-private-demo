import './web/clickButtons'
import './web/logIn'
import './js/index'
import './js/utils'
import './control/move'
import './web/eventListener'
import './chat/chatForm'
import './chat/sendChat'
import '../style/index.scss'
import '../style/modals.scss'
import '../style/game.scss'
import './data/map'
import './web/initialSetting'

document
  .getElementById('nft_choose_container_back')
  .addEventListener('click', (e) => {
    document.getElementById('chain_containers').style.display = 'block'
    document.getElementById('nft_choose_container').style.display = 'none'
  })
