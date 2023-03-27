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
import { random_success_nullify_defence, battleLog } from './utils'

export class BattleState {
  expires_at
  sequence
  player_lp
  player_skills
  attacker_index
  defender_index
  lasting_effect
  background
  winner

  init(state_info) {
    this.expires_at = state_info.current_turn_expired_at
    this.sequence = state_info.game_turn_sequence
    this.player_lp = state_info.player_lp

    this.player_skills = [[], []]
    for (var i = 0; i < 2; i++)
      state_info.player_skills[i].forEach((e) => {
        var skill = new Skill(e.type)
        for (var key in skill.params) {
          skill.params[key] = e.params[key]
        }
        this.player_skills[i].push(skill)
      })
    this.player_skills = state_info.player_skills
    this.attacker_index = state_info.attacker_index
    this.defender_index = state_info.defender_index

    this.lasting_effect = []
    state_info.lasting_effect.forEach((e) => {
      var type = e.type
      var params = e
      delete params.type
      var lasting_effect = new LastingEffect(type, params)
      this.lasting_effect.push(lasting_effect)
    })
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
    this.background = random_number % 5
    setBattleBackground(this.background)
  }

  doNext(actions) {
    this.addSequence()
    var action_indexes = [actions[0].action_index, actions[1].action_index]
    var random_number = actions[0].random_number + actions[1].random_number
    if (!this.checkSkillAvailability(action_indexes)) return false
    this.processSpecialEffect(action_indexes)
    this.checkDeadPlayer()
    if (this.winner !== undefined) return true

    this.createLastingEffect(action_indexes)
    var damage = this.calculateCombatDamage(action_indexes, random_number)
    this.applyCombatDamage(damage)
    this.checkDeadPlayer()
    if (this.winner !== undefined) return true

    this.applyLastingEffectDamage()
    this.checkDeadPlayer()
    if (this.winner !== undefined) return true

    this.arrangeLastingEffect()
    this.skillPostProcessing(action_indexes)
    this.checkDeadPlayer()
    this.changeAttacker()
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

    // return (
    //   atk_skill.check_availability(this.sequence, this.attacker_index) &&
    //   def_skill.check_availability(this.sequence, this.defender_index)
    // )
    return true
  }

  checkDeadPlayer() {
    if (this.player_lp[this.defender_index] <= 0)
      this.winner = this.attacker_index
    if (this.player_lp[this.attacker_index] <= 0)
      this.winner = this.defender_index
  }

  createLastingEffect(action_indexes) {
    for (var i = 0; i < 2; i++) {
      var action_index = action_indexes[i]
      var new_lasting_effect =
        this.player_skills[i][action_index].create_lasting_effect(i)
      battleLog(new_lasting_effect)
      if (new_lasting_effect !== undefined)
        new_lasting_effect.forEach((e) => {
          this.lasting_effect.push(e)
        })
      battleLog(this.lasting_effect)
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
    battleLog(effect)
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

    this.lasting_effect.forEach((effect) => {
      switch (effect.type) {
        case LASTINGEFFECT.NullifySkill:
          if (effect.params.caster_idx === this.defender_index) {
            var nullify_is_success = random_success_nullify_defence(
              random_number,
              effect.params.probability
            )
            if (nullify_is_success) {
              battleLog(effect)
              return 0
            }
          }
      }
    })

    this.lasting_effect.forEach((effect) => {
      switch (effect.type) {
        case LASTINGEFFECT.DamageMultiple:
          if (effect.params.caster_idx === this.attacker_index) {
            total_damage *= effect.params.multiplier
          }
      }
    })

    battleLog(total_damage)
    return total_damage
  }

  applyLastingEffectDamage() {
    this.lasting_effect.forEach((effect) => {
      switch (effect.type) {
        case LASTINGEFFECT.ContinuousAttack:
          var target_idx = 1 - effect.params.caster_idx
          this.player_lp[target_idx] -= effect.params.damage
          battleLog(effect)
          break

        case LASTINGEFFECT.DelayedAttack:
          var target_idx = 1 - effect.params.caster_idx
          if (effect.params.delayed_turn === 1) {
            this.player_lp[target_idx] -= effect.params.damage
            battleLog(effect)
          }
          break
      }
    })
  }

  arrangeLastingEffect() {
    battleLog(this.lasting_effect)
    this.lasting_effect.forEach((effect) => {
      effect.minus_left_turn()
    })
    battleLog(this.lasting_effect)
    this.lasting_effect = this.lasting_effect.filter((effect) =>
      effect.left_turn()
    )
    battleLog(this.lasting_effect)
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
        battleLog(lasting_effect)
        break
    }
  }

  applyCombatDamage(damage) {
    this.player_lp[this.defender_index] =
      this.player_lp[this.defender_index] - damage
  }
}
