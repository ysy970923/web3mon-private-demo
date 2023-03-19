import { ethers } from 'ethers'
import { playerUrl, selectedClothId, tokenId } from '../user/logIn'
import {
  endBattle,
  initBattle,
  renderState,
  setBattleBackground,
  setUpNextSetting,
} from './battleScene'
import { safe_send } from '../network/websocket'
import { selectedSkill, selectedDefenceSkills } from './initialSetting'
import { BattleState } from './battleState'
import { animateBattle, enterBattle } from './enterBattle'
import { wallet } from '../wallet/multi-wallet'
import { SKILL_DESCRIPTIONS } from './skills'
import { player } from '../js/global'
import { betAmount } from '../data/betAmount'
import { closeSelectCard, showSelectCard } from '../web/selectCard'
import { signMessage, verifyMessage } from './utils'
import { startLoadingScreen } from '../web/loading'

export const BATTLE_CONTRACT = 'game.web3mon.testnet'
const FT_CONTRACT = 'usdc.web3mon.testnet' // USDC.e contract ID
const resume_data = {
  battle_data: {},
  jwt: '',
  playerUrl: '',
  token_id: '',
  clothId: '',
  opponentId: '',
}

function randInt() {
  // return Math.floor(Math.random() * 1000000)
  return 0
}

function getCurrentTime() {
  return Math.floor(Date.now() / 1000)
}

class BattleClient {
  data
  keyManager
  receiveQueue
  types
  mode
  timerId
  choseAction

  constructor() {
    this.keyManager = ethers.Wallet.createRandom()
    this.receiveQueue = []
    this.data = { status: { isOk: false, stage: 'reveal' } }
    this.started = false
    this.choseAction = false
  }

  // battle request to opponent
  async request(receiver_player_id) {
    this.data.request = true
    safe_send({
      BattlePropose: {
        receiver_player_id: receiver_player_id,
        battle_pub_key: this.keyManager.publicKey.substring(2),
      },
    })
    this.data.opponent_id = receiver_player_id
  }

  // accept offered battle from opponent
  async accept(battle_id, proposer_player_id) {
    this.data.request = false
    safe_send({
      BattleAccept: {
        battle_id: battle_id,
        battle_pub_key: this.keyManager.publicKey.substring(2),
      },
    })
    this.data.opponent_id = proposer_player_id
  }

  async refuse(battle_id) {
    safe_send({
      BattleReject: {
        battle_id: battle_id,
      },
    })
  }

  // start battle (move fund to battle contract)
  async setUp(msg) {

    var battleInfo = await wallet.viewMethod({
      contractId: BATTLE_CONTRACT,
      method: 'get_battle',
      args: { battle_id: msg.battle_id },
    })

    var my_index

    if (battleInfo.player_pk[0] === this.keyManager.publicKey.substring(2))
      my_index = 0
    else if (battleInfo.player_pk[1] === this.keyManager.publicKey.substring(2))
      my_index = 1
    else return false

    this.battleState = new BattleState(battleInfo.state)
    this.choseAction = false

    this.data = {
      battleId: msg.battle_id,
      opponent_id: this.data.opponent_id,
      mode: 'channel',
      oldBattleState: JSON.parse(JSON.stringify(this.battleState.write())),
      my_index: my_index,
      op_commit: '',
      op_commit_signature: '',
      status: { isOk: false, stage: 'commit' },
      actions: { 0: null, 1: null },
      manager_signature: '',
      player_signatures: ['', ''],
      my_pk: battleInfo.player_pk[my_index],
      op_pk: battleInfo.player_pk[1 - my_index],
      manager_pk: battleInfo.manager_pk,
      my_sk: this.keyManager.privateKey,
      player_init_lp: this.battleState.player_lp,
      pick_until_time: this.battleState.expires_at,
      battleBackground: 0,
      request: this.data.request,
      bet_amount: betAmount[player.map],
    }

    this.save()

    var yes = async () => {
      closeSelectCard()
      startLoadingScreen()
      // moving funds to battle contract
      await wallet.callMethod({
        contractId: FT_CONTRACT,
        method: 'ft_transfer_call',
        args: {
          receiver_id: BATTLE_CONTRACT,
          amount: betAmount[player.map],
          msg: JSON.stringify({
            battle_id: msg.battle_id,
            player_index: my_index,
          }),
        },
        deposit: 1,
      })

      this.start()
    }

    showSelectCard('Send Bet', 'Send Bet to Opponent', yes, () => { })
  }

  event(content) {
    console.log(JSON.stringify(content))
  }

  save() {
    resume_data.battle_data = this.data
    resume_data.battle_data.battle_state = this.battleState.write()
    resume_data.playerUrl = playerUrl
    resume_data.clothId = selectedClothId
    resume_data.token_id = tokenId
    resume_data.map = player.map
    sessionStorage.setItem('resume-data', JSON.stringify(resume_data))
  }

  start() {
    document.querySelector(
      '#battle_sequence'
    ).innerText = `Round: ${this.battleState.sequence}`
    this.timerId = setInterval(() => this.timer(), 1000)
    this.started = true
    this.keyManager = new ethers.Wallet(this.data.my_sk)
    document.getElementById('battle_banner').style.display = 'block'
    document.getElementById('atk_or_def').innerText = 'CHOOSE'
    if (this.data.mode === 'channel') {
      if (this.battleState.sequence === 0) {
        document.getElementById('skill_box_temp').style.display = 'block'
        document.getElementById('wait_modal').style.display = 'none'

        document
          .getElementById('selectTypeBtn')
          .addEventListener('click', (e) => {
            if (selectedSkill.length !== 3 || selectedDefenceSkills.length !== 3) {
              alert('You have to choose 3 skills each.')
              return
            }
            document.getElementById('skill_box_temp').style.display = 'none'
            // 내 스킬타입 확정
            selectedSkill.sort()
            selectedDefenceSkills.sort()
            this.chooseSkills({
              attacks: selectedSkill,
              defences: selectedDefenceSkills,
            })
          })
      } else {
        setBattleBackground(this.data.battleBackground)
        initBattle()
        animateBattle()
      }
    } else if (this.data.mode === 'chain') {
      setBattleBackground(this.data.battleBackground)
      initBattle()
      animateBattle()
      if (this.data.status.stage === 'commit') {
        this.data.status.stage = 'reveal'
      } else if (this.data.status.stage === 'reveal') {
        this.data.status.stage = 'wait-over'
      }
      this.data.status.isOk = true
    }
  }

  resume(data) {
    this.data = data
    this.battleState = new BattleState(data.battle_state)
    delete this.data['battle_state']
    this.start()
  }

  getPlayerAction(index) {
    return this.battleState.player_skills[index][
      this.data.actions[index].action_index
    ]
  }

  chooseSkills(skills) {
    if (this.choseAction) {
      // double click prevent
      return
    }
    this.choseAction = true

    this.data.actions[this.data.my_index] = {
      attacks: skills.attacks,
      defences: skills.defences,
      random_number: randInt(),
    }
    this.sendReady()
  }

  chooseSingleAction(action) {
    if (this.choseAction) {
      // double click prevent
      return
    }
    this.choseAction = true

    var skill = this.battleState.player_skills[this.data.my_index][action]
    if (
      !skill.check_availability(
        this.battleState.sequence + 1,
        this.data.my_index
      )
    ) {
      window.alert('skill is not allowed')
      this.choseAction = false
      return
    }
    this.data.actions[this.data.my_index] = {
      action_index: parseInt(action),
      random_number: randInt(),
    }
    this.sendCommit()
  }

  chooseMultipleAction(action) {
    if (this.choseAction) {
      // double click prevent
      return
    }
    this.choseAction = true

    var skill = this.battleState.player_skills[this.data.my_index][action]
    var sequence = 5
    for (var i = 0; i < 5; i++) {
      if (this.data.actions[this.data.my_index].action_index[i] === -1) {
        sequence = i
        break
      }
    }
    if (sequence === 5) {
      window.alert('no more skill to choose')
      return
    }
    if (
      !skill.check_availability(
        this.battleState.sequence + sequence,
        this.data.my_index
      )
    ) {
      window.alert('skill is not allowed')
      return
    }

    this.data.actions[this.data.my_index].action_index[sequence] =
      parseInt(action)

    var skillType =
      this.battleState.player_skills[this.data.my_index][action].type
    document.getElementById(
      `chosen-${sequence + 1}`
    ).innerHTML = `<img src="../../img/skillThumbnails/${SKILL_DESCRIPTIONS[skillType].img}" />`
  }

  isMyAttack() {
    return this.battleState.attacker_index === this.data.my_index
  }

  timer() {
    var current_time = getCurrentTime()
    var left_time = this.data.pick_until_time - current_time
    if (left_time > 0)
      document.getElementById('battle_left_time').innerText = `00:${left_time}`
    if (this.data.status.stage === 'wait-over') {
      if (this.data.pick_until_time < current_time) {
        this.getAndEndBattle()
      }
      return
    }
    if (left_time <= -5) {
      if (!this.choseAction) {
        this.close('LOSE')
        window.alert('Time is Over.')
        return
      } else {
        this.setUpChainHandler()
      }
    }

    if (!this.data.status.isOk) return

    if (this.data.mode === 'channel') this.onChannelHandler()
    else this.onChainHandler()
  }

  async onChannelHandler() {
    var msg = this.receiveQueue.shift()
    if (msg === undefined) return
    if (this.data.status.stage === 'commit') {
      this.data.status.isOk = false
      this.receiveCommit(msg)
      this.data.status.stage = 'reveal'
    } else if (this.data.status.stage === 'reveal') {
      this.data.status.isOk = false
      await this.receiveAction(msg)
      this.data.status.stage = 'state'
    } else if (this.data.status.stage === 'state') {
      this.data.status.isOk = false
      await this.receiveStateSignature(msg)
    }

    // resume_data.battle_data = this.data
    // resume_data.playerUrl = playerUrl
    // resume_data.token_id = tokenId
    // sessionStorage.setItem('resume-data', JSON.stringify(resume_data))
  }

  setUpChainHandler() {
    this.data.mode = 'chain'
    this.data.status.stage = 'choose'
    this.data.status.isOk = true
    this.data.pick_until_time = this.battleState.expires_at + 60 * 2
    this.data.actions = [
      {
        action_index: [-1, -1, -1, -1, -1],
        random_number: [
          randInt(),
          randInt(),
          randInt(),
          randInt(),
          randInt(),
        ],
      },
      {
        action_index: [-1, -1, -1, -1, -1],
        random_number: [
          randInt(),
          randInt(),
          randInt(),
          randInt(),
          randInt(),
        ],
      },
    ]

    var actionBoxes = []

    for (var i = 0; i < 5; i++) {
      var actionBox = document.createElement('div')
      actionBox.className = 'one_action_box'
      actionBox.id = `chosen-${i + 1}`
      actionBox.value = i
      actionBox.onclick = (e) => {
        console.log('remove actionBox')
        battle.data.actions[battle.data.my_index].action_index[
          e.currentTarget.value
        ] = -1
        for (var j = 0; j < 5; j++) {
          var action =
            battle.data.actions[battle.data.my_index].action_index[j]
          if (action !== -1) {
            var skillType =
              this.battleState.player_skills[this.data.my_index][action].type
            document.getElementById(
              `chosen-${j + 1}`
            ).innerHTML = `<img src="../../img/skillThumbnails/${SKILL_DESCRIPTIONS[skillType].img}" />`
          } else {
            document.getElementById(`chosen-${j + 1}`).innerHTML = ''
          }
        }
      }
      actionBoxes.push(actionBox)
    }

    var div = document.getElementById('action_box_container')
    actionBoxes.forEach((doc) => {
      div.append(doc)
      var arrow = document.createElement('span')
      arrow.className = 'right_arrow'
      arrow.innerHTML = '&#8680;'
      div.append(arrow)
    })

    document.getElementById('multipleActionCard').style.display = 'block'

  }

  onChainHandler() {
    if (this.data.status.stage === 'choose') {
      if (this.data.pick_until_time < getCurrentTime()) {
        this.data.status.stage = 'commit'
      }
    } else if (this.data.status.stage === 'commit') {
      this.data.status.isOk = false
      this.sendCommitOnChain()
    } else if (this.data.status.stage === 'reveal') {
      if (this.data.pick_until_time + 10 < getCurrentTime()) {
        this.data.status.isOk = false
        this.sendRevealOnChain()
      }
    }
  }

  async sendCommitOnChain() {
    var commit = await ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(
        JSON.stringify(this.data.actions[this.data.my_index])
      )
    )
    var a = new Uint8Array([this.battleState.sequence])
    var b = ethers.utils.arrayify(commit)
    var message = new Uint8Array(a.length + b.length)
    message.set(a)
    message.set(b, a.length)
    var signature = await this.keyManager.signMessage(message)

    this.save()
    window.alert('send commit to chain')

    await wallet.callMethod({
      contractId: BATTLE_CONTRACT,
      method: 'commit',
      args: {
        battle_id: this.data.battleId,
        player_index: this.data.my_index,
        commit: commit,
        sig: signature,
      },
    })
  }

  async sendRevealOnChain() {
    this.data.pick_until_time += 30
    this.save()
    window.alert('send reveal to chain')

    await wallet.callMethod({
      contractId: BATTLE_CONTRACT,
      method: 'reveal',
      args: {
        battle_id: this.data.battleId,
        player_index: this.data.my_index,
        actions: this.data.actions[this.data.my_index],
      },
    })
  }

  async sendReady() {
    var commit = await ethers.utils.id(
      JSON.stringify(this.data.actions[this.data.my_index])
    )
    var message = {
      hashed_message: commit.substring(2),
      sequence: this.battleState.sequence,
    }

    var signingKey = this.keyManager._signingKey()
    var signature = await signMessage(signingKey, JSON.stringify(message))

    safe_send({
      BattleCommitReady: {
        battle_id: this.data.battleId,
        signature: signature,
        message: message,
      },
    })

  }

  async sendCommit() {
    var commit = await ethers.utils.id(
      JSON.stringify(this.data.actions[this.data.my_index])
    )
    var message = {
      hashed_message: commit.substring(2),
      sequence: this.battleState.sequence,
    }

    var signingKey = this.keyManager._signingKey()
    var signature = await signMessage(signingKey, JSON.stringify(message))

    safe_send({
      BattleCommitAction: {
        battle_id: this.data.battleId,
        signature: signature,
        message: message,
      },
    })
  }

  // channel only
  async receiveCommit(commit) {
    console.log('receive commit')
    commit = JSON.parse(commit)
    console.log(commit)
    var message = {
      hashed_message: commit.hashed_message,
      sequence: this.battleState.sequence,
    }
    var match = await verifyMessage(
      this.data.op_pk,
      JSON.stringify(message),
      commit.signature
    )
    if (!match) {
      console.log('error receive commit')
      return
    }
    this.data.op_commit = commit.hashed_message
    this.data.op_commit_signature = commit.signature
    this.sendAction()
    return
  }

  async sendAction() {
    console.log('send action')
    var action = this.data.actions[this.data.my_index]
    if (this.battleState.sequence === 0)
      safe_send({
        BattleRevealReady: {
          battle_id: this.data.battleId,
          reveal_ready_message: action,
        },
      })
    else
      safe_send({
        BattleRevealAction: {
          battle_id: this.data.battleId,
          reveal_action_message: action,
        },
      })
  }

  // channel only
  async receiveAction(action) {
    console.log('receive action')
    action = JSON.parse(action)
    var commit = await ethers.utils.id(JSON.stringify(action))
    if (commit === this.data.op_commit) {
      this.data.actions[1 - this.data.my_index] = action
      this.sendState()
      return
    } else {
      // temporary
      this.data.actions[1 - this.data.my_index] = action
      this.sendState()
      return
    }
  }

  // channel only
  async sendState() {
    this.battleState.expires_at = this.data.pick_until_time
    if (this.battleState.sequence === 0)
      this.battleState.setPlayerSkills(this.data.actions)
    else if (!this.battleState.doNext(this.data.actions)) {
      console.log('problem computing state')
      return false
    }
    var battleState = this.battleState.write()

    var signingKey = this.keyManager._signingKey()
    var signature = await signMessage(signingKey, JSON.stringify(battleState))
    this.data.player_signatures[this.data.my_index] = signature

    safe_send({
      BattleConsensusState: {
        battle_id: this.data.battleId,
        state: battleState,
        consensus_signature: signature,
      },
    })

    if (this.battleState.winner !== undefined) {
      renderState(this.data, this.battleState)
      console.log('battle finished')
      this.data.pick_until_time = getCurrentTime() + 10
      document.getElementById('atk_or_def').innerText = 'Finalizing...'
      this.data.status.stage = 'wait-over'
    }
  }

  async getAndEndBattle() {
    console.log({
      contractId: BATTLE_CONTRACT,
      method: 'get_battle',
      args: { battle_id: this.data.battleId },
    })
    // var res = await wallet.viewMethod({
    //   contractId: BATTLE_CONTRACT,
    //   method: 'get_battle',
    //   args: { battle_id: this.data.battleId },
    // })
    // this.data.battleState = res.battle_state
    var res = {
      done: true,
      winner: 0,
    }
    if (res.done) {
      if (res.winner === this.data.my_index) {
        this.close('WIN')
      } else {
        this.close('LOSE')
      }
    } else {
      console.log('game not over yet')
    }
  }

  close(result) {
    clearInterval(this.timerId)
    sessionStorage.removeItem('resume-data')
    document.getElementById('battle_banner').style.display = 'none'
    endBattle(result)
  }

  // channel only
  async receiveStateSignature(msg) {
    console.log('receive state signature')
    msg = JSON.parse(msg)
    console.log(this.data.actions)
    console.log(msg)
    // var signature = '0x' + this.data.manager_signature
    // console.log(signature)
    // var expires_at = msg.expires_at

    // var message = await ethers.utils.keccak256(
    //   ethers.utils.toUtf8Bytes(JSON.stringify(battleState))
    // )
    // var addr = ethers.utils.verifyMessage(message, signature)
    // var manager_addr = ethers.utils.computeAddress('0x' + this.data.manager_pk)
    // if (addr === manager_addr) {
    // var match = await this.verifyMessage(
    //   this.data.manager_pk,
    //   JSON.stringify(this.battleState.write()),
    //   commit.signature
    // )
    var match = true
    if (match) {
      this.data.oldBattleState = JSON.parse(
        JSON.stringify(this.battleState.write())
      )
      this.choseAction = false
      if (this.battleState.sequence === 1) {
        enterBattle()
      } else {
        renderState(this.data, this.battleState)
      }
      this.data.player_signatures[1 - this.data.my_index] =
        msg.consensus_signature
      //   this.data.manager_signature = signature

      if (this.battleState.winner !== undefined) {
        console.log('battle finished')
        this.data.pick_until_time = getCurrentTime() + 10
        document.getElementById('atk_or_def').innerText = 'Finalizing...'
        this.data.status.stage = 'wait-over'
      } else {
        // this.data.pick_until_time = getCurrentTime() + 50
        setUpNextSetting()
        this.data.status.stage = 'commit'
      }
      this.save()
      return true
    } else {
      return false
    }
  }
}

export const battle = new BattleClient()
