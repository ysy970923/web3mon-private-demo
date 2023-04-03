import { Sprite } from '../object/Sprite'
import { gsap } from 'gsap'
import { battle } from './battleClient'
import { battleLog, random_success_defence } from './utils'
import { SPECIALEFFECT, LASTINGEFFECT, SKILLS, SKILL_INFOS, SKILL_RENDER_TYPE } from '../data/skill'

export class LastingEffect {
  type
  params
  constructor(type, params) {
    this.type = type
    this.params = params
  }

  write() {
    var msg = {}
    msg.type = this.type
    for (var key in this.params) {
      msg[key] = this.params[key]
    }
    return msg
  }

  minus_left_turn() {
    this.params.remain_turn -= 1
  }

  left_turn() {
    return this.params.remain_turn > 0
  }
}

class SpecialEffect {
  type
  params
  constructor(type, params) {
    this.type = type
    this.params = params
  }

  nullify_check(skill) {
    if (this.type == SPECIALEFFECT.NullifyIfSkillIsIn) {
      for (var i in this.params.skill_list) {
        var s = this.params.skill_list[i]
        if (s === skill.type) {
          return true
        }
      }
    }
    return false
  }

  reflect_check(skill) {
    if (this.type === SPECIALEFFECT.ReflectIfOpSkillIsIn) {
      for (var i in this.params.skill_list) {
        var s = this.params.skill_list[i]
        if (s === skill.type) {
          return true
        }
      }
    }
    return false
  }
}

export class Skill {
  type
  params
  renderParam
  atkOrDef

  constructor(type) {
    this.type = type
    var spriteImg = new Image()
    spriteImg.src = `../img/Skills/${SKILL_INFOS[type].img}`
    var frame
    var renderType
    var position = { x: 0, y: 0 }

    switch (type) {
      case SKILLS.DeathSpiral:
        this.params = {
          base_damage: 10,
        }
        frame = 14
        renderType = SKILL_RENDER_TYPE.ON_RECEIVER
        this.atkOrDef = 'atk'
        break
      case SKILLS.CelsiusExplosion:
        this.params = {
          base_damage: 20,
          critical_multiplier: 3,
          critical_probability: 25,
        }
        frame = 8
        renderType = SKILL_RENDER_TYPE.ON_RECEIVER
        this.atkOrDef = 'atk'
        break
      case SKILLS.BlockOfFud:
        this.params = {
          base_damage: 20,
        }
        frame = 15
        renderType = SKILL_RENDER_TYPE.ON_RECEIVER
        this.atkOrDef = 'atk'
        break
      case SKILLS.Hacked:
        this.params = {
          base_damage: 20,
        }
        frame = 13
        renderType = SKILL_RENDER_TYPE.ON_RECEIVER
        this.atkOrDef = 'atk'
        break
      case SKILLS.FTTTsunami:
        this.params = {
          base_damage: 0,
          lasting_damage_on_me: 10,
          lasting_damage_on_op: 20,
        }
        frame = 13
        renderType = SKILL_RENDER_TYPE.ON_RECEIVER
        position = {}
        this.atkOrDef = 'atk'
        break
      case SKILLS.FallOfVoyager:
        this.params = {
          available_turn_seq: 4,
          base_damage: 20,
        }
        frame = 9
        renderType = SKILL_RENDER_TYPE.ON_RECEIVER
        this.atkOrDef = 'atk'
        break
      case SKILLS.HardForkArrow:
        this.params = {
          base_damage: 20,
          critical_multiplier: 2,
          critical_probability: 50,
        }
        frame = 12
        renderType = SKILL_RENDER_TYPE.ON_RECEIVER
        this.atkOrDef = 'atk'
        break
      case SKILLS.ShortSelling:
        this.params = {
          base_damage: 0,
          lasting_damage_on_op: 15,
        }
        frame = 10
        renderType = SKILL_RENDER_TYPE.ON_RECEIVER
        this.atkOrDef = 'atk'
        break
      case SKILLS.PowShield:
        this.params = {
          defence_ad: 0
        }
        frame = 4
        renderType = SKILL_RENDER_TYPE.ON_CASTER
        this.atkOrDef = 'def'
        break
      case SKILLS.MergeWall:
        this.params = {
          defence_probability: 50, //0.5
          defence_proportion: 50, //
        }
        frame = 8
        renderType = SKILL_RENDER_TYPE.ON_CASTER
        this.atkOrDef = 'def'
        break
      case SKILLS.AuditField:
        this.params = {
          defence_probability: 100, //1
          defence_proportion: 20, //02
        }
        frame = 9
        renderType = SKILL_RENDER_TYPE.ON_CASTER
        this.atkOrDef = 'def'
        break
      case SKILLS.GraceOfCz:
        this.params = {
          defence_probability: 10, //0.1
          defence_proportion: 100, //1
        }
        frame = 8
        renderType = SKILL_RENDER_TYPE.ON_CASTER
        this.atkOrDef = 'def'
        break
      case SKILLS.WithdrawalCloak:
        this.params = {
          lasting_damage_on_me: 8,
          lasting_damage_on_op: 10,
        }
        frame = 10
        renderType = SKILL_RENDER_TYPE.ON_CASTER
        this.atkOrDef = 'def'
        break
      case SKILLS.ProofOfReserve:
        this.params = {}
        frame = 12
        renderType = SKILL_RENDER_TYPE.ON_CASTER
        this.atkOrDef = 'def'
        break
      case SKILLS.BTCArmor:
        this.params = {
          available_turn_seq: 4,
          defence_probability: 50,
          defence_proportion: 100,
        }
        frame = 8
        renderType = SKILL_RENDER_TYPE.ON_CASTER
        this.atkOrDef = 'def'
        break
      case SKILLS.SelfCustody:
        this.params = {}
        frame = 7
        renderType = SKILL_RENDER_TYPE.ON_CASTER
        this.atkOrDef = 'def'
        break
    }

    this.renderParam = {
      sprite: new Sprite({
        position: {
          x: 0,
          y: 0,
        },
        frames: {
          max: frame,
          fps: 6,
        },
        animate: true,
        rotation: 0,
      }),
      frame: frame,
      type: renderType,
    }
    this.renderParam.sprite.setImage(spriteImg)
    this.renderParam.sprite.setScale(1.2)
  }

  check_availability(sequence, caster_idx, last_attacker_index, last_sequence) {
    console.log('sequence is', sequence)
    if (this.params.available_turn_seq !== undefined)
      if (sequence > this.params.available_turn_seq) return false

    if ((sequence - last_sequence) % 2 === 0) {
      last_attacker_index = 1 - last_attacker_index
    }
    if (last_attacker_index === caster_idx) {
      if (this.atkOrDef === 'def') return false
    } else {
      if (this.atkOrDef === 'atk') return false
    }
    return true
  }

  create_lasting_effect() {
    switch (this.type) {
      case SKILLS.DeathSpiral:
      case SKILLS.FallOfVoyager:
        return [
          new LastingEffect(LASTINGEFFECT.DamageMultiple, {
            multiplier: 2,
            remain_turn: 3,
            effect_on_caster: true,
          }),
          new LastingEffect(LASTINGEFFECT.DamageMultiple, {
            multiplier: 2,
            remain_turn: 3,
            effect_on_caster: false,
          }),
        ]
      case SKILLS.ShortSelling:
        return [
          new LastingEffect(LASTINGEFFECT.ContinuousAttack, {
            damage: this.params.lasting_damage_on_op,
            remain_turn: 3,
            effect_on_caster: false,
          }),
        ]
      case SKILLS.FTTTsunami:
      case SKILLS.WithdrawalCloak:
        return [
          new LastingEffect(LASTINGEFFECT.ContinuousAttack, {
            damage: this.params.lasting_damage_on_me,
            remain_turn: 3,
            effect_on_caster: true,
          }),
          new LastingEffect(LASTINGEFFECT.ContinuousAttack, {
            damage: this.params.lasting_damage_on_op,
            remain_turn: 3,
            effect_on_caster: false,
          }),
        ]
      default:
        return []
    }
  }
  create_special_effect() {
    switch (this.type) {
      case SKILLS.BlockOfFud:
        return [
          new SpecialEffect(SPECIALEFFECT.NullifyIfSkillIsIn, {
            skill_list: [SKILLS.GraceOfCz, SKILLS.ProofOfReserve],
            effect_on_caster: true
          }),
          new SpecialEffect(SPECIALEFFECT.NullifyIfSkillIsIn, {
            skill_list: [SKILLS.BTCArmor, SKILLS.WithdrawalCloak],
            effect_on_caster: false
          }),
        ]
      case SKILLS.Hacked:
        return [
          new SpecialEffect(SPECIALEFFECT.NullifyIfSkillIsIn, {
            skill_list: [SKILLS.BTCArmor, SKILLS.WithdrawalCloak],
            effect_on_caster: true
          }),
          new SpecialEffect(SPECIALEFFECT.NullifyIfSkillIsIn, {
            skill_list: [SKILLS.GraceOfCz, SKILLS.ProofOfReserve],
            effect_on_caster: false
          }),
        ]
      case SKILLS.HardForkArrow:
        return [
          new SpecialEffect(SPECIALEFFECT.Critical, {
            probability: this.params.critical_probability,
            multiplier: this.params.critical_multiplier,
            effect_on_caster: true
          }),
        ]
      case SKILLS.CelsiusExplosion:
        return [
          new SpecialEffect(SPECIALEFFECT.Critical, {
            probability: this.params.critical_probability,
            multiplier: this.params.critical_multiplier,
            effect_on_caster: true
          }),
        ]
      case SKILLS.GraceOfCz:
        return [
          new SpecialEffect(SPECIALEFFECT.Cleanse, { effect_on_caster: true }),
          new SpecialEffect(SPECIALEFFECT.Cleanse, { effect_on_caster: false })
        ]
      case SKILLS.ProofOfReserve:
        return [
          new SpecialEffect(SPECIALEFFECT.ReflectIfOpSkillIsIn, {
            op_skills: [SKILLS.FTTTsunami, SKILLS.FallOfVoyager],
            effect_on_caster: true
          }),
        ]
      case SKILLS.SelfCustody:
        return [
          new SpecialEffect(SPECIALEFFECT.Cleanse, {
            effect_on_caster: true,
          }),
        ]
      default:
        return []
    }
  }

  calculate_attack_damage() {
    return this.params.base_damage
  }

  calculate_damage(attack_skill_damage, random_number) {
    switch (this.type) {
      case SKILLS.PowShield:
        return Math.max(attack_skill_damage - this.params.defence_ad, 0)
      case SKILLS.MergeWall:
      case SKILLS.AuditField:
      case SKILLS.GraceOfCz:
      case SKILLS.BTCArmor:
        return probabilitic_damage(attack_skill_damage, this.params.defence_probability, this.params.defence_proportion, random_number)

      case SKILLS.WithdrawalCloak:
      case SKILLS.ProofOfReserve:
      case SKILLS.SelfCustody:
        return attack_skill_damage
    }
  }

  write() {
    var msg = {}
    msg.type = this.type
    for (var key in this.params) {
      msg[key] = this.params[key]
    }
    return msg
  }

  render(caster, receiver, renderedSprites) {
    switch (this.renderParam.type) {
      case SKILL_RENDER_TYPE.ON_CASTER:
        this.renderParam.sprite.position = {
          x:
            caster.position.x + 96 * 1.2 -
            this.renderParam.sprite.image.width / this.renderParam.frame / 2 - 60,
          y: caster.position.y + 96 * 1.2 - this.renderParam.sprite.image.height / 2 - 200,
        }
        break
      case SKILL_RENDER_TYPE.ON_RECEIVER:
        this.renderParam.sprite.position = {
          x:
            receiver.position.x + 96 * 1.2 -
            this.renderParam.sprite.image.width / this.renderParam.frame / 2 - 60,
          y: receiver.position.y + 96 * 1.2 - this.renderParam.sprite.image.height / 2 - 200,
        }
        break
    }
    renderedSprites[`${caster}${receiver}${this.type}`] =
      this.renderParam.sprite
    setTimeout(() => {
      delete renderedSprites[`${caster}${receiver}${this.type}`]
    }, 3000)
  }
}

function multPercentage(a, b) {
  return Math.floor((a * b) / 100)
}

function probabilitic_damage(
  attack_skill_damage,
  defence_probability,
  defence_proportion,
  random_number
) {
  var defence_is_success = random_success_defence(
    random_number,
    defence_probability
  )

  if (defence_is_success) {
    return (
      attack_skill_damage -
      Math.floor((attack_skill_damage * defence_proportion) / 100)
    )
  } else {
    return attack_skill_damage
  }
}
