import { ethers } from 'ethers'
import { playerUrl, tokenId } from '../web/logIn'
import { renderState, setUpNextSetting } from './battleScene'
import { safe_send } from '../network/websocket'
import { selectedSkill, selectedDefenceSkills } from '../web/initialSetting'
import { BattleState } from './battleState'
import { addBattleSkillBox } from '../web/initialSetting'
import { enterBattle } from './enterBattle'

export const BATTLE_CONTRACT = 'game0.web3mon.testnet'
const FT_CONTRACT = 'usdc.web3mon.testnet' // USDC.e contract ID
const BET_AMOUNT = '10000000'
const resume_data = {
  battle_data: {},
  jwt: '',
  playerUrl: '',
  token_id: '',
  opponentId: '',
}
class BattleClient {
  data
  wallet
  receiveQueue
  types
  mode

  constructor() {
    this.wallet = ethers.Wallet.createRandom()
    this.receiveQueue = []
    this.data = { status: 'send' }
    this.started = false
  }

  // battle request to opponent
  async request(receiver_player_id) {
    safe_send({
      BattlePropose: {
        receiver_player_id: receiver_player_id,
        battle_pub_key: this.wallet.publicKey,
      },
    })
    this.data.opponent_id = receiver_player_id
    document.getElementById('acceptBattleCard').style.display = 'none'
    document.getElementById('wait_modal').style.display = 'flex'
  }

  // accept offered battle from opponent
  async accept(battle_id, proposer_player_id) {
    safe_send({
      BattleAccept: {
        battle_id: battle_id,
        battle_pub_key: battle.wallet.publicKey,
      },
    })
    this.data.opponent_id = proposer_player_id
    console.log(this.data)
    document.getElementById('acceptBattleCard').style.display = 'none'
    document.getElementById('wait_modal').style.display = 'flex'
  }

  async refuse(battle_id, proposer_player_id) {
    safe_send({
      RejectBattle: {
        proposer_player_id: proposer_player_id,
        battle_id: battle_id,
      },
    })
    console.log(this.data)
    document.getElementById('acceptBattleCard').style.display = 'none'
  }

  // start battle (move fund to battle contract)
  async start(battle_id, op_pub_key) {
    if (battle_id === 'bot')
      var battleInfo = {
        expires_at: Date.now() + 60 * 1000 * 999,
        player_pk: [this.wallet.publicKey, this.wallet.publicKey],
        manager_pk: this.wallet.publicKey,
        players_account: [window.wallet.accountId, 'bot'],
      }
    else
      var battleInfo = {
        expires_at: Date.now() + 60 * 1000 * 999,
        player_pk: [this.wallet.publicKey, op_pub_key],
        manager_pk: this.wallet.publicKey,
        players_account: [window.wallet.accountId, 'bot'],
      }
    //   var battleInfo = await window.wallet.viewMethod({
    //     contractId: window.collection,
    //     method: 'get_battle',
    //     args: { battle_id: battle_id },
    //   })

    battleInfo.player_pk.sort()

    var my_index

    if (battleInfo.player_pk[0] === this.wallet.publicKey) my_index = 0
    else if (battleInfo.player_pk[1] === this.wallet.publicKey) my_index = 1
    else return false

    this.battleState = new BattleState(battleInfo)

    this.data = {
      battleId: battle_id,
      opponent_id: this.data.opponent_id,
      mode: 'channel',
      oldBattleState: '',
      my_index: my_index,
      op_commit: '',
      op_commit_signature: '',
      status: 'send',
      actions: [],
      manager_signature: '',
      op_pk: battleInfo.player_pk[1 - my_index],
      manager_pk: battleInfo.manager_pk,
      my_sk: this.wallet.privateKey,
      player_init_lp: this.battleState.player_lp,
      pick_until: 0,
    }

    // this.types = await window.wallet.viewMethod({
    //   contractId: window.collection,
    //   method: 'get_types',
    //   args: {},
    // })
    resume_data.battle_data = this.data
    resume_data.battle_data.battle_state = this.battleState.write()
    resume_data.playerUrl = playerUrl
    resume_data.token_id = tokenId
    sessionStorage.setItem('resume-data', JSON.stringify(resume_data))

    // location.reload()

    // moving funds to battle contract
    await window.wallet.callMethod({
      contractId: FT_CONTRACT,
      method: 'ft_transfer_call',
      args: {
        receiver_id: BATTLE_CONTRACT,
        amount: BET_AMOUNT,
        msg: JSON.stringify({
          battle_id: battle_id,
          player_index: my_index,
        }),
      },
      deposit: 1,
    })

    this.started = true
    return true
  }

  resume(data) {
    this.data = data
    this.battleState = new BattleState(data.battle_state)
    delete this.data['battle_state']
    setInterval(() => this.timer(), 1000)
    this.started = true
    this.wallet = new ethers.Wallet(this.data.my_sk)

    document.getElementById('skill_box_temp').style.display = 'block'
    document.getElementById('wait_modal').style.display = 'none'

    document.getElementById('selectTypeBtn').addEventListener('click', (e) => {
      console.log('버튼 클릭됨', selectedSkill, selectedDefenceSkills)
      if (selectedSkill.length < 3 || selectedDefenceSkills.length < 3) {
        alert('You have to choose 3 skills each.')
        return
      }
      document.getElementById('skill_box_temp').style.display = 'none'
      // 내 스킬타입 확정
      this.chooseAction({
        attacks: selectedSkill,
        defences: selectedDefenceSkills,
      })
      sessionStorage.removeItem('resume-data')
    })
  }

  getPlayerAction(index) {
    return this.battleState.player_skills[index][
      this.data.actions[index].action_index
    ]
  }

  chooseAction(action) {
    console.log(action)
    if (action.attacks === undefined) {
      this.data.actions[this.data.my_index] = {
        action_index: parseInt(action),
        random_number: Math.floor(Math.random() * 1000000000),
      }
      if (this.data.battleId === 'bot')
        if (action < 3)
          this.data.actions[1 - this.data.my_index] = {
            action_index: Math.floor(Math.random() * 3) + 3,
            random_number: Math.floor(Math.random() * 1000000000),
          }
        else if (action < 6)
          this.data.actions[1 - this.data.my_index] = {
            action_index: Math.floor(Math.random() * 3),
            random_number: Math.floor(Math.random() * 1000000000),
          }
        else
          this.data.actions[1 - this.data.my_index] = {
            action_index: action,
            random_number: Math.floor(Math.random() * 1000000000),
          }
    } else {
      this.data.actions[this.data.my_index] = {
        attacks: action.attacks,
        defences: action.defences,
        random_number: Math.floor(Math.random() * 1000000000),
      }
    }
    this.sendCommit()
  }

  isMyAttack() {
    return this.battleState.attacker_index === this.data.my_index
  }

  async endBattle() {
    // var player_state = this.data.battleState.player_state
    // var my_index = this.data.my_index
    // // player win
    // if (player_state[my_index].hp !== 0 && player_state[1 - my_index].hp === 0)
    //   await window.wallet.callMethod({
    //     contractId: BATTLE_CONTRACT,
    //     method: 'close_battle',
    //     args: {
    //       battle_id: this.data.battleId,
    //     },
    //   })
    // sessionStorage.removeItem('resume-data')
  }

  timer() {
    if (this.data.mode === 'channel') this.receive()
    else return // TODO
  }

  async receive() {
    console.log(this.data.status)
    if (this.data.status === 'send') return

    // if last consensused state is expired -> this moved to chain
    // if (this.data.oldBattleState.expires_at < Date.now()) {
    //   console.log(Date.now())
    //   this.data.mode = 'chain'
    //   return
    // }
    // console.log(this.data.oldBattleState.expires_at - Date.now())

    var msg = this.receiveQueue.shift()
    if (msg === undefined) return
    console.log(msg)
    if (this.data.status === 'commit') {
      this.data.status = 'send'
      this.receiveCommit(msg)
    } else if (this.data.status === 'reveal') {
      this.data.status = 'send'
      await this.receiveAction(msg)
    } else if (this.data.status === 'state') {
      this.data.status = 'send'
      await this.receiveStateSignature(msg)
    }

    // resume_data.battle_data = this.data
    // resume_data.playerUrl = playerUrl
    // resume_data.token_id = tokenId
    // sessionStorage.setItem('resume-data', JSON.stringify(resume_data))
  }

  async sendCommit() {
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
    var signature = await this.wallet.signMessage(message)
    console.log(this.data.mode)
    if (this.data.mode === 'channel') {
      if (this.data.battleId === 'bot') {
        var commit = await ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes(
            JSON.stringify(this.data.actions[1 - this.data.my_index])
          )
        )
        var a = new Uint8Array([this.battleState.sequence])
        var b = ethers.utils.arrayify(commit)
        var message = new Uint8Array(a.length + b.length)
        message.set(a)
        message.set(b, a.length)
        var signature = await this.wallet.signMessage(message)
        this.receiveQueue.push(
          JSON.stringify({ commit: commit, signature: signature })
        )
      } else {
        if (this.battleState.sequence === 0)
          safe_send({
            BattleCommitReady: {
              battle_id: this.data.battleId,
              signature: signature,
              message: {
                hashed_message: commit,
                sequence: this.battleState.sequence,
              },
            },
          })
        else
          safe_send({
            BattleCommitAction: {
              battle_id: this.data.battleId,
              signature: signature,
              message: {
                hashed_message: commit,
                sequence: this.battleState.sequence,
              },
            },
          })
      }
    } else {
      // send to chain
      await window.wallet.callMethod({
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
    this.data.status = 'commit'
  }

  // channel only
  receiveCommit(commit) {
    console.log('receive commit')
    commit = JSON.parse(commit)
    var signature = commit.signature
    var a = new Uint8Array([this.battleState.sequence])
    var b = ethers.utils.arrayify(commit.hashed_message)
    var message = new Uint8Array(a.length + b.length)
    message.set(a)
    message.set(b, a.length)
    var addr = ethers.utils.verifyMessage(message, signature)
    var op_addr = ethers.utils.computeAddress(this.data.op_pk)
    if (addr === op_addr) {
      this.data.op_commit = commit.hashed_message
      this.data.op_commit_signature = signature
      this.sendAction()
      return
    } else {
      console.log('error receive commit')
      return
    }
  }

  async sendAction() {
    console.log('send action')
    var action = this.data.actions[this.data.my_index]
    if (this.data.mode === 'channel') {
      if (this.data.battleId === 'bot')
        this.receiveQueue.push(
          JSON.stringify(this.data.actions[1 - this.data.my_index])
        )
      else {
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
    } else {
      // send to chain
      await window.wallet.callMethod({
        contractId: BATTLE_CONTRACT,
        method: 'reveal',
        args: {
          battle_id: this.data.battle_id,
          player_index: this.data.my_index,
          action: action,
        },
      })
    }
    this.data.status = 'reveal'
  }

  // channel only
  async receiveAction(action) {
    console.log('receive action')
    action = JSON.parse(action)
    var commit = await ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(JSON.stringify(action))
    )
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
    console.log('send state')

    if (this.battleState.sequence === 0)
      this.battleState.setPlayerSkills(this.data.actions)
    else if (!this.battleState.doNext(this.data.actions)) {
      console.log('problem computing state')
      return false
    }
    var battleState = this.battleState.write()
    var message = await ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(JSON.stringify(battleState))
    )
    var signature = await this.wallet.signMessage(message)
    if (this.data.battleId === 'bot')
      this.receiveQueue.push(
        JSON.stringify({
          signature: signature,
          //   expires_at: Date.now() + 150 * 1000,
          expires_at: Date.now() + 1000 * 1000,
        })
      )
    else
      safe_send({
        BattleConsensusState: {
          battle_id: this.data.battleId,
          state: JSON.stringify(battleState),
          consensus_signature: signature,
        },
      })
    this.data.status = 'state'
  }

  // chain only (query chain to get battle)
  async getBattle() {
    // var res = await window.wallet.viewMethod({
    //   contractId: window.collection,
    //   method: 'get_battle',
    //   args: { battle_id: this.data.battleId },
    // })
    // this.data.battleState = res.battle_state
    // // TODO
  }

  // channel only
  async receiveStateSignature(msg) {
    console.log('receive state signature')
    msg = JSON.parse(msg)
    var signature = msg.consensus_signature
    // var expires_at = msg.expires_at
    var expires_at = Date.now() + 10000
    this.data.pick_until = Date.now() + 30 * 1000

    // next state is valid only until 2.5 minute from now
    // if (!(expires_at < Date.now() + 150 * 1000)) return
    if (!(expires_at < Date.now() + 1000 * 1000)) return
    var battleState = this.battleState.write()
    var message = await ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(JSON.stringify(battleState))
    )
    var addr = ethers.utils.verifyMessage(message, signature)
    var manager_addr = ethers.utils.computeAddress(this.data.op_pk)
    // if (addr === manager_addr) {
    if (true) {
      this.data.manager_signature = signature
      this.data.oldBattleState = JSON.parse(JSON.stringify(battleState))
      this.battleState.expires_at = expires_at
      if (this.battleState.sequence === 0) enterBattle()
      else {
        renderState(this.data, this.battleState)
        this.battleState.changeAttacker()
      }
      setUpNextSetting()
      this.battleState.addSequence()
      return true
    } else {
      return false
    }
  }
}

export const battle = new BattleClient()
