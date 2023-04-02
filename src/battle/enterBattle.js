import { gsap } from 'gsap'
import {
  initBattle,
  battleBackground,
} from './battleScene'
import { animate } from '../animate'
import { addBattleSkillBox } from './initialSetting'
import { battleRenderedSprites } from '../js/global'
import { showBattleEnterScreen } from '../web/battleEnterScreen'

export let battleAnimationId
let previousTime

/**
 * battle animation start logic
 * @param {any} animationId idk
 */
export function enterBattle(battleState, my_index, opponent_id) {
  console.log('enter battle')
  document.getElementById('skill_box_temp').style.display = 'none'
  addBattleSkillBox(battleState, my_index)
  const animationId = window.requestAnimationFrame(animate)
  // deactivate current animation loop
  window.cancelAnimationFrame(animationId)

  gsap.to('#overlappingDiv', {
    opacity: 1,
    repeat: 3,
    yoyo: true,
    duration: 0.1,
    onComplete() {
      gsap.to('#overlappingDiv', {
        opacity: 1,
        duration: 0.1,
        onComplete() {
          // activate a new animation loop
          showBattleEnterScreen(opponent_id, my_index, battleState)
          initBattle(opponent_id, battleState, my_index)
          animateBattle()
          gsap.to('#overlappingDiv', {
            opacity: 0,
            duration: 0.1,
          })
        },
      })
    },
  })
}

export function animateBattle() {
  battleAnimationId = window.requestAnimationFrame(animateBattle)

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

  var newTime = performance.now()
  if (previousTime === undefined) previousTime = newTime
  var passedTime = newTime - previousTime
  previousTime = newTime

  battleBackground.draw(passedTime)

  for (const key in battleRenderedSprites) {
    battleRenderedSprites[key].draw(passedTime)
  }
}