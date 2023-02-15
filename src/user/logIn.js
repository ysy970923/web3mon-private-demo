import { player, canvas } from '../js/index'
import { MultiWallet } from '../wallet/multi-wallet'
import { chosenCloth } from '../web/initialSetting'
import { wallet } from '../wallet/multi-wallet'
import { users } from './user'
import { connect } from '../network/websocket'

export let playerUrl
export let tokenId
export let selectedClothId
export let collection

function truncate(input, length) {
  if (input.length > length) {
    return input.substring(0, length) + '...'
  }
  return input
}

export function setNFTInfo(nft_collection, nft_tokenId) {
  tokenId = nft_tokenId
  collection = nft_collection
}

export function setPlayerUrl(url) {
  playerUrl = url
}

export function setClothId(id) {
  selectedClothId = id
}

export const login = async () => {
  var verified = await wallet.verifyOwner(collection, tokenId)
  if (!verified) {
    window.alert('Owner Verification Fail')
    return
  }
  document.getElementById('chatOpenBtn').style.display = 'block'
  document.getElementById('profileImg').src = playerUrl
  if (wallet.selectedChain === 'near') {
    document.getElementById('parasUrl').addEventListener('click', (e) => {
      window
        .open(
          `https://paras.id/token/${window.contract.contractId}::${window.tokenId}/${window.tokenId}`,
          '_blank'
        )
        .focus()
    })
  }
  connect()
}

/**
 * 메인화면을 display:none 처리하고, 게임화면을 display:block 한다.
 */
export const turnToGameScreen = () => {
  document.getElementById('login_screen').style.display = 'none'
  document.getElementById('game_screen').style.display = 'block'
  document.querySelector('canvas').style.display = 'block'

  console.log('canva', canvas)
}

export const logout = () => {
  wallet.signOut()
  // reload page
  window.location.replace(window.location.origin + window.location.pathname)
}
