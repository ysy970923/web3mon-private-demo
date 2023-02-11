import { login } from './logIn'
import * as nearAPI from 'near-api-js'
import { findMyNFT } from '../js/utils'

function clickOutSideEvent1(e) {
  if (!document.getElementById('guidanceCard').contains(e.target)) {
    document.body.removeEventListener('click', clickOutSideEvent1, true)
    document.getElementById('guidanceCard').style.display = 'none'
  }
}

document.getElementById('guidanceButton').addEventListener('click', (e) => {
  document.getElementById('guidanceCard').style.display = 'block'
  document.body.addEventListener('click', clickOutSideEvent1, true)
})

document.getElementById('closeResultBtn').addEventListener('click', (e) => {
  document.getElementById('battleResultCard').style.display = 'none'
})

export function clickOutSideProfileEvent(e) {
  if (!document.getElementById('profileCard').contains(e.target)) {
    document.body.removeEventListener('click', clickOutSideProfileEvent, true)
    document.getElementById('profileCard').style.display = 'none'
  }
}

export function clickOutSideHistoryEvent(e) {
    if (!document.getElementById('battleHistoryLog').contains(e.target)) {
      document.body.removeEventListener('click', clickOutSideHistoryEvent, true)
      document.getElementById('battleHistoryLog').style.display = 'none'
    }
  }

export function clickOutSideBattleCardEvent(e) {
  if (
    !document.getElementById('acceptBattleCard').contains(e.target) &&
    document.getElementById('acceptBattleCard').style.display !== 'none'
  ) {
    document.body.removeEventListener('click', clickOutSideProfileEvent, true)
    document.getElementById('acceptBattleCard').style.display = 'none'
  }
  if (
    !document.getElementById('skill_box_temp').contains(e.target) &&
    document.getElementById('skill_box_temp').style.display !== 'none'
  ) {
    document.body.removeEventListener('click', clickOutSideProfileEvent, true)
    document.getElementById('skill_box_temp').style.display = 'none'
  }
}

document.getElementById('profileButton').addEventListener('click', (e) => {
  document.getElementById('profileCard').style.display = 'block'
  document.body.addEventListener('click', clickOutSideProfileEvent, true)
})

document.getElementById('battleHistoryButton').addEventListener('click', (e) => {
    document.getElementById('battleHistoryLog').style.display = 'block'
    document.body.addEventListener('click', clickOutSideHistoryEvent, true)
  })

document.getElementById('find_my_nft').addEventListener('click', async (e) => {
  console.log('로그 클릭')
  await findMyNFT()
})

document.getElementById('joinGame').addEventListener('click', (e) => {
  login()
})

const guideBtns = document.getElementsByClassName('guideBtn')
for (let i = 0; i < guideBtns.length; i++) {
  guideBtns.item(i).addEventListener('click', (e) => {
    const ee = document.getElementById('guideContainer')
    ee.scrollTop = 360 * i
  })
}

document.getElementById('start_login_button').addEventListener('click', (e) => {
  window.wallet.signIn()
})

document.getElementById('sign_out').addEventListener('click', (e) => {
  window.wallet.signOut()
})

const cols = document.querySelectorAll('.one_collection')
;[].forEach.call(cols, (col) => {
  col.addEventListener('click', (e) => {
    console.log('클클릭', e.currentTarget.value)
    window.collection = e.currentTarget.value

    // document.getElementById('chain_containers').style.display = 'none'
    // document.getElementById('nft_choose_container').style.display = 'flex'

    cols.forEach((doc) => {
      if (doc.value === window.collection) {
        doc.style.backgroundColor = 'rgba(250, 250, 250, 0.2)'
      } else {
        doc.style.backgroundColor = 'rgba(250, 250, 250, 0)'
      }
    })
  })
})
