import { Sprite } from './Sprite'
import { gsap } from 'gsap'

export class Monster extends Sprite {
  constructor({
    image,
    frames = { max: 1, hold: 10 },
    sprites,
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
        x: 650,
        y: 100,
      }
    else
      position = {
        x: 250,
        y: 305,
      }
    super({
      position,
      image,
      frames,
      sprites,
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
}
