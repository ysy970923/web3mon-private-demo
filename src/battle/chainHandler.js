import { accounts } from '../data/accountsAndUrls'
import { ethers } from 'ethers'
import { wallet } from '../wallet/multi-wallet'
import { SKILL_INFOS } from '../data/skill'
import { hashMessage, signMessage, randInt } from './utils'
import { Skill } from './skills'
import { closeCard, showCard } from '../web/battleCard'

export class ChainHandler {
  battle_id
  keyManager
  selectedSequence
  action
  stage
  my_index
  send_at
  player_skills
  last_sequence
  last_attacker_index

  init(battle_id, sk, my_index, send_at, player_skills, last_sequence, last_attacker_index) {
    var player_skills_array = []
    player_skills.forEach((e) => {
      player_skills_array.push(e.write())
    })

    var msg = {
      battle_id: battle_id,
      sk: sk,
      my_index: my_index,
      stage: 'commit',
      send_at: send_at,
      selectedSequence: last_sequence + 1,
      action: { action_index: [-1, -1, -1, -1, -1], random_number: [randInt(), randInt(), randInt(), randInt(), randInt()] },
      player_skills: player_skills_array,
      last_sequence: last_sequence,
      last_attacker_index: last_attacker_index,
    }
    this.resume(msg)
  }

  write() {
    if (this.battle_id === undefined) return {}
    var player_skills = []
    this.player_skills.forEach((e) => {
      player_skills.push(e.write())
    })

    var msg = {
      battle_id: this.battle_id,
      sk: this.keyManager.privateKey,
      my_index: this.my_index,
      stage: this.stage,
      send_at: this.send_at,
      selectedSequence: this.selectedSequence,
      action: this.action,
      player_skills: player_skills,
      last_sequence: this.last_sequence,
      last_attacker_index: this.last_attacker_index
    }
    return msg
  }

  resume(msg) {
    if (msg.battle_id === undefined) return
    this.battle_id = msg.battle_id
    this.keyManager = new ethers.Wallet(msg.sk)
    this.my_index = msg.my_index
    this.stage = msg.stage
    this.send_at = msg.send_at
    this.selectedSequence = msg.selectedSequence
    this.action = msg.action
    this.player_skills = []
    msg.player_skills.forEach((e) => {
      var skill = new Skill(e.type)
      for (var key in skill.params) {
        skill.params[key] = e[key]
      }
      this.player_skills.push(skill)
    })
    this.last_sequence = msg.last_sequence
    this.last_attacker_index = msg.last_attacker_index
    this.setUpActionBox(msg.last_sequence)
  }

  setUpActionBox(last_sequence) {
    var div = document.getElementById('action_box_container')

    for (var i = 0; i < 5; i++) {
      var actionBox = document.createElement('div')
      actionBox.className = 'one_action_box'
      actionBox.value = last_sequence + i + 1
      actionBox.id = `chosen-${actionBox.value}`
      actionBox.onclick = (e) => {
        this.selectedSequence = e.currentTarget.value

        if (this.action.action_index[e.currentTarget.value] !== -1) {
          console.log('remove actionBox')
          this.action.action_index[e.currentTarget.value] = -1
          document.getElementById(`chosen-${e.currentTarget.value}`).innerHTML = ''
        }
      }
      div.append(actionBox)

      if (i < 4) {
        var arrow = document.createElement('span')
        arrow.className = 'right_arrow'
        arrow.innerHTML = '&#8680;'
        div.append(arrow)
      }
    }
    document.getElementById('multipleActionCard').style.display = 'block'
  }

  chooseSkills(skills) {
  }

  chooseAction(action) {
    console.log(this.player_skills)
    console.log(action)
    var skill = this.player_skills[action]
    if (
      !skill.check_availability(
        this.selectedSequence,
        this.my_index,
        this.last_attacker_index,
        this.last_sequence
      )
    ) {
      window.alert('skill is not allowed')
      return
    }

    this.action.action_index[this.selectedSequence] = parseInt(action)

    var skillType = this.player_skills[action].type
    document.getElementById(
      `chosen-${this.selectedSequence}`
    ).innerHTML = `<img src="../../img/skillThumbnails/${SKILL_INFOS[skillType].img}" />`
  }

  handle(current_time) {
    var time_left = this.send_at - current_time
    if (time_left < 0) {
      if (this.stage === 'commit') {
        this.stage = 'reveal'
        this.send_at = current_time + 60
        this.sendCommit()
      } else if (this.stage === 'reveal') {
        this.stage = 'done'
        this.sendReveal()
        return 'wait-finalize'
      }
    }
    return 'wait'
  }

  async sendCommit() {
    var hashed_message = hashMessage(JSON.stringify(this.action))

    var message = {
      hashed_message: hashed_message,
      sequence: this.last_sequence + 1,
    }
    var signingKey = this.keyManager._signingKey()
    var signature = signMessage(signingKey, JSON.stringify(message))
    var yes = async () => {
      closeCard()
      await wallet.callMethod({
        contractId: accounts.BATTLE_CONTRACT,
        method: 'commit',
        args: {
          battle_id: this.battle_id,
          player_index: this.my_index,
          commit: hashed_message,
          sig: signature,
        },
      })
    }
    showCard('Send Commit Tx', '<p>Send Commit Tx To Chain</p>', yes)
  }

  async sendReveal() {
    window.alert('send reveal to chain')

    await wallet.callMethod({
      contractId: accounts.BATTLE_CONTRACT,
      method: 'reveal',
      args: {
        battle_id: this.battle_id,
        player_index: this.my_index,
        actions: this.action,
      },
      deposit: 1,
    })
  }
}