import { Sprite } from './Sprite'
import { gsap } from 'gsap'
import { LASTINGEFFECT } from '../battle/skills'
import { addEffect } from '../web/battleNameTag'

export class Monster extends Sprite {
  name
  me_or_op
  constructor({
    frames = { max: 1, fps: 6 },
    animate = false,
    rotation = 0,
    name,
    health,
    me_or_op,
    skills,
  }) {
    var position
    if (me_or_op === 'OP')
      position = {
        x: window.innerWidth * 0.7 - 96 * 1.5,
        y: window.innerHeight * 0.3 - 96 * 1.5,
      }
    else
      position = {
        x: window.innerWidth * 0.3 - 96 * 1.5,
        y: window.innerHeight * 0.7 - 96 * 1.5,
      }
    super({
      position,
      frames,
      animate,
      rotation,
    })
    this.name = name
    this.initialHealth = health
    this.health = health
    this.me_or_op = me_or_op
    this.skills = skills
  }

  faint() {
    gsap.to(this.position, {
      y: this.position.y + 20,
    })
    gsap.to(this, {
      opacity: 0,
    })
  }

  adjustHealth(health) {
    let healthBar = `#${this.me_or_op}HealthBar`

    this.health = health
    gsap.to(healthBar, {
      width: (100 * this.health) / this.initialHealth + '%',
    })
  }

  addEffects(effects) {
    var effect_counter = 0

    var effect_box = document.getElementById(`${this.me_or_op}EffectBox`)

    effect_box.innerHTML = ''

    effects.forEach((effect) => {
      var effect_img_src
      var title
      var description
      switch (effect.type) {
        case LASTINGEFFECT.ContinuousAttack:
          effect_img_src = '../../img/poison.png'
          title = 'Poison'
          description = 'Continuous Damage is given'
          break
        case LASTINGEFFECT.DamageMultiple:
          effect_img_src = '../../img/fire.jpg'
          title = 'Fire'
          description = 'Damage is multiplied'
          break
        case LASTINGEFFECT.DelayedAttack:
          effect_img_src = '../../img/bomb.jpg'
          title = 'Bomb'
          description = 'Delayed Damage is given'
          break
        case LASTINGEFFECT.NullifySkill:
          effect_img_src = '../../img/null.png'
          title = 'Null'
          description = 'Skill is nullified'
          break
      }
      addEffect(effect_img_src, this.me_or_op, title, description, effect_counter)
      effect_counter += 1
    })
  }

  draw() {
    if (this.me_or_op === 'OP')
      super.position = {
        x: window.innerWidth * 0.7 - 96 * 1.5,
        y: window.innerHeight * 0.3 - 96 * 1.5,
      }
    else
      super.position = {
        x: window.innerWidth * 0.3 - 96 * 1.5,
        y: window.innerHeight * 0.7 - 96 * 1.5,
      }
    super.draw()
  }
}
