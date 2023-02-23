import { login } from '../user/logIn'
import * as nearAPI from 'near-api-js'
import { findMyNFT } from '../user/findNFT'
import { wallet } from '../wallet/multi-wallet'
import { player } from '../user/user'

function addBtnClickEvent(btnID, func) {
  document.getElementById(btnID).addEventListener('click', func)
}

addBtnClickEvent('closeResultBtn', (e) => {
  document.getElementById('battleResultCard').style.display = 'none'
})

addBtnClickEvent('find_my_nft', (e) => {
  findMyNFT()
})

addBtnClickEvent('joinGame', (e) => {
  login()
})

addBtnClickEvent('start_login_button', (e) => {
  wallet.signIn()
})

addBtnClickEvent('sign_out', (e) => {
  wallet.signOut()
})

addBtnClickEvent('readyButton', (e) => {
  player.changeBattleReadyState()
  if (player.readyForBattle)
    document.getElementById('readyButton').innerHTML =
      'Cancel Ready <span class="bg" />'
  else
    document.getElementById('readyButton').innerHTML =
      'Get Ready <span class="bg" />'
})

const guideBtns = document.getElementsByClassName('guideBtn')
for (let i = 0; i < guideBtns.length; i++) {
  guideBtns.item(i).addEventListener('click', (e) => {
    const ee = document.getElementById('guideContainer')
    ee.scrollTop = 360 * i
  })
}
