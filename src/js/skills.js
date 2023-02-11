import { Sprite } from '../object/Sprite'
import { gsap } from 'gsap'

const SKILLS = {
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
  WithdrawlsCloak: 'WithdrawlsCloak',
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
  SKILLS.WithdrawlsCloak,
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
  WithdrawlsCloak: {
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

class LastingEffect {
  name
  params
  constructor(name, params) {
    this.name = name
    this.params = params
  }
}

class SpecialEffect {
  name
  constructor(name, params) {
    this.name = name
    this.params = params
  }
}

export class Skill {
  name
  params
  renderParam

  constructor(name) {
    this.name = name
    var spriteImg = new Image()
    spriteImg.src = `../img/Skills/${SKILL_DESCRIPTIONS[name].img}`
    var frame
    var renderType

    switch (name) {
      case SKILLS.DeathSpiral:
        this.params = {
          cool_down: 0,
          success_count: 0,
          base_damage: 25,
          multiplier: 150,
        }
        frame = 14
        renderType = SKILL_RENDER_TYPE.ON_RECEIVER
        break
      case SKILLS.CelsiusExplosion:
        this.params = {
          cool_down: 0,
          base_damage: 20,
        }
        frame = 8
        renderType = SKILL_RENDER_TYPE.ON_RECEIVER
        break
      case SKILLS.BlockOfFud:
        this.params = {
          cool_down: 0,
          base_damage: 18,
        }
        frame = 15
        renderType = SKILL_RENDER_TYPE.ON_RECEIVER
        break
      case SKILLS.Hacked:
        this.params = {
          cool_down: 0,
          base_damage: 20,
          recovery_lp: 15,
        }
        frame = 13
        renderType = SKILL_RENDER_TYPE.ON_RECEIVER
        break
      case SKILLS.FTTTsunami:
        this.params = {
          cool_down: 0,
          base_damage: 20,
        }
        frame = 13
        renderType = SKILL_RENDER_TYPE.ON_RECEIVER
        break
      case SKILLS.FallOfVoyager:
        this.params = {
          cool_down: 0,
          available_turn_seq: 2,
          base_damage: 40,
        }
        frame = 9
        renderType = SKILL_RENDER_TYPE.ON_RECEIVER
        break
      case SKILLS.HardForkArrow:
        this.params = {
          cool_down: 0,
          base_damage: 0,
          last_turn_damage: 0,
        }
        frame = 12
        renderType = SKILL_RENDER_TYPE.ON_RECEIVER
        break
      case SKILLS.ShortSelling:
        this.params = {
          cool_down: 0,
          base_damage: 15,
        }
        frame = 10
        renderType = SKILL_RENDER_TYPE.ON_RECEIVER
        break
      case SKILLS.PowShield:
        this.params = {
          cool_down: 0,
          base_shield: 15, // 15
          absorbed_damage: 0,
        }
        frame = 4
        renderType = SKILL_RENDER_TYPE.ON_CASTER
        break
      case SKILLS.MergeWall:
        this.params = {
          cool_down: 0,
          defence_probability: 50, //0.5
          defence_proportion: 50, //
        }
        frame = 8
        renderType = SKILL_RENDER_TYPE.ON_CASTER
        break
      case SKILLS.AuditField:
        this.params = {
          cool_down: 0,
          defence_probability: 100, //1
          defence_proportion: 20, //02
        }
        frame = 9
        renderType = SKILL_RENDER_TYPE.ON_CASTER
        break
      case SKILLS.GraceOfCz:
        this.params = {
          cool_down: 0,
          defence_probability: 33, //0.33
          defence_proportion: 100, //1
        }
        frame = 8
        renderType = SKILL_RENDER_TYPE.ON_CASTER
        break
      case SKILLS.WithdrawlsCloak:
        this.params = {
          cool_down: 0,
          defence_probability: 0, //0.33
          defence_proportion: 0, //1
        }
        frame = 10
        renderType = SKILL_RENDER_TYPE.ON_CASTER
        break
      case SKILLS.ProofOfReserve:
        this.params = {
          cool_down: 0,
          reflection_probability: 33, //0.33
          reflection_proportion: 100, //1
          reflect_damage: 0,
        }
        frame = 12
        renderType = SKILL_RENDER_TYPE.ON_CASTER
        break
      case SKILLS.BTCArmor:
        this.params = {
          cool_down: 0,
          available_turn_seq: 2,
          defence_probability: 33, //0.33
          defence_proportion: 100, //1
        }
        frame = 8
        renderType = SKILL_RENDER_TYPE.ON_CASTER
        break
      case SKILLS.SelfCustody:
        this.params = {
          cool_down: 0,
          defence_probability: 33, //1
          defence_proportion: 100, //1
          recovery_lp: 10,
        }
        frame = 7
        renderType = SKILL_RENDER_TYPE.ON_CASTER
        break
    }

    this.renderParam = {
      sprite: new Sprite({
        position: {
          x: 0,
          y: 0,
        },
        image: spriteImg,
        frames: {
          max: frame,
          hold: 20,
        },
        animate: true,
        rotation: 0,
      }),
      frame: frame,
      type: renderType,
    }
  }
  create_lasting_effects(caster_idx) {
    if (this.name === 'DeathSpiral')
      return [
        new LastingEffect('DamageMultiple', {
          multiplier: 2,
          remain_turn: 2,
          caster_idx,
        }),
      ]
    if (this.name === 'ShortSelling')
      return [
        new LastingEffect('ContinuousAttack', {
          damage: 15,
          remain_turn: 2,
          caster_idx,
        }),
        new LastingEffect('NullifySkill', {
          probability: 50,
          remain_turn: 2,
          caster_idx,
        }),
      ]
    return undefined
  }
  create_special_effects(caster_idx) {
    if (this.name === 'Hacked')
      return [
        new SpecialEffect('SelfHealing', {
          recovery_lp: this.params.recovery_lp,
        }),
      ]
    if (this.name === 'GraceOfCz') return [new SpecialEffect('Cleanse', {})]
    if (this.name === 'SelfCustody')
      return [
        new SpecialEffect('SelfHealing', {
          recovery_lp: this.params.recovery_lp,
        }),
      ]
    if (this.name === 'ProofOfReserve') {
      return [
        new SpecialEffect('Reflection', {
          reflect_damage: this.params.reflect_damage,
        }),
      ]
    }
    return undefined
  }
  calculate_attack_damage() {
    if (this.name === 'DeathSpiral') {
      if (this.params.success_count == 3)
        return this.params.multiplier * this.params.base_damage
    } else if (this.name === 'HardForkArrow')
      return this.params.last_turn_damage + this.params.base_damage
    return this.params.base_damage
  }
  calculate_damage(attack_skill_damage, random_number) {
    if (this.name === 'PowShield') {
      this.params.absorbed_damage = Math.min(
        attack_skill_damage,
        this.params.base_shield
      )
      return Math.max(attack_skill_damage - this.params.base_shield, 0)
    } else if (this.name === 'MergeWall') {
      if (random_number < this.params.defence_probability)
        return (
          attack_skill_damage -
          multPercentage(this.params.defence_proportion, attack_skill_damage)
        )
      else return attack_skill_damage
    } else if (this.name === 'AuditField') {
      if (random_number < this.params.defence_probability)
        return (
          attack_skill_damage -
          multPercentage(this.params.defence_proportion, attack_skill_damage)
        )
      else return attack_skill_damage
    } else if (this.name === 'GraceOfCz') {
      if (random_number < this.params.defence_probability)
        return (
          attack_skill_damage -
          multPercentage(this.params.defence_proportion, attack_skill_damage)
        )
      else return attack_skill_damage
    } else if (this.name === 'WithdrawlsCloak') {
      return attack_skill_damage
    } else if (this.name === 'ProofOfReserve') {
      if (random_number < this.params.reflection_probability)
        this.params.reflect_damage = multPercentage(
          this.params.reflection_proportion,
          attack_skill_damage
        )
      else this.params.reflect_damage = 0
      return attack_skill_damage - this.params.reflect_damage
    } else if (this.name === 'BTCArmor') {
      if (random_number < this.params.defence_probability)
        return (
          attack_skill_damage -
          multPercentage(this.params.defence_proportion, attack_skill_damage)
        )
      else return attack_skill_damage
    } else if (this.name === 'SelfCustody') {
      if (random_number < this.params.defence_probability)
        return (
          attack_skill_damage -
          multPercentage(this.params.defence_proportion, attack_skill_damage)
        )
      else return attack_skill_damage
    }
  }

  write() {
    return this.params
  }

  render(caster, receiver, renderedSprites) {
    switch (this.renderParam.type) {
      case SKILL_RENDER_TYPE.ON_CASTER:
        this.renderParam.sprite.position = {
          x:
            caster.position.x -
            this.renderParam.sprite.image.width / this.renderParam.frame / 2 +
            100,
          y: caster.position.y - this.renderParam.sprite.image.height / 2,
        }
        gsap.to(this.renderParam.sprite.position, {
          duration: 3.0,
          onComplete: () => {
            renderedSprites.splice(1, 1)
          },
        })
        break
      case SKILL_RENDER_TYPE.ON_RECEIVER:
        this.renderParam.sprite.position = {
          x:
            receiver.position.x -
            this.renderParam.sprite.image.width / this.renderParam.frame / 2 +
            100,
          y: receiver.position.y - this.renderParam.sprite.image.height / 2,
        }
        gsap.to(this.renderParam.sprite.position, {
          duration: 3.0,
          onComplete: () => {
            renderedSprites.splice(1, 1)
          },
        })
        break
    }
    renderedSprites.splice(1, 0, this.renderParam.sprite)
  }
}

function multPercentage(a, b) {
  return Math.floor((a * b) / 100)
}
