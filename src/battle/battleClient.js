import { ethers } from 'ethers'
import { playerUrl, selectedClothId, tokenId } from '../user/logIn'
import {
  endBattle,
  initBattle,
  renderState,
} from './battleScene'
import { safe_send } from '../network/websocket'
import { selectedSkill, selectedDefenceSkills, myID, users, battleRenderedSprites } from '../js/global'
import { animateBattle, enterBattle } from './enterBattle'
import { wallet } from '../wallet/multi-wallet'
import { player } from '../js/global'
import { BetAmount } from '../data/betAmount'
import { closeCard, showCard } from '../web/battleCard'
import { getCurrentTime } from './utils'
import { startLoadingScreen } from '../web/loading'
import { ChannelHandler } from './channelHandler'
import { ChainHandler } from './chainHandler'
import { startGame } from '../user/user'
import { accounts } from '../data/accountsAndUrls'

const resume_data = {
  battle_data: {},
  jwt: '',
  playerUrl: '',
  token_id: '',
  clothId: '',
  opponentId: '',
}

class BattleClient {
  battle_id
  keyManager
  timerId
  my_index
  bet_amount
  playing
  opponent_id
  mode
  channelHandler
  chainHandler
  get_result_at
  selectedSkills

  constructor() {
    this.keyManager = ethers.Wallet.createRandom()
    this.channelHandler = new ChannelHandler()
    this.chainHandler = new ChainHandler()
    this.playing = false
    this.mode = 'channel'
    this.get_result_at = 0
    this.selectedSkills = {
      attacks: [],
      defences: [],
    }
  }

  // battle request to opponent
  async request(receiver_player_id) {
    safe_send({
      BattlePropose: {
        receiver_player_id: receiver_player_id,
        battle_pub_key: this.keyManager.publicKey.substring(2),
      },
    })
    this.opponent_id = receiver_player_id
  }

  // accept offered battle from opponent
  async accept(battle_id, proposer_player_id) {
    safe_send({
      BattleAccept: {
        battle_id: battle_id,
        battle_pub_key: this.keyManager.publicKey.substring(2),
      },
    })
    this.opponent_id = proposer_player_id
  }

  async refuse(battle_id) {
    safe_send({
      BattleReject: {
        battle_id: battle_id,
      },
    })
  }

  async sendChat(chat) {
    safe_send({
      WhisperChat: {
        content: chat,
        receiver_player_id: this.opponent_id,
      },
    })
    battleRenderedSprites['me'].showChat(chat)
  }

  async receiveChat(data) {
    if (data.send_player_id !== this.opponent_id) return
    const chat = data.content
    battleRenderedSprites['op'].showChat(chat)
  }

  async init(battle_id, next_turn_expired_at) {
    this.bet_amount = BetAmount[player.map]
    var battleInfo = await wallet.viewMethod({
      contractId: accounts.BATTLE_CONTRACT,
      method: 'get_battle',
      args: { battle_id: battle_id },
    })
    battleInfo.state.current_turn_expired_at = next_turn_expired_at

    if (battleInfo.player_pk[0] === this.keyManager.publicKey.substring(2)) {
      this.my_index = 0
    } else if (battleInfo.player_pk[1] === this.keyManager.publicKey.substring(2)) {
      this.my_index = 1
    } else {
      window.alert('Wrong Battle Made!')
      return false
    }

    if (battleInfo.players_account[this.my_index] !== wallet.getAccountId()) {
      window.alert('Wrong Battle Made!')
      return false
    }

    this.battle_id = battle_id
    this.channelHandler.init({
      battle_id: battle_id,
      op_pk: battleInfo.player_pk[1 - this.my_index],
      my_index: this.my_index,
      sk: this.keyManager.privateKey,
      manager_pk: battleInfo.manager_pk,
      battle_state: battleInfo.state
    })

    this.save()
    var yes = async () => {
      closeCard()
      startLoadingScreen()
      // moving funds to battle contract
      await wallet.callMethod({
        contractId: accounts.FT_CONTRACT,
        method: 'ft_transfer_call',
        args: {
          receiver_id: accounts.BATTLE_CONTRACT,
          amount: (this.bet_amount * 10000000).toString(),
          msg: JSON.stringify({
            battle_id: this.battle_id,
            player_index: this.my_index,
          }),
        },
        deposit: 1,
      })
      if (myID in users && this.opponent_id in users) {
        if (users[myID].made && users[this.opponent_id].made) {
          startGame()
        }
      }
      this.start()
    }

    showCard('Send Bet', '<p>Send Bet to Opponent</p>', yes)
  }

  save() {
    resume_data.battle_data = {
      battle_id: this.battle_id,
      sk: this.keyManager.privateKey,
      channelHandler: this.channelHandler.write(),
      chainHandler: this.chainHandler.write(),
      my_index: this.my_index,
      bet_amount: this.bet_amount,
      opponent_id: this.opponent_id,
      mode: this.mode,
      playing: this.playing,
      get_result_at: this.get_result_at,
    }
    resume_data.playerUrl = playerUrl
    resume_data.clothId = selectedClothId
    resume_data.token_id = tokenId
    resume_data.map = player.map
    sessionStorage.setItem('resume-data', JSON.stringify(resume_data))
  }

  start() {
    this.timerId = setInterval(() => this.timer(), 1000)
    this.playing = true
    document.getElementById('battle_banner').style.display = 'block'
    document.getElementById('atk_or_def').innerText = 'CHOOSE'
    document.querySelector(
      '#battle_sequence'
    ).innerText = `Round: ${this.channelHandler.battle_state.sequence}`

    if (this.channelHandler.battle_state.sequence === 0) {
      document.getElementById('skill_box_temp').style.display = 'block'
      document
        .getElementById('selectTypeBtn')
        .addEventListener('click', (e) => {
          if (this.selectedSkills.attacks.length !== 3 || this.selectedSkills.defences.length !== 3) {
            alert('You have to choose 3 skills each.')
            return
          }
          document.getElementById('skill_box_temp').style.display = 'none'
          // 내 스킬타입 확정
          this.selectedSkills.attacks.sort()
          this.selectedSkills.defences.sort()
          this.chooseSkills(this.selectedSkills)
        })
    } else {
      initBattle(this.opponent_id, this.channelHandler.battle_state, this.my_index)
      animateBattle()
    }
  }

  resume(msg) {
    this.battle_id = msg.battle_id
    this.my_index = msg.my_index
    this.bet_amount = msg.bet_amount
    this.opponent_id = msg.opponent_id
    this.channelHandler.resume(msg.channelHandler)
    this.chainHandler.resume(msg.chainHandler)
    this.keyManager = new ethers.Wallet(msg.sk)
    this.mode = msg.mode
    this.playing = msg.playing
    this.get_result_at = msg.get_result_at

    this.start()
  }

  getPlayerAction(index) {
    return this.battleState.player_skills[index][
      this.data.actions[index].action_index
    ]
  }

  selectSkillBox(skillBox, type) {
    var index = parseInt(skillBox.getAttribute('skill_index'))
    if (this.selectedSkills[type].includes(index)) {
      this.selectedSkills[type] = this.selectedSkills[type].filter(
        (skill) => skill !== index
      )
      skillBox.style.background = null
    } else {
      this.selectedSkills[type].push(index)
      skillBox.style.background = 'var(--primary-color01)'
    }
  }

  chooseSkills(skills) {
    if (this.mode === 'channel') {
      this.channelHandler.chooseSkills(skills)
    } else if (this.mode === 'chain') {
      this.chainHandler.chooseSkills(skills)
    }
  }

  chooseAction(action) {
    if (this.mode === 'channel') {
      this.channelHandler.chooseAction(action)
    } else if (this.mode === 'chain') {
      this.chainHandler.chooseAction(action)
    }
  }

  isMyAttack() {
    return this.battleState.attacker_index === this.my_index
  }

  timer() {
    var current_time = getCurrentTime()

    var handler
    if (this.mode === 'channel') {
      handler = this.channelHandler
    } else if (this.mode === 'chain') {
      handler = this.chainHandler
    }

    var result = handler.handle(current_time)
    switch (result) {
      case 'wait':
        break
      case 'ok':
        break
      case 'enter-game':
        enterBattle(handler.battle_state, this.my_index, this.opponent_id)
        break
      case 'render-state':
        renderState(handler.battle_state, handler.actions, this.my_index)
        break
      case 'time-over':
        this.close('LOSE')
        break
      case 'switch-to-chain':
        this.mode = 'chain'
        var send_at = this.channelHandler.battle_state.expires_at + 60
        this.chainHandler.init(this.battle_id, this.keyManager.privateKey, this.my_index, send_at, this.channelHandler.battle_state.player_skills[this.my_index], this.channelHandler.battle_state.sequence, this.channelHandler.battle_state.attacker_index)
        break
      case 'wait-finalize':
        document.getElementById('atk_or_def').innerText = 'Finalizing...'
        if (current_time > this.get_result_at) {
          this.get_result_at += 20
          wallet.viewMethod({
            contractId: accounts.BATTLE_CONTRACT,
            method: 'get_result',
            args: { battle_id: this.battle_id },
          }).then((res) => {
            switch (res) {
              case 'Player0Lose':
                if (this.my_index === 0) {
                  this.close('LOSE')
                } else {
                  this.close('WIN')
                }
                break
              case 'Player1Lose':
                if (this.my_index === 1) {
                  this.close('LOSE')
                }
                else {
                  this.close('WIN')
                }
                break
            }
          }).catch((e) => {
            console.log(e)
          })
        }
        break
    }
  }

  close(result) {
    clearInterval(this.timerId)
    sessionStorage.removeItem('resume-data')
    document.getElementById('battle_banner').style.display = 'none'
    this.playing = false
    endBattle(result, this.bet_amount)
  }
}

export const battle = new BattleClient()
