import { Sprite } from '../object/Sprite'
import { gsap } from 'gsap'
import { battle } from './battleClient'
import { random_success_defence } from './utils'

export const LASTINGEFFECT = {
  ContinuousAttack: 'ContinuousAttack',
  DelayedAttack: 'DelayedAttack',
  DamageMultiple: 'DamageMultiple',
  NullifySkill: 'NullifySkill',
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
          success_count: 0,
          base_damage: 25,
          multiplier: 150,
        }
        frame = 14
        renderType = SKILL_RENDER_TYPE.ON_RECEIVER
        this.atkOrDef = 'atk'
        break
      case SKILLS.CelsiusExplosion:
        this.params = {
          base_damage: 20,
        }
        frame = 8
        renderType = SKILL_RENDER_TYPE.ON_RECEIVER
        this.atkOrDef = 'atk'
        break
      case SKILLS.BlockOfFud:
        this.params = {
          base_damage: 18,
        }
        frame = 15
        renderType = SKILL_RENDER_TYPE.ON_RECEIVER
        this.atkOrDef = 'atk'
        break
      case SKILLS.Hacked:
        this.params = {
          base_damage: 20,
          recovery_lp: 15,
        }
        frame = 13
        renderType = SKILL_RENDER_TYPE.ON_RECEIVER
        this.atkOrDef = 'atk'
        break
      case SKILLS.FTTTsunami:
        this.params = {
          base_damage: 20,
        }
        frame = 13
        renderType = SKILL_RENDER_TYPE.ON_RECEIVER
        position = {}
        this.atkOrDef = 'atk'
        break
      case SKILLS.FallOfVoyager:
        this.params = {
          available_turn_seq: 2,
          base_damage: 40,
        }
        frame = 9
        renderType = SKILL_RENDER_TYPE.ON_RECEIVER
        this.atkOrDef = 'atk'
        break
      case SKILLS.HardForkArrow:
        this.params = {
          base_damage: 0,
          last_turn_damage: 0,
        }
        frame = 12
        renderType = SKILL_RENDER_TYPE.ON_RECEIVER
        this.atkOrDef = 'atk'
        break
      case SKILLS.ShortSelling:
        this.params = {
          base_damage: 15,
        }
        frame = 10
        renderType = SKILL_RENDER_TYPE.ON_RECEIVER
        this.atkOrDef = 'atk'
        break
      case SKILLS.PowShield:
        this.params = {
          base_shield: 15, // 15
          absorbed_damage: 0,
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
          defence_probability: 33, //0.33
          defence_proportion: 100, //1
        }
        frame = 8
        renderType = SKILL_RENDER_TYPE.ON_CASTER
        this.atkOrDef = 'def'
        break
      case SKILLS.WithdrawalCloak:
        this.params = {
          defence_probability: 0, //0.33
          defence_proportion: 0, //1
        }
        frame = 10
        renderType = SKILL_RENDER_TYPE.ON_CASTER
        this.atkOrDef = 'def'
        break
      case SKILLS.ProofOfReserve:
        this.params = {
          reflection_probability: 33, //0.33
          reflection_proportion: 100, //1
          //   reflect_damage: 0,
        }
        frame = 12
        renderType = SKILL_RENDER_TYPE.ON_CASTER
        this.atkOrDef = 'def'
        break
      case SKILLS.BTCArmor:
        this.params = {
          available_turn_seq: 2,
          defence_probability: 33, //0.33
          defence_proportion: 100, //1
        }
        frame = 8
        renderType = SKILL_RENDER_TYPE.ON_CASTER
        this.atkOrDef = 'def'
        break
      case SKILLS.SelfCustody:
        this.params = {
          defence_probability: 33, //1
          defence_proportion: 100, //1
          recovery_lp: 10,
        }
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

  check_availability(sequence, caster_idx) {
    console.log('seauence is', sequence)
    if (this.params.available_turn_seq !== undefined)
      if (sequence > this.params.available_turn_seq) return false

    var attacker_index = battle.battleState.attacker_index
    if ((sequence - battle.battleState.sequence) % 2 === 0) {
      attacker_index = 1 - attacker_index
    }
    if (attacker_index === caster_idx) {
      if (this.atkOrDef === 'def') return false
    } else {
      if (this.atkOrDef === 'atk') return false
    }
    return true
  }

  create_lasting_effect(caster_idx) {
    switch (this.type) {
      case SKILLS.CelsiusExplosion:
        return [
          new LastingEffect(LASTINGEFFECT.DamageMultiple, {
            multiplier: 2,
            remain_turn: 2,
            caster_idx,
          }),
        ]
      case SKILLS.ShortSelling:
        return [
          new LastingEffect(LASTINGEFFECT.ContinuousAttack, {
            damage: 15,
            remain_turn: 2,
            caster_idx,
          }),
          new LastingEffect(LASTINGEFFECT.NullifySkill, {
            probability: 50,
            remain_turn: 2,
            caster_idx,
          }),
        ]
      default:
        return undefined
    }
  }
  create_special_effects(caster_idx) {
    switch (this.type) {
      case SKILLS.Hacked:
        return [
          new SpecialEffect('SelfHealing', {
            recovery_lp: this.params.recovery_lp,
          }),
        ]
      case SKILLS.GraceOfCz:
        return [new SpecialEffect('Cleanse', {})]
      case SKILLS.SelfCustody:
        return [
          new SpecialEffect('SelfHealing', {
            recovery_lp: this.params.recovery_lp,
          }),
        ]
      default:
        return undefined
    }
  }

  calculate_attack_damage() {
    if (this.type === 'DeathSpiral') {
      if (this.params.success_count === 3) {
        battle.event(`multiplied by ${this.params.multiplier}`)
        return Math.floor(
          (this.params.base_damage * this.params.multiplier) / 100
        )
      }
    } else if (this.type === 'HardForkArrow') {
      battle.event(`return last turn damage ${this.params.last_turn_damage}`)
      return this.params.last_turn_damage + this.params.base_damage
    }
    return this.params.base_damage
  }

  calculate_damage(attack_skill_damage, random_number) {
    if (this.type === 'PowShield') {
      this.params.absorbed_damage = Math.min(
        attack_skill_damage,
        this.params.base_shield
      )
      battle.event(`absorb damage ${this.params.absorbed_damage}`)
      return Math.max(attack_skill_damage - this.params.base_shield, 0)
    } else if (this.type === 'MergeWall') {
      return probabilitic_damage(
        attack_skill_damage,
        this.params.defence_probability,
        this.params.defence_proportion,
        random_number
      )
    } else if (this.type === 'AuditField') {
      return probabilitic_damage(
        attack_skill_damage,
        this.params.defence_probability,
        this.params.defence_proportion,
        random_number
      )
    } else if (this.type === 'GraceOfCz') {
      return probabilitic_damage(
        attack_skill_damage,
        this.params.defence_probability,
        this.params.defence_proportion,
        random_number
      )
    } else if (this.type === 'WithdrawalCloak') {
      return attack_skill_damage
    } else if (this.type === 'ProofOfReserve') {
      //   if (random_number < this.params.reflection_probability)
      // this.params.reflect_damage = multPercentage(
      //   this.params.reflection_proportion,
      //   attack_skill_damage
      // )
      //   else this.params.reflect_damage = 0
      //   return attack_skill_damage - this.params.reflect_damage
      return attack_skill_damage
    } else if (this.type === 'BTCArmor') {
      return probabilitic_damage(
        attack_skill_damage,
        this.params.defence_probability,
        this.params.defence_proportion,
        random_number
      )
    } else if (this.type === 'SelfCustody') {
      return probabilitic_damage(
        attack_skill_damage,
        this.params.defence_probability,
        this.params.defence_proportion,
        random_number
      )
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
