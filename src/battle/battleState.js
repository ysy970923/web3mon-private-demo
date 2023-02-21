import { setBattleBackground } from './battleScene'
import {
  ATTACKS,
  DEFENCES,
  LastingEffect,
  LASTINGEFFECT,
  Skill,
  SKILLS,
} from './skills'

const P1 = 49003
const P2 = 56377
const P3 = 34501
const P4 = 53017
const P5 = 94379
const P6 = 74827
const P7 = 30809
const P8 = 29411
const P9 = 65089
const P10 = 84313

export class BattleState {
  expires_at
  sequence
  player_lp
  player_skills
  attacker_index
  defender_index
  lasting_effect
  constructor(info) {
    this.expires_at = info.expires_at
    this.sequence = info.sequence
    this.player_lp = [100, 100]
    this.player_skills = [[], []]
    this.attacker_index = undefined
    this.defender_index = undefined
    this.lasting_effect = []
    this.winner = undefined
  }

  write() {
    var player_skills = [[], []]
    for (var i = 0; i < 2; i++)
      this.player_skills[i].forEach((e) => {
        player_skills[i].push(e.write())
      })
    return {
      expires_at: this.expires_at,
      sequence: this.sequence,
      player_lp: this.player_lp,
      player_skills,
      attacker_index: this.attacker_index,
      defender_index: this.defender_index,
    }
  }

  setPlayerSkills(actions) {
    console.log(actions)
    for (var i = 0; i < 2; i++) {
      actions[i].attacks.forEach((j) => {
        this.player_skills[i].push(new Skill(ATTACKS[j]))
      })
      actions[i].defences.forEach((j) => {
        this.player_skills[i].push(new Skill(DEFENCES[j]))
      })
    }
    var random_number = actions[0].random_number + actions[1].random_number
    this.attacker_index = random_number % 2
    this.defender_index = 1 - this.attacker_index
    setBattleBackground(random_number % 5)
  }

  doNext(actions) {
    var action_indexes = [actions[0].action_index, actions[1].action_index]
    var random_number = actions[0].random_number + actions[1].random_number
    if (!this.checkSkillAvailability(action_indexes)) return false
    this.processSpecialEffect(action_indexes)
    this.createLastingEffect(action_indexes)
    var damage = this.calculateCombatDamage(action_indexes, random_number % P2)
    this.applyCombatDamage(damage)
    this.applyLastingEffectDamage()
    this.arrangeLastingEffect()
    this.skillPostProcessing(action_indexes)
    this.checkDeadPlayer()
    return true
  }

  addSequence() {
    this.sequence += 1
  }

  changeAttacker() {
    this.attacker_index = 1 - this.attacker_index
    this.defender_index = 1 - this.defender_index
  }
  checkSkillAvailability(action_indexes) {
    var atk_action_index = action_indexes[this.attacker_index]
    var def_action_index = action_indexes[this.defender_index]

    if (atk_action_index >= 3) return false
    if (def_action_index < 3) return false

    var atk_skill = this.player_skills[this.attacker_index][atk_action_index]
    var def_skill = this.player_skills[this.defender_index][def_action_index]

    if (atk_skill.available_turn_seq !== undefined) {
      if (this.sequence > atk_skill.available_turn_seq) return false
    }

    if (def_skill.available_turn_seq !== undefined) {
      if (this.sequence > def_skill.available_turn_seq) return false
    }

    return true
  }
  checkDeadPlayer() {
    if (this.player_lp[this.defender_index] === 0)
      this.winner = this.attacker_index
    if (this.player_lp[this.attacker_index] === 0)
      this.winner = this.defender_index
  }

  createLastingEffect(action_indexes) {
    for (var i = 0; i < 2; i++) {
      var action_index = action_indexes[i]
      var new_lasting_effect =
        this.player_skills[i][action_index].create_lasting_effect(i)
      if (new_lasting_effect != undefined)
        new_lasting_effect.forEach((e) => {
          this.lasting_effect.push(e)
        })
    }
  }

  processSpecialEffect(action_indexes) {
    console.log(this.player_skills)
    console.log(action_indexes)
    for (var i = 0; i < 2; i++) {
      var action_index = action_indexes[i]
      var new_special_effects =
        this.player_skills[i][action_index].create_special_effects(i)
      if (new_special_effects != undefined)
        new_special_effects.forEach((e) => {
          this.applySpecialEffect(e, i)
        })
    }
  }

  applySpecialEffect(effect, caster_idx) {
    if (effect.name === 'Cleanse') this.lasting_effect = []
    else if (effect.name === 'SelfHealing') {
      var healed_hp = Math.min(
        this.player_lp[caster_idx] + effect.params.recovery_lp,
        100
      )
      this.player_lp[caster_idx] = healed_hp
    } else if (effect.name === 'Reflection') {
      this.player_lp[1 - caster_idx] = Math.min(
        this.player_lp[1 - caster_idx] - effect.params.reflect_damage,
        0
      )
    }
  }

  // TODO: nullify and multiple
  calculateCombatDamage(action_indexes, random_number) {
    var atk_skill =
      this.player_skills[this.attacker_index][
        action_indexes[this.attacker_index]
      ]
    var def_skill =
      this.player_skills[this.defender_index][
        action_indexes[this.defender_index]
      ]
    var attack_damage = atk_skill.calculate_attack_damage()
    console.log(atk_skill)
    var total_damage = def_skill.calculate_damage(attack_damage, random_number)
    console.log(total_damage)
    return total_damage
  }

  applyLastingEffectDamage() {
    this.lasting_effect.forEach((e) => {
      switch (e.name) {
        case LASTINGEFFECT.ContinuousAttack:
          var target_idx = 1 - e.caster_idx
          this.player_lp[target_idx] -= e.damage
          break

        case LASTINGEFFECT.DelayedAttack:
          var target_idx = 1 - e.caster_idx
          if (e.delayed_turn === 1) {
            this.player_lp[target_idx] -= e.damage
          }
          break
      }
    })
  }

  arrangeLastingEffect() {
    this.lasting_effect.forEach((e) => {
      e.minus_left_turn()
    })
    this.lasting_effect = this.lasting_effect.filter((e) => e.left_turn())
  }

  skillPostProcessing(action_indexes) {
    var def_skill =
      this.player_skills[this.defender_index][
        action_indexes[this.defender_index]
      ]
    switch (def_skill.name) {
      case SKILLS.PowShield:
        var lasting_effect = new LastingEffect(LASTINGEFFECT.DelayedAttack, {
          damage: def_skill.absorbed_damage,
          delayed_turn: 1,
          remain_turn: 1,
          caster_idx: this.defender_index,
        })
        this.lasting_effect.push(lasting_effect)
        break
    }
  }

  applyCombatDamage(damage) {
    this.player_lp[this.defender_index] = Math.max(
      this.player_lp[this.defender_index] - damage,
      0
    )
  }
}
