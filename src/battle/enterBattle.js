import { gsap } from 'gsap'
import {
  initBattle,
  battleBackground,
  queue,
  renderedSprites,
} from './battleScene'
import { animate } from '../animate'
import { addBattleSkillBox } from '../web/initialSetting'
import { battle } from './battleClient'
export let battleAnimationId

/**
 * battle animation start logic
 * @param {any} animationId idk
 */
export function enterBattle() {
  console.log('enter battle')
  document.getElementById('skill_box_temp').style.display = 'none'
  addBattleSkillBox()
  document.getElementById('acceptBattleCard').style.display = 'none'
  const animationId = window.requestAnimationFrame(animate)
  // deactivate current animation loop
  window.cancelAnimationFrame(animationId)

  gsap.to('#overlappingDiv', {
    opacity: 1,
    repeat: 3,
    yoyo: true,
    duration: 0.4,
    onComplete() {
      gsap.to('#overlappingDiv', {
        opacity: 1,
        duration: 0.4,
        onComplete() {
          // activate a new animation loop
          initBattle()
          animateBattle()
          gsap.to('#overlappingDiv', {
            opacity: 0,
            duration: 0.4,
          })
        },
      })
    },
  })
}

export function animateBattle() {
  battleAnimationId = window.requestAnimationFrame(animateBattle)

  document.getElementById('battle_left_time').innerText = `00:${Math.floor(
    (battle.data.pick_until_time - Date.now()) / 1000
  )}`

  battleBackground.setScale(
    Math.max(
      window.innerWidth / battleBackground.image.width,
      window.innerHeight / battleBackground.image.height
    )
  )

  battleBackground.position = {
    x: window.innerWidth / 2 - battleBackground.width / 2,
    y: window.innerHeight / 2 - battleBackground.height / 2,
  }

  battleBackground.draw()

  if (queue.length > 0) {
    queue[0]()
    queue.shift()
  }

    for (const key in renderedSprites) {
      renderedSprites[key].draw()
    }
}
