import { canvas, stopAllPlay } from '../js/index'
import { battle } from './battleClient'
import { myID, users, player } from '../user/user'

/**
 * check whether click another player to battle.
 */
export function clickEvent() {
  canvas.addEventListener('click', (e) => {
    // need to be ready and not currently battling and in BATTLE map
    if (battle.started) return
    if (stopAllPlay) return
    // I should be ready
    // if (!player.readyForBattle) return
    for (const key in users) {
      if (key === myID) continue
      var x = e.offsetX - users[key].sprite.width / 2
      var y = e.offsetY - users[key].sprite.height / 2
      // 상대방을 클릭한지에 대한 체크
      if (
        Math.abs(users[key].position.x - x) < users[key].sprite.width / 2 &&
        Math.abs(users[key].position.y - y) < users[key].sprite.height / 2
      ) {
        // opponent should be ready
        // if (!users[key].readyForBattle) break
        setUpBattleCard('request', key, null)
        break
      }
    }
  })
}

export function setUpBattleCard(type, key, battle_id) {
  var title
  var text
  if (type === 'request') {
    title = 'Request Battle...'
    text = `Request To: ${users[key].name}`
  } else if (type === 'accept') {
    title = 'Incoming Battle...'
    text = `Request From: ${users[key].name}`
  }
  document.getElementById('battleCard').innerHTML = `
    <h2>${title}</h2>
    <div style="margin:5px">
        <img src=${users[key].nftUrl}/>
    </div>
    <p>${text}</p>
    <button id="yesBattleBtn" class="nes-btn is-success">YES</button>
    <button id="noBattleBtn" class="nes-btn is-error">NO</button>
    `

  document.getElementById('yesBattleBtn').addEventListener('click', (e) => {
    if (type === 'request') {
      battle.request(key)
    } else if (type === 'accept') {
      battle.accept(battle_id, key)
    }
    document.getElementById('battleCard').style.display = 'none'
    document.getElementById('battleCard').innerHTML = ''
    document.getElementById('wait_modal').style.display = 'flex'
  })

  document.getElementById('noBattleBtn').addEventListener('click', (e) => {
    if (type === 'request') {
    } else if (type === 'accept') {
      battle.refuse(battle_id)
    }
    document.getElementById('battleCard').style.display = 'none'
    document.getElementById('battleCard').innerHTML = ''
  })

  document.getElementById('noBattleBtn').addEventListener('click', (e) => {
    if (type === 'request') {
    } else if (type === 'accept') {
      battle.refuse(battle_id)
    }
    document.getElementById('battleCard').style.display = 'none'
    document.getElementById('battleCard').innerHTML = ''
  })

  document.getElementById('battleCard').style.display = 'block'
}