import { fillBanner, renderState } from './battleScene'
import { safe_send } from '../network/websocket'
import { BattleState } from './battleState'
import { wallet } from '../wallet/multi-wallet'
import { getCurrentTime, hashMessage, randInt, signMessage, verifyMessage } from './utils'
import { ethers } from 'ethers'

const BATTLE_CONTRACT = 'game-v1.web3mon.testnet'
const FT_CONTRACT = 'usdc.web3mon.testnet' // USDC.e contract ID
const resume_data = {
  battle_data: {},
  jwt: '',
  playerUrl: '',
  token_id: '',
  clothId: '',
  opponentId: '',
}

export class ChannelHandler {
  battle_id
  key_manager
  receive_queue
  my_index
  op_pk
  manager_pk
  commits
  actions
  status
  chose_action
  battle_state
  manager_signature
  last_consensus_state
  next_turn_expired_at

  constructor() {
    this.battle_state = new BattleState()
  }

  init({ battle_id, sk, my_index, op_pk, manager_pk, battle_state }) {
    var msg = {
      battle_id: battle_id,
      sk: sk,
      my_index: my_index,
      op_pk: op_pk,
      manager_pk: manager_pk,
      battle_state: battle_state,
      receive_queue: [],
      op_commit: '',
      actions: {},
      status: { is_ok: false, stage: 'commit' },
      chose_action: false,
      manager_signature: '',
      last_consensus_state: '',
    }
    this.resume(msg)
  }

  write() {
    var msg = {
      battle_id: this.battle_id,
      my_index: this.my_index,
      op_pk: this.op_pk,
      manager_pk: this.manager_pk,
      op_commit: this.op_commit,
      actions: this.actions,
      status: this.status,
      chose_action: this.chose_action,
      battle_state: this.battle_state.write(),
      manager_signature: this.manager_signature,
      last_consensus_state: this.last_consensus_state,
      sk: this.key_manager.privateKey,
      receive_queue: this.receive_queue,
    }
    return msg
  }

  resume(msg) {
    this.battle_id = msg.battle_id
    this.my_index = msg.my_index
    this.op_pk = msg.op_pk
    this.manager_pk = msg.manager_pk
    this.op_commit = msg.op_commit
    this.actions = msg.actions
    this.status = msg.status
    this.chose_action = msg.chose_action
    this.battle_state.init(msg.battle_state)
    this.manager_signature = msg.manager_signature
    this.last_consensus_state = msg.last_consensus_state
    this.key_manager = new ethers.Wallet(msg.sk)
    this.receive_queue = msg.receive_queue
  }

  chooseSkills(skills) {
    if (this.chose_action) {
      // double click prevent
      return
    }
    this.chose_action = true

    this.actions[this.my_index] = {
      attacks: skills.attacks,
      defences: skills.defences,
      random_number: randInt(),
    }
    this.sendCommitReady()
  }

  chooseAction(action) {
    if (this.chose_action) {
      // double click prevent
      return
    }

    var skill = this.battle_state.player_skills[this.my_index][action]

    if (
      !skill.check_availability(
        this.battle_state.sequence + 1,
        this.my_index,
        this.battle_state.attacker_index,
        this.battle_state.sequence
      )
    ) {
      window.alert('skill is not allowed')
      return
    }

    this.chose_action = true

    this.actions[this.my_index] = {
      action_index: parseInt(action),
      random_number: randInt(),
    }
    this.sendCommitAction()
  }



  handle(current_time) {
    if (this.battle_state.winner !== undefined) {
      return 'wait-finalize'
    }

    var consensus_time_left = this.battle_state.expires_at - current_time
    var pick_time_left = consensus_time_left - 10

    if (pick_time_left < 0) {
      if (!this.chose_action) {
        return 'time-over'
      }
    }

    if (consensus_time_left < 0) {
      return 'switch-to-chain'
    }

    var is_my_attack = this.battle_state.attacker_index === this.my_index
    fillBanner(is_my_attack, this.battle_state.sequence, pick_time_left)

    if (!this.status.is_ok) return
    var msg = this.receive_queue.shift()
    if (msg === undefined) return
    console.log(msg)
    console.log(this.status.stage)

    if (msg === 'next') {
      if (this.status.stage === 'commit') {
        this.status.stage = 'reveal'
      } else if (this.status.stage === 'reveal') {
        this.status.stage = 'state'
      } else if (this.status.stage === 'state') {
        this.status.stage = 'commit'
      }
      return
    }

    if (this.status.stage === 'commit') {
      this.status.is_ok = false
      this.receiveCommit(msg)
    } else if (this.status.stage === 'reveal') {
      this.status.is_ok = false
      this.receiveReveal(msg)
    } else if (this.status.stage === 'state') {
      if (this.receiveStateSignature(msg)) {
        this.status.is_ok = false
        var is_my_attack = this.battle_state.attacker_index === this.my_index
        if (this.battle_state.sequence === 1) {
          return 'enter-game'
        } else {
          return 'render-state'
        }
      }
    }
    return 'ok'

    // resume_data.battle_data = this.data
    // resume_data.playerUrl = playerUrl
    // resume_data.token_id = tokenId
    // sessionStorage.setItem('resume-data', JSON.stringify(resume_data))
  }

  sendCommitReady() {
    var hashed_message = hashMessage(JSON.stringify(this.actions[this.my_index]))

    var message = {
      hashed_message: hashed_message,
      sequence: this.battle_state.sequence,
    }

    var signingKey = this.key_manager._signingKey()
    var signature = signMessage(signingKey, JSON.stringify(message))

    safe_send({
      BattleCommitReady: {
        battle_id: this.battle_id,
        signature: signature,
        message: message,
      },
    })
  }

  sendCommitAction() {
    var hashed_message = hashMessage(JSON.stringify(this.actions[this.my_index]))

    var message = {
      hashed_message: hashed_message,
      sequence: this.battle_state.sequence,
    }

    var signingKey = this.key_manager._signingKey()
    var signature = signMessage(signingKey, JSON.stringify(message))

    safe_send({
      BattleCommitAction: {
        battle_id: this.battle_id,
        signature: signature,
        message: message,
      },
    })
  }

  // channel only
  receiveCommit(commit) {
    console.log('receive commit')
    commit = JSON.parse(commit)
    var message = {
      hashed_message: commit.hashed_message,
      sequence: this.battle_state.sequence,
    }
    var match = verifyMessage(
      this.op_pk,
      JSON.stringify(message),
      commit.signature
    )
    if (!match) {
      console.log('error receive commit')
      return
    }
    this.op_commit = commit.hashed_message
    if (this.battle_state.sequence === 0) {
      this.sendRevealReady()
    } else {
      this.sendRevealAction()
    }
    return
  }

  sendRevealAction() {
    console.log('send action')
    var action = this.actions[this.my_index]
    safe_send({
      BattleRevealAction: {
        battle_id: this.battle_id,
        reveal_action_message: action,
      },
    })
  }

  sendRevealReady() {
    console.log('send action')
    var action = this.actions[this.my_index]
    safe_send({
      BattleRevealReady: {
        battle_id: this.battle_id,
        reveal_ready_message: action,
      },
    })
  }

  // channel only
  receiveReveal(action) {
    console.log('receive reveal')
    console.log(action)
    action = JSON.parse(action)
    var commit = hashMessage(JSON.stringify(action))
    if (commit === this.op_commit) {
      this.actions[1 - this.my_index] = action
      this.sendState()
      return
    } else {
      // temporary
      this.actions[1 - this.my_index] = action
      this.sendState()
      return
    }
  }

  // channel only
  sendState() {
    if (this.battle_state.sequence === 0)
      this.battle_state.setPlayerSkills(this.actions)
    else if (!this.battle_state.do_next(this.actions)) {
      console.log('problem computing state')
      return false
    }
    var battle_state = this.battle_state.write()

    var signingKey = this.key_manager._signingKey()
    var signature = signMessage(signingKey, JSON.stringify(battle_state))

    safe_send({
      BattleConsensusState: {
        battle_id: this.battle_id,
        state: battle_state,
        consensus_signature: signature,
      },
    })

    // battle is finished
    if (this.battle_state.winner !== undefined) {
      renderState(this.battle_state, this.actions, this.my_index)
      console.log('battle finished')
      document.getElementById('atk_or_def').innerText = 'Finalizing...'
      this.status.stage = 'wait-over'
    }
  }


  // channel only
  receiveStateSignature(msg) {
    console.log('receive state signature')
    msg = JSON.parse(msg)
    if (msg.type === 'ConsensusState') {
      return false
    }
    // var signature = '0x' + this.data.manager_signature
    // console.log(signature)
    // var expires_at = msg.expires_at

    // var message = await ethers.utils.keccak256(
    //   ethers.utils.toUtf8Bytes(JSON.stringify(battle_state))
    // )
    // var addr = ethers.utils.verifyMessage(message, signature)
    // var manager_addr = ethers.utils.computeAddress('0x' + this.data.manager_pk)
    // if (addr === manager_addr) {
    // var match = await this.verifyMessage(
    //   this.data.manager_pk,
    //   JSON.stringify(this.battle_state.write()),
    //   commit.signature
    // )
    var match = true
    if (match) {
      this.manager_signature = msg.manager_signature

      this.last_consensus_state = JSON.stringify(this.battle_state.write())
      this.next_turn_expired_at = msg.next_turn_expired_at
      this.battle_state.expires_at = this.next_turn_expired_at
      this.chose_action = false
      return true
    } else {
      return false
    }
  }
}