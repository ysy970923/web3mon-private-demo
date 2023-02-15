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

  battleBackground.scale = Math.max(
    window.innerWidth / battleBackground.width,
    window.innerHeight / battleBackground.height
  )

  document.getElementById('battle_left_time').innerText = `00:${Math.floor(
    (battle.data.pick_until_time - Date.now()) / 1000
  )}`

  battleBackground.draw()

  if (queue.length > 0) {
    queue[0]()
    queue.shift()
  }

  for (const key in renderedSprites) {
    renderedSprites[key].draw()
  }
}
