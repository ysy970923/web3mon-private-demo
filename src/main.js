import './web/clickButtons'
import './user/logIn'
import './control/map'
import './js/index'
import './user/findNFT'
import './control/move'
import './web/eventListener'
import './chat/chatForm'
import './chat/sendChat'
import '../style/index.scss'
import '../style/modals.scss'
import '../style/game.scss'
import './battle/initialSetting'
import './web/popUp'

document
  .getElementById('nft_choose_container_back')
  .addEventListener('click', (e) => {
    document.getElementById('chain_containers').style.display = 'block'
    document.getElementById('nft_choose_container').style.display = 'none'
  })
