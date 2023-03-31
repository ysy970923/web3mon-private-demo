import { setBattleBackground } from './battleScene'
import {
  ATTACKS,
  DEFENCES,
  LASTINGEFFECT,
  SPECIALEFFECT,
} from '../data/skill'
import { Skill, LastingEffect } from './skills'
import { battleLog, random_success_critical } from './utils'

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

    this.lasting_effect = [[], []]
    for (var i = 0; i < 2; i++) {
      state_info.lasting_effect[i].forEach((e) => {
        var type = e.type
        var params = e
        delete params.type
        var lasting_effect = new LastingEffect(type, params)
        this.lasting_effect[i].push(lasting_effect)
      })
    }
    this.winner = undefined
  }

  write() {
    var player_skills = [[], []]
    for (var i = 0; i < 2; i++)
      this.player_skills[i].forEach((e) => {
        player_skills[i].push(e.write())
      })
    var lasting_effect = [[], []]
    for (var i = 0; i < 2; i++) {
      this.lasting_effect[i].forEach((e) => {
        lasting_effect[i].push(e.write())
      })
    }
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

  do_next(actions) {
    this.addSequence()
    var action_indexes = [actions[0].action_index, actions[1].action_index]
    var random_number = actions[0].random_number + actions[1].random_number
    var attacker_skill_idx = action_indexes[this.attacker_index]
    var defender_skill_idx = action_indexes[this.defender_index]

    if (!this.checkSkillAvailability(action_indexes)) return false
    this.checkDeadPlayer()
    if (this.winner !== undefined) return true

    this.create_lasting_effect(attacker_skill_idx, defender_skill_idx)
    var special_effects = this.create_special_effect(attacker_skill_idx, defender_skill_idx)
    var damage = this.calculate_combat_damage(attacker_skill_idx, defender_skill_idx, random_number, special_effects)
    this.apply_combat_damage(damage)
    this.checkDeadPlayer()
    if (this.winner !== undefined) return true

    this.apply_lasting_effect_damage()
    this.checkDeadPlayer()
    if (this.winner !== undefined) return true

    this.arrange_lasting_effect()
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

  create_lasting_effect(attacker_skill_idx, defender_skill_idx) {
    var lasting_effect_vec = this.player_skills[this.attacker_index][attacker_skill_idx].create_lasting_effect()
    lasting_effect_vec.forEach((e) => {
      if (e.params.effect_on_caster)
        this.lasting_effect[this.attacker_index].push(e)
      else
        this.lasting_effect[this.defender_index].push(e)
    })

    var lasting_effect_vec = this.player_skills[this.defender_index][defender_skill_idx].create_lasting_effect()
    lasting_effect_vec.forEach((e) => {
      if (e.params.effect_on_caster)
        this.lasting_effect[this.defender_index].push(e)
      else
        this.lasting_effect[this.attacker_index].push(e)
    })

  }

  create_special_effect(attacker_skill_idx, defender_skill_idx) {
    var special_effects = [[], []]

    var special_effect_vec = this.player_skills[this.attacker_index][attacker_skill_idx].create_special_effect()
    special_effect_vec.forEach((e) => {
      if (e.params.effect_on_caster)
        special_effects[this.attacker_index].push(e)
      else
        special_effects[this.defender_index].push(e)
    })

    var special_effect_vec = this.player_skills[this.defender_index][defender_skill_idx].create_special_effect()
    special_effect_vec.forEach((e) => {
      if (e.params.effect_on_caster)
        special_effects[this.defender_index].push(e)
      else
        special_effects[this.attacker_index].push(e)
    })

    for (var i = 0; i < 2; i++) {
      special_effects[i].forEach((e) => {
        if (e.type === SPECIALEFFECT.Cleanse) {
          this.lasting_effect[i].length = 0
        }
      })
    }

    return special_effects
  }

  // TODO: nullify and multiple
  calculate_combat_damage(attacker_skill_idx, defender_skill_idx, random_number, special_effect) {
    var atk_skill = this.player_skills[this.attacker_index][attacker_skill_idx]
    var def_skill = this.player_skills[this.defender_index][defender_skill_idx]
    var attack_damage = atk_skill.calculate_attack_damage()
    var total_damage = def_skill.calculate_damage(attack_damage, random_number)

    // attack nullify
    for (var i in special_effect[this.attacker_index]) {
      var effect = special_effect[this.attacker_index][i]
      if (effect.nullify_check(def_skill)) {
        return 0
      }
    }

    // defence nullify
    for (var i in special_effect[this.defender_index]) {
      var effect = special_effect[this.defender_index][i]
      console.log(effect)
      if (effect.nullify_check(def_skill)) {
        console.log(effect)
        total_damage = attack_damage
        break
      }
    }

    // damage multiple
    for (var i in this.lasting_effect[this.attacker_index]) {
      var effect = this.lasting_effect[this.attacker_index][i]
      if (effect.type === LASTINGEFFECT.DamageMultiple) {
        total_damage *= effect.params.multiplier
      }
    }

    // critical hit
    for (var i in special_effect[this.attacker_index]) {
      var effect = special_effect[this.attacker_index][i]
      if (effect.type === SPECIALEFFECT.Critical) {
        if (random_success_critical(random_number, effect.params.probability)) {
          total_damage *= effect.params.multiplier
        }
      }
    }

    // reflect
    for (var i in special_effect[this.defender_index]) {
      var effect = special_effect[this.defender_index][i]
      if (effect.reflect_check(atk_skill)) {
        total_damage *= -1
        break
      }
    }

    battleLog(total_damage)
    return total_damage
  }

  apply_lasting_effect_damage() {
    for (var i = 0; i < 2; i++) {
      this.lasting_effect[i].forEach((effect) => {
        switch (effect.type) {
          case LASTINGEFFECT.ContinuousAttack:
            this.player_lp[i] -= effect.params.damage
            battleLog(effect)
            break
          default:
            break
        }
      })
    }
  }

  arrange_lasting_effect() {
    battleLog(this.lasting_effect)
    for (var i = 0; i < 2; i++) {
      this.lasting_effect[i].forEach((effect) => {
        effect.minus_left_turn()
      })
      this.lasting_effect[i] = this.lasting_effect[i].filter((effect) =>
        effect.left_turn()
      )
    }
    battleLog(this.lasting_effect)
  }

  apply_combat_damage(damage) {
    if (damage > 0)
      this.player_lp[this.defender_index] -= damage
    else
      this.player_lp[this.attacker_index] -= damage
  }
}
