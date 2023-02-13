import { player, canvas } from '../js/index'
import { worker } from '../js/utils'
import { MultiWallet } from '../wallet/multi-wallet'
import { chosenCloth } from './initialSetting'
import { clothesList } from '../js/clothes'
import { wallet } from '../wallet/multi-wallet'

export let playerUrl
export let tokenId
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

export const login = async () => {
  var verified = await wallet.verifyOwner(collection, tokenId)
  if (!verified) {
    window.alert('Owner Verification Fail')
    // return
  }
  player.name = truncate(wallet.getAccountId(), 20)
  document.getElementById('chatOpenBtn').style.display = 'block'
  // document.getElementById('loginDiv').style.display = 'none'
  document.getElementById('profileName').innerHTML = window.name
  document.getElementById('profileNFT').innerHTML = player.name
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

  player.baseImage = new Image()

  worker.postMessage({
    url: playerUrl,
    leftSource: clothesList.find((doc) => doc.id === chosenCloth).left,
    rightSource: clothesList.find((doc) => doc.id === chosenCloth).right,
    downSource: clothesList.find((doc) => doc.id === chosenCloth).down,
    upSource: clothesList.find((doc) => doc.id === chosenCloth).up,
    contractAddress: collection,
    id: '-1',
  })

  turnToGameScreen()
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
