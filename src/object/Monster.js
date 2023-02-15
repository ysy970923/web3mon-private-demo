import { Sprite } from './Sprite'
import { gsap } from 'gsap'

export class Monster extends Sprite {
  constructor({
    frames = { max: 1, hold: 10 },
    animate = false,
    rotation = 0,
    name,
    health,
    isEnemy,
    skills,
  }) {
    var position
    if (isEnemy)
      position = {
        x: window.innerWidth * 0.9 - 200,
        y: window.innerHeight * 0.1 + 200,
      }
    else
      position = {
        x: window.innerWidth * 0.1 + 200,
        y: window.innerHeight * 0.9 - 200,
      }
    super({
      position,
      frames,
      animate,
      rotation,
      name,
    })
    this.initialHealth = health
    this.health = health
    this.isEnemy = isEnemy
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
    let healthBar = '#playerHealthBar'
    if (this.isEnemy) healthBar = '#enemyHealthBar'

    this.health = health
    gsap.to(healthBar, {
      width: (100 * this.health) / this.initialHealth + '%',
    })
  }

  draw() {
    if (this.isEnemy)
      super.position = {
        x: window.innerWidth * 0.9 - 200,
        y: window.innerHeight * 0.1 + 200,
      }
    else
      super.position = {
        x: window.innerWidth * 0.1 + 200,
        y: window.innerHeight * 0.9 - 200,
      }
    super.draw()
  }
}
