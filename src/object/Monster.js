import { Sprite } from './Sprite'
import { gsap } from 'gsap'
import { addEffect } from '../web/battleNameTag'
import { LASTINGEFFECT } from '../data/skill'


const canvas = document.getElementById('game_canvas')

const canva = canvas.getContext('2d')

const chatBubble = new Image()
chatBubble.src = './../img/chatBubble2.png'

const bleedingImage = new Image()
bleedingImage.src = '../img/bleeding/near.png'

export class Monster extends Sprite {
  name
  me_or_op
  chat
  chatShowTime
  bleeding
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
    this.chat = ''
    this.chatShowTime = 0
    this.bleeding = new Sprite({
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      frames: {
        max: 19,
        fps: 6,
      },
      animate: true,
    })
    this.bleeding.setImage(bleedingImage)
    this.bleeding.opacity = 0
  }

  faint() {
    gsap.to(this.position, {
      y: this.position.y + 20,
    })
    gsap.to(this, {
      opacity: 0,
    })
  }

  showChat(chat) {
    this.chat = chat
    this.chatShowTime = 0
  }

  adjustHealth(health) {
    console.log(this.bleeding)
    let healthBar = `#${this.me_or_op}HealthBar`

    if (this.health > health) {
      this.bleeding.opacity = 1

      gsap.to(this.bleeding, {
        duration: 10.0,
        opacity: 0,
      })

      this.health = Math.max(health, 0)
      gsap.to(healthBar, {
        duration: 5.0,
        width: (100 * this.health) / this.initialHealth + '%',
      })
    }

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
      }
      addEffect(effect_img_src, this.me_or_op, title, description, effect_counter)
      effect_counter += 1
    })
  }

  draw(passedTime) {
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

    canva.fillStyle = 'black'
    canva.font = '30px "210L"'
    if (this.chat.length > 0) {
      var textWidth = canva.measureText(this.chat).width
      this.chatShowTime += 1
      canva.drawImage(
        chatBubble,
        this.position.x + 88,
        this.position.y - 70,
        300,
        160
      )

      canva.fillText(
        this.chat,
        this.position.x + textWidth / 2 + 100,
        this.position.y - 39
      )

      if (this.chatShowTime > 600) this.chat = ''
    }

    super.draw(passedTime)
    this.bleeding.draw(passedTime)

  }
}
