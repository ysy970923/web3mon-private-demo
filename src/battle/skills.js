import { Sprite } from '../object/Sprite'
import { gsap } from 'gsap'
import { battle } from './battleClient'
import { battleLog, random_success_defence } from './utils'

export const LASTINGEFFECT = {
  ContinuousAttack: 'ContinuousAttack',
  DamageMultiple: 'DamageMultiple',
}

export const SPECIALEFFECT = {
  Cleanse: 'Cleanse',
  NullifyIfSkillIsIn: 'NullifyIfSkillIsIn',
  Critical: 'Critical',
  ReflectIfOpSkillIsIn: 'ReflectIfOpSkillIsIn',
}

export const SKILLS = {
  DeathSpiral: 'DeathSpiral',
  CelsiusExplosion: 'CelsiusExplosion',
  BlockOfFud: 'BlockOfFud',
  Hacked: 'Hacked',
  FTTTsunami: 'FTTTsunami',
  FallOfVoyager: 'FallOfVoyager',
  HardForkArrow: 'HardForkArrow',
  ShortSelling: 'ShortSelling',
  PowShield: 'PowShield',
  MergeWall: 'MergeWall',
  AuditField: 'AuditField',
  GraceOfCz: 'GraceOfCz',
  WithdrawalCloak: 'WithdrawalCloak',
  ProofOfReserve: 'ProofOfReserve',
  BTCArmor: 'BTCArmor',
  SelfCustody: 'SelfCustody',
}

export const ATTACKS = [
  SKILLS.DeathSpiral,
  SKILLS.CelsiusExplosion,
  SKILLS.BlockOfFud,
  SKILLS.Hacked,
  SKILLS.FTTTsunami,
  SKILLS.FallOfVoyager,
  SKILLS.HardForkArrow,
  SKILLS.ShortSelling,
]

export const DEFENCES = [
  SKILLS.PowShield,
  SKILLS.MergeWall,
  SKILLS.AuditField,
  SKILLS.GraceOfCz,
  SKILLS.WithdrawalCloak,
  SKILLS.ProofOfReserve,
  SKILLS.BTCArmor,
  SKILLS.SelfCustody,
]

export const SKILL_DESCRIPTIONS = {
  DeathSpiral: {
    name: 'Death Spiral',
    desc: 'Probabilistic (following a normal distribution) 25AD on average.\
    If the user has used the skill three times in a row and all of the skills have been successful, 25*1.5 (37.5)AD will be activated in the last third Attack. (Failure to Attack means not giving the opponent any AD)',
    img: 'death spiral.png',
  },
  CelsiusExplosion: {
    name: 'Celsius Explosion',
    desc: '20AD. All AD×2 modes for three turns, including the activation turn',
    img: 'celsius explosion.png',
  },
  BlockOfFud: {
    name: 'Block of Fud',
    desc: '18AD. If the skill user correctly guesses the defense skill that the opponent will use in the current turn, it nullifies the Defense used by the opponent or adds 50%AD(= 27AD)',
    img: 'block of fud.png',
  },
  Hacked: {
    name: 'Hacked',
    desc: '20AD. 15LP recovery',
    img: 'hacked.png',
  },
  FTTTsunami: {
    name: 'FTT Tsunami',
    desc: 'For the next three turns(including the current turn), 20AD is continuously given to the opponent. However, the user also receives 5AD for three turns, including the turn that activated the skill.',
    img: 'ftt tsunami.png',
  },
  FallOfVoyager: {
    name: 'Fall of Voyager',
    desc: '40AD. Only available within the first two turns of Attack since the game started. 33% activation rate.',
    img: 'fall of voyager.png',
  },
  HardForkArrow: {
    name: 'Hard Fork Arrow',
    desc: 'Received AD (AD of attack skill used by an opponent in the previous turn) + 15\
(Except for all other effects, it reflects the pure default AD of the Attack skill used by the opponent.)\
ex) If the opponent used <Hacked> on the previous turn, give the opponent 35AD.',
    img: 'hard fork arrow.png',
  },
  ShortSelling: {
    name: 'Short Selling ',
    desc: "For the next two turns(including the current turn), 15 AD is continuously given to the opponent. In addition, it completely nullifies the opponent's Attack/Defense only once out of two consecutive turns(including the current turn).",
    img: 'short selling.png',
  },
  PowShield: {
    name: 'POW Shield',
    desc: 'Creates a shield that absorbs up to 15AD.\
          On the next turn, the POW Shield explodes and reversely gives the AD absorbed on the previous turn to the opponent(up to 15AD).',
    img: 'pow shield.png',
  },
  MergeWall: {
    name: 'Merge Wall',
    desc: "Creates a wall that absorbs 50% of the opponent's AD during the current turn with a 50% activation rate.",
    img: 'merge wall.png',
  },
  AuditField: {
    name: 'Audit Field',
    desc: "Creates a field that absorbs 20% of the opponent's Attack immediately.",
    img: 'audit field.png',
  },
  GraceOfCz: {
    name: 'Grace of CZ',
    desc: 'Initialize all effects currently being activated in the game.\
33% activation rate to defend against all Attack from the opponent in the current turn.',
    img: 'grace of cz.png',
  },
  WithdrawalCloak: {
    name: 'Withdrawals Cloak',
    desc: 'For the next three turns(including the current turn), 15AD is continuously given to the opponent. However, the user also receives 5AD for the next three turns(including the current turn). On the last turn, it deals an additional 5AD(total 15 AD) to the opponent, and the effect ends.',
    img: 'withdrawls cloak.png',
  },
  ProofOfReserve: {
    name: 'Proof of Reserve',
    desc: 'At the current turn, the user consolidates an opponent with a 33 percent activation rate. When this skill is activated, the AD of the Attack skill used by the opponent is reversed to the opponent.',
    img: 'proof of reserve.png',
  },
  BTCArmor: {
    name: 'BTC Armor',
    desc: "Provide complete protection against opponent's Attack with a 33% activation rate. Only available within the first two turns of Defense since the game started.",
    img: 'btc armor.png',
  },
  SelfCustody: {
    name: 'Self Custody',
    desc: 'Defend all Attack skills and recover LP by 10.',
    img: 'self custody.png',
  },
}

const SKILL_RENDER_TYPE = {
  ON_CASTER: 0,
  ON_RECEIVER: 1,
  CASTER_TO_RECEIVER: 2,
}

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
    spriteImg.src = `../img/Skills/${SKILL_DESCRIPTIONS[type].img}`
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
    this.renderParam.sprite.setScale(1.5)
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
            caster.position.x + 96 * 1.5 -
            this.renderParam.sprite.image.width / this.renderParam.frame / 2 - 80,
          y: caster.position.y + 96 * 1.5 - this.renderParam.sprite.image.height / 2 - 240,
        }
        break
      case SKILL_RENDER_TYPE.ON_RECEIVER:
        this.renderParam.sprite.position = {
          x:
            receiver.position.x + 96 * 1.5 -
            this.renderParam.sprite.image.width / this.renderParam.frame / 2 - 80,
          y: receiver.position.y + 96 * 1.5 - this.renderParam.sprite.image.height / 2 - 240,
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
