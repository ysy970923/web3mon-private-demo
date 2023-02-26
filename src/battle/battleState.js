import { setBattleBackground } from './battleScene'
import {
  ATTACKS,
  DEFENCES,
  LastingEffect,
  LASTINGEFFECT,
  Skill,
  SKILLS,
} from './skills'
import { battle } from './battleClient'

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
  winner
  constructor(info) {
    this.expires_at = info.current_turn_expired_at
    this.sequence = info.game_turn_sequence
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
    var lasting_effect = []
    this.lasting_effect.forEach((e) => {
      lasting_effect.push(e.write())
    })
    return {
      player_lp: this.player_lp,
      player_skills,
      attacker_index: this.attacker_index,
      defender_index: this.defender_index,
      lasting_effect,
      game_turn_sequence: this.sequence,
      current_turn_expired_at: this.expires_at,
    }
  }

  setPlayerSkills(actions) {
    this.addSequence()
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
    this.addSequence()
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

    var atk_skill = this.player_skills[this.attacker_index][atk_action_index]
    var def_skill = this.player_skills[this.defender_index][def_action_index]

    atk_skill.check_availability(this.sequence, this.attacker_index)
    def_skill.check_availability(this.sequence, this.defender_index)

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
    battle.event(effect)
    if (effect.type === 'Cleanse') this.lasting_effect = []
    else if (effect.type === 'SelfHealing') {
      var healed_hp = Math.min(
        this.player_lp[caster_idx] + effect.params.recovery_lp,
        100
      )
      this.player_lp[caster_idx] = healed_hp
    }
    // else if (effect.type === 'Reflection') {
    //   this.player_lp[1 - caster_idx] = Math.min(
    //     this.player_lp[1 - caster_idx] - effect.params.reflect_damage,
    //     0
    //   )
    // }
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
    var total_damage = def_skill.calculate_damage(attack_damage, random_number)
    battle.event(total_damage)
    return total_damage
  }

  applyLastingEffectDamage() {
    this.lasting_effect.forEach((effect) => {
      switch (effect.params.type) {
        case LASTINGEFFECT.ContinuousAttack:
          var target_idx = 1 - effect.caster_idx
          this.player_lp[target_idx] -= effect.params.damage
          battle.event(effect)
          break

        case LASTINGEFFECT.DelayedAttack:
          var target_idx = 1 - effect.caster_idx
          if (effect.params.delayed_turn === 1) {
            this.player_lp[target_idx] -= effect.params.damage
            battle.event(effect)
          }
          break
      }
    })
  }

  arrangeLastingEffect() {
    this.lasting_effect.forEach((effect) => {
      effect.minus_left_turn()
    })
    this.lasting_effect = this.lasting_effect.filter((effect) => {
      effect.left_turn()
    })
  }

  skillPostProcessing(action_indexes) {
    var def_skill =
      this.player_skills[this.defender_index][
        action_indexes[this.defender_index]
      ]
    switch (def_skill.type) {
      case SKILLS.PowShield:
        var lasting_effect = new LastingEffect(LASTINGEFFECT.DelayedAttack, {
          damage: def_skill.params.absorbed_damage,
          delayed_turn: 1,
          remain_turn: 1,
          caster_idx: this.defender_index,
        })
        this.lasting_effect.push(lasting_effect)
        battle.event(lasting_effect)
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
