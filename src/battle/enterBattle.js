import { gsap } from 'gsap'
import {
  initBattle,
  battleBackground,
  queue,
  renderedSprites,
} from './battleScene'
import { animate } from '../animate'
import { addBattleSkillBox } from './initialSetting'
import { battle } from './battleClient'
import { player, users } from '../user/user'
import { SKILL_DESCRIPTIONS } from './skills'

export let battleAnimationId

/**
 * battle animation start logic
 * @param {any} animationId idk
 */
export function enterBattle() {
  console.log('enter battle')
  document.getElementById('skill_box_temp').style.display = 'none'
  addBattleSkillBox()
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
          enterImageAnimation()
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

const enterImageAnimation = () => {
  document.getElementById('enter_img').src = player.nftUrl
  document.getElementById('opp_enter_img').src =
    users[battle.data.opponent_id].nftUrl
  document.getElementById('enter_collection').innerText = player.nftCollection
  document.getElementById('enter_name').innerText = player.name
  for (var i = 0; i < 3; i++) {
    var skillType =
      battle.battleState.player_skills[battle.data.my_index][i].type
    var desc_item = document.createElement('div')
    desc_item.setAttribute('class', 'desc_item')
    var skill_label = document.createElement('div')
    skill_label.setAttribute('class', 'skill_label')
    skill_label.innerText = `Attack ${i + 1}`
    desc_item.append(skill_label)
    var skill_img_container = document.createElement('div')
    skill_img_container.setAttribute('class', 'skill_img_container')
    var skill_img = document.createElement('img')
    skill_img.setAttribute('class', 'skill_img')
    skill_img.src = `../../img/skillThumbnails/${SKILL_DESCRIPTIONS[skillType].img}`
    skill_img_container.append(skill_img)
    desc_item.append(skill_img_container)
    document.getElementById('selected_attack_skills').append(desc_item)

    var skillType =
      battle.battleState.player_skills[battle.data.my_index][i + 3].type
    var desc_item = document.createElement('div')
    desc_item.setAttribute('class', 'desc_item')
    var skill_label = document.createElement('div')
    skill_label.setAttribute('class', 'skill_label')
    skill_label.innerText = `Attack ${i + 1}`
    desc_item.append(skill_label)
    var skill_img_container = document.createElement('div')
    skill_img_container.setAttribute('class', 'skill_img_container')
    var skill_img = document.createElement('img')
    skill_img.setAttribute('class', 'skill_img')
    skill_img.src = `../../img/skillThumbnails/${SKILL_DESCRIPTIONS[skillType].img}`
    skill_img_container.append(skill_img)
    desc_item.append(skill_img_container)
    document.getElementById('selected_defence_skills').append(desc_item)
  }

  for (var i = 0; i < 3; i++) {
    var skillType =
      battle.battleState.player_skills[1 - battle.data.my_index][i].type
    var desc_item = document.createElement('div')
    desc_item.setAttribute('class', 'desc_item')
    var skill_label = document.createElement('div')
    skill_label.setAttribute('class', 'skill_label')
    skill_label.innerText = `Attack ${i + 1}`
    desc_item.append(skill_label)
    var skill_img_container = document.createElement('div')
    skill_img_container.setAttribute('class', 'skill_img_container')
    var skill_img = document.createElement('img')
    skill_img.setAttribute('class', 'skill_img')
    skill_img.src = `../../img/skillThumbnails/${SKILL_DESCRIPTIONS[skillType].img}`
    skill_img_container.append(skill_img)
    desc_item.append(skill_img_container)
    document.getElementById('op_selected_attack_skills').append(desc_item)

    var skillType =
      battle.battleState.player_skills[1 - battle.data.my_index][i + 3].type
    var desc_item = document.createElement('div')
    desc_item.setAttribute('class', 'desc_item')
    var skill_label = document.createElement('div')
    skill_label.setAttribute('class', 'skill_label')
    skill_label.innerText = `Attack ${i + 1}`
    desc_item.append(skill_label)
    var skill_img_container = document.createElement('div')
    skill_img_container.setAttribute('class', 'skill_img_container')
    var skill_img = document.createElement('img')
    skill_img.setAttribute('class', 'skill_img')
    skill_img.src = `../../img/skillThumbnails/${SKILL_DESCRIPTIONS[skillType].img}`
    skill_img_container.append(skill_img)
    desc_item.append(skill_img_container)
    document.getElementById('op_selected_defence_skills').append(desc_item)
  }

  document.querySelector('#battle_enter').style.transition = 'all 0s ease-out'
  document.querySelector('#battle_enter').style.opacity = 1
  document.querySelector('#battle_enter').style.zIndex = 1000
  setTimeout(() => {
    document.querySelector('#battle_enter').style.transition =
      'all 1.2s ease-out'
    document.querySelector('#battle_enter').style.opacity = 0
    document.querySelector('#battle_enter').style.zIndex = -5
  }, 5000)
}
