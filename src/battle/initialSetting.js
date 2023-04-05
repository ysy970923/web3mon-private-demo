import { player, setPlayer, users } from '../user/user'
import { battle } from './battleClient'
import { initBattle } from './battleScene'
import { ATTACKS, DEFENCES, SKILL_INFOS } from '../data/skill'
/**
 * Choose which skill to bring in battle
 */
const skillBoxAdd = () => {

  let tooltip = document.createElement('div')
  tooltip.className = 'skill_hover_tooltip'
  tooltip.id = 'tooltip'

  let div = document.querySelector('.attack_skill_box')
  div.innerHTML = ''
  let attackSkills = []

  for (let i = 0; i < ATTACKS.length; i++) {
    let skillBox = document.createElement('div')
    var skillType = ATTACKS[i]
    skillBox.className = 'one_atk_skill_box'
    skillBox.innerHTML = `
      <img src="../../img/skillThumbnails/${SKILL_INFOS[skillType].img}" />
    `
    skillBox.setAttribute('skill_index', i)
    skillBox.setAttribute('skill_type', skillType)

    skillBox.onmouseover = (e) => {
      hoverTooltip(e.currentTarget, tooltip)
    }
    skillBox.onmouseleave = (e) => {
      tooltip.style.display = 'none'
    }

    skillBox.onclick = (e) => {
      battle.selectSkillBox(e.currentTarget, 'attacks')
    }

    attackSkills.push(skillBox)
  }
  attackSkills.forEach((doc) => {
    div.append(doc)
  })

  // defence add.
  let defdiv = document.querySelector('.defense_skill_box')
  defdiv.innerHTML = ''
  let defenceSkills = []

  for (let i = 0; i < DEFENCES.length; i++) {
    let skillBox = document.createElement('div')
    var skillType = DEFENCES[i]

    skillBox.className = 'one_atk_skill_box'
    skillBox.innerHTML = `
    <img src=".././../img/skillThumbnails/${SKILL_INFOS[skillType].img}" />
    `

    skillBox.setAttribute('skill_index', i)
    skillBox.setAttribute('skill_type', skillType)

    skillBox.onmouseover = (e) => {
      hoverTooltip(e.currentTarget, tooltip)
    }
    skillBox.onmouseleave = (e) => {
      tooltip.style.display = 'none'
    }

    skillBox.onclick = (e) => {
      battle.selectSkillBox(e.currentTarget, 'defences')
    }

    defenceSkills.push(skillBox)
  }
  defenceSkills.forEach((doc) => {
    defdiv.append(doc)
  })
}

export const removeBattleSkillBox = () => {
  let box = document.getElementById('battle_skills_attack')
  let box2 = document.getElementById('battle_skills_defense')

  box.innerHTML = ''
  box2.innerHTML = ''
}

// in game battle skill box
export const addBattleSkillBox = (battleState, my_index) => {
  let box = document.getElementById('battle_skills_attack')
  let box2 = document.getElementById('battle_skills_defense')

  box.innerHTML = ''
  box2.innerHTML = ''

  let tooltip = document.createElement('div')
  tooltip.className = 'battle_skill_hover_tooltip'
  tooltip.id = 'battle_tooltip'
  tooltip.style.width = '300px'

  let attackSkills = []
  let defenseSkills = []
  for (let i = 0; i < 3; i++) {
    let skillBox = document.createElement('div')
    var skillType =
      battleState.player_skills[my_index][i].type
    skillBox.className = `battle_one_skill a${i} atk_skill_buttons`
    skillBox.innerHTML = `
    <img src="../../img/skillThumbnails/${SKILL_INFOS[skillType].img}" />
    `
    skillBox.id = `Box-${skillType}`
    skillBox.setAttribute('value', i)
    skillBox.setAttribute('skill_type', skillType)
    skillBox.onmouseover = (e) => {
      hoverTooltip(e.currentTarget, tooltip)
    }
    skillBox.onmouseleave = (e) => {
      tooltip.style.display = 'none'
    }
    skillBox.onclick = (e) => {
      // 스킬 사용
      battle.chooseAction(e.currentTarget.getAttribute('value'))
      document.querySelector('#actionContent').innerText = SKILL_INFOS[e.currentTarget.getAttribute('skill_type')].name
      document.querySelector('#battlePopUpCard').style.display = 'flex'
      setTimeout(() => {
        document.querySelector('#battlePopUpCard').style.display = 'none'
      }, 3000)
    }

    attackSkills.push(skillBox)
  }

  // 방어 스킬들 넣기
  for (let i = 0; i < 3; i++) {
    let skillBox = document.createElement('div')
    var skillType =
      battleState.player_skills[my_index][i + 3].type
    skillBox.className = `battle_one_skill a${i} def_skill_buttons`
    skillBox.innerHTML = `
    <img src="../../img/skillThumbnails/${SKILL_INFOS[skillType].img}" />
    `
    skillBox.id = `Box-${skillType}`
    skillBox.setAttribute('value', i + 3)
    skillBox.setAttribute('skill_type', skillType)
    skillBox.onmouseover = (e) => {
      hoverTooltip(e.currentTarget, tooltip)
    }
    skillBox.onmouseleave = (e) => {
      tooltip.style.display = 'none'
    }
    skillBox.onclick = (e) => {
      // 스킬 사용
      battle.chooseAction(e.currentTarget.getAttribute('value'))
      document.querySelector('#actionContent').innerText = SKILL_INFOS[e.currentTarget.getAttribute('skill_type')].name
      document.querySelector('#battlePopUpCard').style.display = 'flex'
      setTimeout(() => {
        document.querySelector('#battlePopUpCard').style.display = 'none'
      }, 3000)
    }

    defenseSkills.push(skillBox)
  }

  attackSkills.forEach((doc) => {
    box.append(doc)
  })
  defenseSkills.forEach((doc) => {
    box2.append(doc)
  })
}

const hoverTooltip = (skillBox, tooltip) => {
  var skillType = skillBox.getAttribute('skill_type')
  var skill_info = SKILL_INFOS[skillType]
  tooltip.innerHTML = `<p><strong>${skill_info.name}</strong></p>`
  if (skill_info.atk)
    tooltip.innerHTML += `<p>ATK: ${skill_info.atk}</p>`
  if (skill_info.def)
    tooltip.innerHTML += `<p>DEF (Rate): ${skill_info.def}</p>`
  if (skill_info.effect) {
    tooltip.innerHTML += `<p>Effect: ${skill_info.effect}</p>`
    tooltip.innerHTML += `<p>${skill_info.effect_desc}</p>`
  }
  tooltip.style.display = 'flex'
  // if (type === 'defense') tooltip.style.bottom = '73px'
  // else tooltip.style.top = '73px'

  skillBox.append(tooltip)
}

skillBoxAdd()
